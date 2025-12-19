import { SignJWT, jwtVerify } from 'jose';
import Stripe from 'stripe';

// Cloudflare Worker to serve master locksmith data from D1
// Exposes:
//   GET /api/master               -> full list (JSON)
//   GET /api/master?make=...&model=...&year=...&immo=...&fcc=... -> filtered JSON
//   (legacy aliases) /api/locksmith
// Uses D1 Database: locksmith_data

export interface Env {
  LOCKSMITH_KV: KVNamespace;
  LOCKSMITH_DB: D1Database;
  ASSETS_BUCKET: R2Bucket;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  STRIPE_PRICE_ID: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  JWT_SECRET: string;
  AI: any;
}

const MAKE_ASSETS: Record<string, { infographic?: string, pdf?: string, pdf_title?: string }> = {
  'bmw': { infographic: 'BMW infographic.png', pdf: 'BMW_Security_Mastery_The_Professional_Ladder.pdf', pdf_title: 'Security Mastery Guide' },
  'chrysler': { infographic: 'Chrysler infographic.png', pdf: 'CDJR_Security_Eras_Explained.pdf', pdf_title: 'Security Eras Explained' },
  'dodge': { infographic: 'Chrysler infographic.png', pdf: 'CDJR_Security_Eras_Explained.pdf', pdf_title: 'Security Eras Explained' },
  'jeep': { infographic: 'Chrysler infographic.png', pdf: 'CDJR_Security_Eras_Explained.pdf', pdf_title: 'Security Eras Explained' },
  'ram': { infographic: 'Chrysler infographic.png', pdf: 'CDJR_Security_Eras_Explained.pdf', pdf_title: 'Security Eras Explained' },
  'ford': { infographic: 'Ford key programming infographic.png', pdf: 'Ford_Key_Programming_Deep_Dive.pdf', pdf_title: 'Key Programming Deep Dive' },
  'lincoln': { infographic: 'Ford key programming infographic.png', pdf: 'Ford_Key_Programming_Deep_Dive.pdf', pdf_title: 'Key Programming Deep Dive' },
  'honda': { infographic: 'Honda 1998-2024 infographic.png', pdf: 'Honda_Immobilizer_Master_Guide.pdf', pdf_title: 'Immobilizer Master Guide' },
  'acura': { infographic: 'Honda 1998-2024 infographic.png', pdf: 'Honda_Immobilizer_Master_Guide.pdf', pdf_title: 'Immobilizer Master Guide' },
  'hyundai': { infographic: 'Hyundai infographic.png', pdf: 'Hyundai_Key_Programming_Field_Guide.pdf', pdf_title: 'Key Programming Field Guide' },
  'kia': { infographic: 'Hyundai infographic.png', pdf: 'Hyundai_Key_Programming_Field_Guide.pdf', pdf_title: 'Key Programming Field Guide' },
  'mazda': { infographic: 'Mazda Infographic.png' },
  'mercedes': { pdf: 'Mercedes_Locksmith_Codex.pdf', pdf_title: 'Locksmith Codex' },
  'nissan': { infographic: 'Nissan infographic.png', pdf: 'Nissan_Immobilizer_Systems_A_Professional_Guide.pdf', pdf_title: 'Immobilizer Systems Guide' },
  'infiniti': { infographic: 'Nissan infographic.png', pdf: 'Nissan_Immobilizer_Systems_A_Professional_Guide.pdf', pdf_title: 'Immobilizer Systems Guide' }
};

function textResponse(body: string, status = 200, contentType = "application/json") {
  return new Response(body, {
    status,
    headers: {
      "Content-Type": contentType,
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    },
  });
}

async function createInternalToken(user: any, secret: string) {
  const secretKey = new TextEncoder().encode(secret);
  return await new SignJWT({
    sub: user.id,
    email: user.email,
    name: user.name,
    is_pro: !!user.is_pro,
    picture: user.picture
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d') // Long session for simplicity
    .sign(secretKey);
}

async function verifyInternalToken(token: string, secret: string) {
  try {
    const secretKey = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, secretKey);
    return payload;
  } catch (e) {
    return null;
  }
}

async function getGoogleToken(code: string, clientId: string, clientSecret: string, redirectUri: string) {
  const tokenUrl = 'https://oauth2.googleapis.com/token';
  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    })
  });
  return await res.json();
}

async function getGoogleUser(accessToken: string) {
  const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  return await res.json();
}


export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") {
      return textResponse("", 204);
    }

    const path = url.pathname;

    // ==============================================
    // AUTHENTICATION
    // ==============================================

    // 1. Google Login Redirect
    if (path === "/api/auth/google") {
      const redirectUri = `${url.origin}/api/auth/callback`;
      const scope = "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email";
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${env.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent`;
      return Response.redirect(authUrl, 302);
    }

    // 2. Google Callback
    if (path === "/api/auth/callback") {
      try {
        const code = url.searchParams.get("code");
        if (!code) return textResponse("Missing code", 400);

        const redirectUri = `${url.origin}/api/auth/callback`;
        const tokenData: any = await getGoogleToken(code, env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, redirectUri);

        if (!tokenData.access_token) {
          return textResponse(JSON.stringify(tokenData), 400); // Debug error
        }

        const googleUser: any = await getGoogleUser(tokenData.access_token);

        // Upsert User in D1
        const existingUser = await env.LOCKSMITH_DB.prepare("SELECT * FROM users WHERE id = ?").bind(googleUser.id).first<any>();

        if (!existingUser) {
          await env.LOCKSMITH_DB.prepare(
            "INSERT INTO users (id, email, name, picture, created_at) VALUES (?, ?, ?, ?, ?)"
          ).bind(googleUser.id, googleUser.email, googleUser.name, googleUser.picture, Date.now()).run();
        } else {
          // Update details just in case
          await env.LOCKSMITH_DB.prepare(
            "UPDATE users SET email = ?, name = ?, picture = ? WHERE id = ?"
          ).bind(googleUser.email, googleUser.name, googleUser.picture, googleUser.id).run();
        }

        // Get final user state (checking is_pro)
        const user = await env.LOCKSMITH_DB.prepare("SELECT * FROM users WHERE id = ?").bind(googleUser.id).first<any>();

        // Create Session Cookie
        const sessionToken = await createInternalToken(user, env.JWT_SECRET || 'dev-secret');

        // Redirect to Frontend with Cookie
        const headers = new Headers();
        headers.set("Set-Cookie", `session=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000; Secure`);
        headers.set("Location", "/"); // Go back to home

        return new Response(null, { status: 302, headers });

      } catch (err: any) {
        return textResponse(JSON.stringify({ error: err.message }), 500);
      }
    }

    // 3. Get Current User
    if (path === "/api/user") {
      const cookieHeader = request.headers.get("Cookie");
      const sessionToken = cookieHeader?.split(';').find(c => c.trim().startsWith('session='))?.split('=')[1];

      if (!sessionToken) {
        return textResponse(JSON.stringify({ user: null }), 200);
      }

      const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
      if (!payload) {
        return textResponse(JSON.stringify({ user: null }), 200);
      }

      // Refresh data from DB to get latest is_pro status
      const user = await env.LOCKSMITH_DB.prepare("SELECT id, name, email, picture, is_pro FROM users WHERE id = ?").bind(payload.sub).first();

      return textResponse(JSON.stringify({ user }), 200);
    }

    // 4. Logout
    if (path === "/api/auth/logout") {
      const headers = new Headers();
      headers.set("Set-Cookie", `session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Secure`);
      return textResponse(JSON.stringify({ success: true }), 200, "application/json");
    }

    // 5. Sync Data (Frontend -> Cloud)
    if (path === "/api/sync" && request.method === "POST") {
      try {
        // Authenticate
        const cookieHeader = request.headers.get("Cookie");
        const sessionToken = cookieHeader?.split(';').find(c => c.trim().startsWith('session='))?.split('=')[1];
        if (!sessionToken) return textResponse("Unauthorized", 401);
        const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
        if (!payload || !payload.sub) return textResponse("Unauthorized", 401);
        const userId = payload.sub as string;

        const body: any = await request.json();
        const { inventory, logs } = body;

        // Sync Inventory
        if (Array.isArray(inventory)) {
          const stmt = env.LOCKSMITH_DB.prepare(`
            INSERT INTO inventory (user_id, item_key, type, qty, vehicle, amazon_link, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(user_id, item_key, type) DO UPDATE SET
            qty = excluded.qty,
            updated_at = excluded.updated_at
          `);
          const batch = inventory.map((item: any) => stmt.bind(
            userId, item.name, item.type, item.qty, item.vehicle, item.link, Date.now()
          ));
          if (batch.length > 0) await env.LOCKSMITH_DB.batch(batch);
        }

        // Sync Logs
        if (Array.isArray(logs)) {
          const stmt = env.LOCKSMITH_DB.prepare(`
            INSERT INTO job_logs (id, user_id, data, created_at)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(id) DO NOTHING
          `);
          // Generate an ID if needed, or use timestamp + random
          const batch = logs.map((log: any) => {
            const logId = log.id || `${log.timestamp}-${Math.random().toString(36).substr(2, 9)}`;
            return stmt.bind(logId, userId, JSON.stringify(log), log.created_at || Date.now());
          });
          if (batch.length > 0) await env.LOCKSMITH_DB.batch(batch);
        }

        return textResponse(JSON.stringify({ success: true, synced_at: Date.now() }), 200);

      } catch (err: any) {
        return textResponse(JSON.stringify({ error: err.message }), 500);
      }
    }

    // 6. Stripe Checkout
    if (path === "/api/stripe/checkout" && request.method === "POST") {
      try {
        // Authenticate
        const cookieHeader = request.headers.get("Cookie");
        const sessionToken = cookieHeader?.split(';').find(c => c.trim().startsWith('session='))?.split('=')[1];
        if (!sessionToken) return textResponse("Unauthorized", 401);
        const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
        if (!payload || !payload.sub) return textResponse("Unauthorized", 401);

        const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2025-01-27.acacia' as any });

        const session = await stripe.checkout.sessions.create({
          line_items: [
            {
              price: env.STRIPE_PRICE_ID,
              quantity: 1,
            },
          ],
          mode: 'payment',
          success_url: `${url.origin}/?upgrade=success`,
          cancel_url: `${url.origin}/?upgrade=cancel`,
          customer_email: payload.email as string,
          metadata: {
            user_id: payload.sub as string
          }
        });

        return textResponse(JSON.stringify({ url: session.url }), 200);

      } catch (err: any) {
        return textResponse(JSON.stringify({ error: err.message }), 500);
      }
    }


    // 7. Get AI Insights (Publicly accessible now)
    if (path === "/api/insights") {
      try {
        let userId = 'global'; // Default to global/guest

        // Try to get user context if logged in, but don't fail if not
        const cookieHeader = request.headers.get("Cookie");
        const sessionToken = cookieHeader?.split(';').find(c => c.trim().startsWith('session='))?.split('=')[1];
        if (sessionToken) {
          try {
            const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
            if (payload && payload.sub) userId = payload.sub as string;
          } catch (e) { /* ignore invalid token */ }
        }

        const latest = await env.LOCKSMITH_DB.prepare("SELECT * FROM insights WHERE user_id = ? OR user_id = 'global' ORDER BY created_at DESC LIMIT 1").bind(userId).first();
        return textResponse(JSON.stringify({ insight: latest }), 200);
      } catch (e: any) {
        return textResponse(JSON.stringify({ error: e.message }), 500);
      }
    }

    // 8. Test AI (Manual Trigger)
    if (path === "/api/test-ai") {
      const result = await runAIAnalysis(env);
      return textResponse(JSON.stringify(result), 200);
    }

    // Master Locksmith Data Endpoint - uses unified schema
    if (path === "/api/master" || path === "/api/locksmith") {
      try {
        const make = url.searchParams.get("make")?.toLowerCase();
        const model = url.searchParams.get("model")?.toLowerCase();
        const year = url.searchParams.get("year");
        const immo = url.searchParams.get("immo")?.toLowerCase();
        const fcc = url.searchParams.get("fcc")?.toLowerCase();
        const q = url.searchParams.get("q")?.toLowerCase();

        const limit = Math.min(parseInt(url.searchParams.get("limit") || "500", 10) || 500, 2000);
        const offset = parseInt(url.searchParams.get("offset") || "0", 10) || 0;

        const conditions: string[] = [];
        const params: (string | number)[] = [];

        // Filter out product descriptions stored as models
        conditions.push("v.model NOT LIKE '%Key Blank%'");
        conditions.push("v.model NOT LIKE '%Mechanical Key%'");
        conditions.push("v.model NOT LIKE '%Transponder Key%'");
        conditions.push("v.model NOT LIKE '%Fob Key%'");
        conditions.push("v.model NOT LIKE '%Smart Remote%'");
        conditions.push("v.model NOT LIKE '%Keyless Entry%'");
        conditions.push("v.model NOT LIKE '%Remote Key Fob%'");
        conditions.push("v.model NOT LIKE '%Flip Key%'");
        conditions.push("v.model NOT LIKE '%Key Remote%'");
        conditions.push("v.model NOT LIKE '% Button %'");  // Catches "5 Button Key" etc
        conditions.push("v.model NOT LIKE '%B w%'");  // Catches "5B w" truncated entries
        conditions.push("v.model NOT LIKE '%High Security%'");
        conditions.push("v.model NOT LIKE '%80 Bit%'");
        conditions.push("v.model NOT LIKE '%PEPS%'");
        conditions.push("v.model NOT LIKE '%Fobik%'");

        if (make) {
          conditions.push("LOWER(v.make) = ?");
          params.push(make);
        }
        if (model) {
          conditions.push("LOWER(v.model) LIKE ?");
          params.push(`%${model}%`);
        }
        if (year) {
          const y = parseInt(year, 10);
          if (!Number.isNaN(y)) {
            conditions.push("v.year_start <= ? AND v.year_end >= ?");
            params.push(y, y);
          }
        }
        if (immo) {
          conditions.push("LOWER(v.immobilizer_system) LIKE ?");
          params.push(`%${immo}%`);
        }
        if (fcc) {
          conditions.push("LOWER(v.fcc_id) LIKE ?");
          params.push(`%${fcc}%`);
        }
        if (q) {
          conditions.push("(LOWER(v.make) LIKE ? OR LOWER(v.model) LIKE ? OR LOWER(v.immobilizer_system) LIKE ? OR LOWER(v.fcc_id) LIKE ? OR LOWER(v.chip) LIKE ?)");
          params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

        // Count query - using unified vehicles table
        const countSql = `
          SELECT COUNT(*) as cnt 
          FROM vehicles v
          ${whereClause}
        `;
        const countResult = await env.LOCKSMITH_DB.prepare(countSql).bind(...params).first<{ cnt: number }>();
        const total = countResult?.cnt || 0;

        // Data query with full fields from unified vehicles table
        const dataSql = `
          SELECT 
            v.id, v.make, v.model,
            v.year_start, v.year_end, v.key_type, v.keyway, v.fcc_id, v.chip,
            v.frequency, v.immobilizer_system,
            v.lishi_tool, v.oem_part_number, v.aftermarket_part,
            v.buttons, v.battery, v.programming_method,
            v.pin_required, v.notes,
            v.confidence_score, v.source_name, v.source_url,
            v.mechanical_spec, v.spaces, v.depths, v.code_series, v.ignition_retainer, v.service_notes_pro,
            cr.technology as chip_technology, cr.bits as chip_bits, cr.description as chip_description
          FROM vehicles v
          LEFT JOIN chip_registry cr ON LOWER(v.chip) = LOWER(cr.chip_type)
          ${whereClause}
          ORDER BY v.make, v.model, v.year_start
          LIMIT ? OFFSET ?
        `;
        const dataResult = await env.LOCKSMITH_DB.prepare(dataSql).bind(...params, limit, offset).all();

        return new Response(JSON.stringify({ count: dataResult.results?.length || 0, total, rows: dataResult.results || [] }), {
          headers: {
            "content-type": "application/json",
            "Cache-Control": "public, max-age=300, stale-while-revalidate=60",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "*",
          },
        });
      } catch (err: any) {
        return textResponse(JSON.stringify({ error: err.message || "failed to load data" }), 500);
      }
    }

    // Lightweight immobilizer endpoint - uses unified schema
    if (path === "/api/immo") {
      const cache = caches.default;
      const cacheKey = new URL(request.url);
      cacheKey.searchParams.sort();
      const cached = await cache.match(cacheKey.toString());
      if (cached) return cached;

      try {
        const make = url.searchParams.get("make")?.toLowerCase() || "";
        const model = url.searchParams.get("model")?.toLowerCase() || "";
        const q = url.searchParams.get("q")?.toLowerCase() || "";
        const limit = Math.min(parseInt(url.searchParams.get("limit") || "300", 10) || 300, 1000);
        const offset = parseInt(url.searchParams.get("offset") || "0", 10) || 0;

        const conditions: string[] = [];
        const params: (string | number)[] = [];

        if (make) {
          conditions.push("LOWER(vm.make) = ?");
          params.push(make);
        }
        if (model) {
          conditions.push("LOWER(vm.model) LIKE ?");
          params.push(`%${model}%`);
        }
        if (q) {
          conditions.push("(LOWER(vm.make) LIKE ? OR LOWER(vm.model) LIKE ? OR LOWER(vv.immobilizer_system) LIKE ? OR LOWER(vv.chip) LIKE ?)");
          params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
        }
        // Only include rows with immobilizer data
        conditions.push("(vv.immobilizer_system IS NOT NULL AND vv.immobilizer_system != '')");

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

        // Count query
        const countSql = `
          SELECT COUNT(*) as cnt 
          FROM vehicles_master vm
          LEFT JOIN vehicle_variants vv ON vm.id = vv.vehicle_id
          ${whereClause}
        `;
        const countResult = await env.LOCKSMITH_DB.prepare(countSql).bind(...params).first<{ cnt: number }>();
        const total = countResult?.cnt || 0;

        // Data query
        const dataSql = `
          SELECT 
            vm.make, vm.model, vv.year_start, vv.year_end,
            vv.immobilizer_system, vv.key_type, vv.chip, vv.obd_program
          FROM vehicles_master vm
          LEFT JOIN vehicle_variants vv ON vm.id = vv.vehicle_id
          ${whereClause}
          ORDER BY vm.make, vm.model, vv.year_start
          LIMIT ? OFFSET ?
        `;
        const dataResult = await env.LOCKSMITH_DB.prepare(dataSql).bind(...params, limit, offset).all();
        const rows = dataResult.results || [];

        const resp = new Response(JSON.stringify({ total, rows }), {
          headers: {
            "content-type": "application/json",
            "Cache-Control": "public, max-age=300, stale-while-revalidate=60",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "*",
          },
        });
        await cache.put(cacheKey.toString(), resp.clone());
        return resp;
      } catch (err: any) {
        return textResponse(
          JSON.stringify({ error: err.message || "failed to load immobilizers" }),
          500
        );
      }
    }

    // Browse Database endpoint - uses unified schema
    if (path === "/api/browse") {
      try {
        const year = url.searchParams.get("year");
        const make = url.searchParams.get("make")?.toLowerCase() || "";
        const model = url.searchParams.get("model")?.toLowerCase() || "";
        const limit = Math.min(parseInt(url.searchParams.get("limit") || "100", 10) || 100, 500);
        const offset = parseInt(url.searchParams.get("offset") || "0", 10) || 0;

        const conditions: string[] = [];
        const params: (string | number)[] = [];

        // Allow all models to be returned, including descriptive ones from locksmith_data
        // Filter out only extremely generic or irrelevant entries if necessary
        // (Commented out legacy restrictive filters)
        /*
        conditions.push("v.model NOT LIKE '%Key Blank%'");
        conditions.push("v.model NOT LIKE '%Mechanical Key%'");
        conditions.push("v.model NOT LIKE '%Transponder Key%'");
        conditions.push("v.model NOT LIKE '%Fob Key%'");
        conditions.push("v.model NOT LIKE '%Smart Remote%'");
        */

        if (make) {
          conditions.push("LOWER(v.make) = ?");
          params.push(make);
        }
        if (model) {
          conditions.push("LOWER(v.model) LIKE ?");
          params.push(`%${model}%`);
        }
        if (year) {
          const y = parseInt(year, 10);
          conditions.push("v.year_start <= ? AND v.year_end >= ?");
          params.push(y, y);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

        // Count query using unified vehicles table
        const countSql = `
          SELECT COUNT(*) as cnt 
          FROM vehicles v
          ${whereClause}
        `;
        const countResult = await env.LOCKSMITH_DB.prepare(countSql).bind(...params).first<{ cnt: number }>();
        const total = countResult?.cnt || 0;

        // Data query using unified vehicles table
        const dataSql = `
          SELECT 
            v.id,
            v.make,
            v.model,
            v.year_start,
            v.year_end,
            v.key_type,
            v.keyway,
            v.fcc_id,
            v.chip,
            v.frequency,
            v.immobilizer_system,
            v.lishi_tool,
            v.oem_part_number,
            v.aftermarket_part,
            v.buttons,
            v.battery,
            v.programming_method,
            v.pin_required,
            v.notes,
            v.confidence_score,
            v.source_name,
            v.has_image,
            v.mechanical_spec,
            v.spaces,
            v.depths,
            v.code_series,
            v.ignition_retainer,
            v.service_notes_pro,
            cr.technology as chip_technology,
            cr.bits as chip_bits,
            cr.description as chip_description,
            pc.ilco_part,
            pc.strattec_part,
            pc.jma_part,
            pc.keydiy_part,
            pc.key_type as crossref_key_type,
            pc.notes as crossref_notes
          FROM vehicles v
          LEFT JOIN chip_registry cr ON LOWER(v.chip) = LOWER(cr.chip_type)
          LEFT JOIN part_crossref pc ON (
            LOWER(v.make) = LOWER(pc.make) AND 
            (v.fcc_id = pc.fcc_id OR v.oem_part_number = pc.oem_part)
          )
          ${whereClause}
          ORDER BY v.make, v.model, v.year_start
          LIMIT ? OFFSET ?
        `;
        const dataResult = await env.LOCKSMITH_DB.prepare(dataSql).bind(...params, limit, offset).all();

        return new Response(JSON.stringify({ total, rows: dataResult.results || [] }), {
          headers: {
            "content-type": "application/json",
            "Cache-Control": "public, max-age=300",
            "Access-Control-Allow-Origin": "*",
          },
        });
      } catch (err: any) {
        return textResponse(JSON.stringify({ error: err.message }), 500);
      }
    }

    // FCC Database endpoint - uses unified vehicles table
    if (path === "/api/fcc") {
      try {
        const q = url.searchParams.get("q")?.toLowerCase() || "";
        const limit = Math.min(parseInt(url.searchParams.get("limit") || "100", 10) || 100, 500);
        const offset = parseInt(url.searchParams.get("offset") || "0", 10) || 0;

        let whereClause = "WHERE fcc_id IS NOT NULL AND fcc_id != ''";
        const params: string[] = [];

        if (q) {
          whereClause += " AND (LOWER(fcc_id) LIKE ? OR LOWER(make) LIKE ? OR LOWER(model) LIKE ? OR LOWER(chip) LIKE ?)";
          params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
        }

        // Get unique FCC IDs with aggregated data from unified vehicles table
        const sql = `
          SELECT 
            fcc_id,
            MIN(frequency) as frequency,
            MIN(chip) as chip,
            GROUP_CONCAT(DISTINCT make || ' ' || model || ' (' || year_start || '-' || year_end || ')') as vehicles,
            MIN(oem_part_number) as primary_oem_part,
            MIN(make) as primary_make,
            MAX(has_image) as has_image,
            COUNT(*) as vehicle_count
          FROM vehicles
          ${whereClause}
          GROUP BY fcc_id
          ORDER BY fcc_id
          LIMIT ? OFFSET ?
        `;

        const countSql = `
          SELECT COUNT(DISTINCT fcc_id) as cnt 
          FROM vehicles
          ${whereClause}
        `;
        const countResult = await env.LOCKSMITH_DB.prepare(countSql).bind(...params).first<{ cnt: number }>();
        const total = countResult?.cnt || 0;

        const dataResult = await env.LOCKSMITH_DB.prepare(sql).bind(...params, limit, offset).all();

        return new Response(JSON.stringify({ total, rows: dataResult.results || [] }), {
          headers: {
            "content-type": "application/json",
            "Cache-Control": "public, max-age=300",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "*",
          },
        });
      } catch (err: any) {
        return textResponse(JSON.stringify({ error: err.message }), 500);
      }
    }

    // FCC Detail endpoint - returns all OEM parts with ASINs for a specific FCC ID
    if (path.startsWith("/api/fcc-detail/")) {
      try {
        const fccId = decodeURIComponent(path.split("/").pop() || "");
        if (!fccId) {
          return textResponse(JSON.stringify({ error: "FCC ID required" }), 400);
        }

        // Get FCC info from registry
        const fccInfo = await env.LOCKSMITH_DB.prepare(
          "SELECT * FROM fcc_registry WHERE fcc_id = ?"
        ).bind(fccId).first();

        // Get all OEM parts with their ASINs for this FCC ID from unified vehicles table
        const oemParts = await env.LOCKSMITH_DB.prepare(`
          SELECT DISTINCT
            oem_part_number,
            amazon_asin,
            make,
            model,
            year_start,
            year_end,
            key_type,
            frequency,
            chip,
            buttons,
            battery,
            has_image
          FROM vehicles
          WHERE UPPER(fcc_id) = UPPER(?)
          ORDER BY make, model, year_start
        `).bind(fccId).all();

        // Group by OEM part number for cleaner output
        const oemMap = new Map<string, any>();
        for (const row of (oemParts.results || []) as any[]) {
          const oem = row.oem_part_number || 'unknown';
          if (!oemMap.has(oem)) {
            oemMap.set(oem, {
              oem_part_number: oem,
              amazon_asin: row.amazon_asin,
              vehicles: [],
              // chip and buttons are already set above if needed, but here we are constructing the map value
              frequency: row.frequency,
              chip: row.chip,
              buttons: row.buttons,
              battery: row.battery,
              has_image: row.has_image
            });
          }
          oemMap.get(oem).vehicles.push({
            make: row.make,
            model: row.model,
            year_start: row.year_start,
            year_end: row.year_end,
            key_type: row.key_type
          });
        }

        return new Response(JSON.stringify({
          fcc_id: fccId,
          fcc_info: fccInfo,
          oem_parts: Array.from(oemMap.values()),
          total_vehicles: oemParts.results?.length || 0
        }), {
          headers: {
            "content-type": "application/json",
            "Cache-Control": "public, max-age=300",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "*",
          },
        });
      } catch (err: any) {
        return textResponse(JSON.stringify({ error: err.message }), 500);
      }
    }

    // Lishi Tools endpoint - decoder/pick tool compatibility data
    if (path === "/api/lishi") {
      try {
        const q = url.searchParams.get("q")?.toLowerCase() || "";
        const category = url.searchParams.get("category")?.toLowerCase() || "";
        const make = url.searchParams.get("make")?.toLowerCase() || "";
        const limit = Math.min(parseInt(url.searchParams.get("limit") || "100", 10) || 100, 500);

        const conditions: string[] = [];
        const params: string[] = [];

        if (q) {
          conditions.push("(LOWER(tool_model) LIKE ? OR LOWER(vehicle_makes) LIKE ? OR LOWER(vehicle_models) LIKE ? OR LOWER(keyway) LIKE ? OR LOWER(notes) LIKE ?)");
          params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
        }
        if (category) {
          conditions.push("LOWER(category) = ?");
          params.push(category);
        }
        if (make) {
          conditions.push("LOWER(vehicle_makes) LIKE ?");
          params.push(`%${make}%`);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

        const countResult = await env.LOCKSMITH_DB.prepare(`SELECT COUNT(*) as cnt FROM lishi_tools ${whereClause}`).bind(...params).first<{ cnt: number }>();
        const total = countResult?.cnt || 0;

        const dataSql = `SELECT * FROM lishi_tools ${whereClause} ORDER BY category, tool_model LIMIT ?`;
        const dataResult = await env.LOCKSMITH_DB.prepare(dataSql).bind(...params, limit).all();

        return new Response(JSON.stringify({ total, rows: dataResult.results || [] }), {
          headers: {
            "content-type": "application/json",
            "Cache-Control": "public, max-age=3600",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "*",
          },
        });
      } catch (err: any) {
        return textResponse(JSON.stringify({ error: err.message }), 500);
      }
    }

    // Key Blanks Cross-Reference endpoint - Ilco, Strattec, Silca data
    if (path === "/api/key-blanks") {
      try {
        const make = url.searchParams.get("make")?.toLowerCase() || "";
        const model = url.searchParams.get("model")?.toLowerCase() || "";
        const year = parseInt(url.searchParams.get("year") || "0", 10);
        const ilco = url.searchParams.get("ilco")?.toLowerCase() || "";
        const strattec = url.searchParams.get("strattec")?.toLowerCase() || "";
        const q = url.searchParams.get("q")?.toLowerCase() || "";
        const limit = Math.min(parseInt(url.searchParams.get("limit") || "100", 10) || 100, 500);
        const offset = parseInt(url.searchParams.get("offset") || "0", 10) || 0;

        const conditions: string[] = [];
        const params: (string | number)[] = [];

        if (make) {
          conditions.push("LOWER(make) = ?");
          params.push(make);
        }
        if (model) {
          conditions.push("LOWER(model) LIKE ?");
          params.push(`%${model}%`);
        }
        if (year) {
          conditions.push("(year_start IS NULL OR year_start <= ?)");
          conditions.push("(year_end IS NULL OR year_end >= ?)");
          params.push(year, year);
        }
        if (ilco) {
          conditions.push("LOWER(ilco_ref) LIKE ?");
          params.push(`%${ilco}%`);
        }
        if (strattec) {
          conditions.push("LOWER(strattec_ref) LIKE ?");
          params.push(`%${strattec}%`);
        }
        if (q) {
          conditions.push("(LOWER(make) LIKE ? OR LOWER(model) LIKE ? OR LOWER(ilco_ref) LIKE ? OR LOWER(strattec_ref) LIKE ? OR LOWER(blade_profile) LIKE ?)");
          params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

        // Count query
        const countResult = await env.LOCKSMITH_DB.prepare(
          `SELECT COUNT(*) as cnt FROM key_blanks ${whereClause}`
        ).bind(...params).first<{ cnt: number }>();
        const total = countResult?.cnt || 0;

        // Data query
        const dataSql = `
          SELECT 
            id, make, model, year_start, year_end,
            ilco_ref, silca_ref, strattec_ref, oem_ref,
            key_type, blade_profile, blade_style, spaces, depths,
            chip_type, cloneable, prog_tool, dealer_only,
            source, notes
          FROM key_blanks
          ${whereClause}
          ORDER BY make, model, year_start
          LIMIT ? OFFSET ?
        `;
        const dataResult = await env.LOCKSMITH_DB.prepare(dataSql).bind(...params, limit, offset).all();

        return new Response(JSON.stringify({ total, rows: dataResult.results || [] }), {
          headers: {
            "content-type": "application/json",
            "Cache-Control": "public, max-age=300",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "*",
          },
        });
      } catch (err: any) {
        return textResponse(JSON.stringify({ error: err.message }), 500);
      }
    }

    // Curated Data endpoint - manually verified data takes precedence
    if (path === "/api/curated") {
      try {
        const make = url.searchParams.get("make")?.toLowerCase() || "";
        const model = url.searchParams.get("model")?.toLowerCase() || "";
        const year = parseInt(url.searchParams.get("year") || "0", 10);
        const fcc = url.searchParams.get("fcc")?.toLowerCase() || "";

        if (!make && !fcc) {
          return textResponse(JSON.stringify({ error: "make or fcc required" }), 400);
        }

        let sql = `SELECT * FROM curated_overrides WHERE 1=1`;
        const params: (string | number)[] = [];

        if (fcc) {
          sql += ` AND LOWER(fcc_id) = ?`;
          params.push(fcc);
        }
        if (make) {
          sql += ` AND LOWER(make) = ?`;
          params.push(make);
        }
        if (model) {
          sql += ` AND LOWER(model) LIKE ?`;
          params.push(`%${model}%`);
        }
        if (year) {
          sql += ` AND (year_start IS NULL OR year_start <= ?) AND (year_end IS NULL OR year_end >= ?)`;
          params.push(year, year);
        }

        sql += ` LIMIT 10`;

        const result = await env.LOCKSMITH_DB.prepare(sql).bind(...params).all();
        const rows = result.results || [];

        return new Response(JSON.stringify({
          curated: rows.length > 0,
          rows
        }), {
          headers: {
            "content-type": "application/json",
            "Cache-Control": "public, max-age=60",
            "Access-Control-Allow-Origin": "*",
          },
        });
      } catch (err: any) {
        return textResponse(JSON.stringify({ error: err.message }), 500);
      }
    }

    // Video Tutorials endpoint
    if (path === "/api/videos") {
      try {
        const make = url.searchParams.get("make")?.toLowerCase() || "";
        const model = url.searchParams.get("model")?.toLowerCase() || "";
        const year = parseInt(url.searchParams.get("year") || "0", 10);
        const limit = Math.min(parseInt(url.searchParams.get("limit") || "20", 10) || 20, 100);

        const conditions: string[] = [];
        const params: (string | number)[] = [];

        if (make) {
          conditions.push("LOWER(related_make) = ?");
          params.push(make);
        }
        if (model) {
          conditions.push("LOWER(related_model) LIKE ?");
          params.push(`%${model}%`);
        }
        if (year) {
          conditions.push("(related_year_start IS NULL OR related_year_start <= ?) AND (related_year_end IS NULL OR related_year_end >= ?)");
          params.push(year, year);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
        const sql = `SELECT * FROM video_tutorials ${whereClause} LIMIT ?`;

        const result = await env.LOCKSMITH_DB.prepare(sql).bind(...params, limit).all();

        return new Response(JSON.stringify({ rows: result.results || [] }), {
          headers: {
            "content-type": "application/json",
            "Cache-Control": "public, max-age=300",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "*",
          },
        });
      } catch (err: any) {
        return textResponse(JSON.stringify({ error: err.message }), 500);
      }
    }

    // 9. Sourced Key Products (from keylessentryremotefob.com)
    if (path === "/api/sourced") {
      try {
        const make = url.searchParams.get("make")?.toLowerCase();
        const year = url.searchParams.get("year");

        let sql = `SELECT * FROM sourced_keys`;
        const params: (string | number)[] = [];

        if (make || year) {
          sql += ` WHERE 1=1`;
          if (make) {
            sql += ` AND LOWER(primary_make) = ?`;
            params.push(make);
          }
          if (year) {
            sql += ` AND vehicles LIKE ?`;
            params.push(`%(${year})%`);
          }
        }

        const result = await env.LOCKSMITH_DB.prepare(sql).bind(...params).all();
        return textResponse(JSON.stringify({ rows: result.results || [] }), 200);
      } catch (e: any) {
        return textResponse(JSON.stringify({ error: e.message }), 500);
      }
    }

    // 10. Ilco PDF Reference Data
    if (path === "/api/reference") {
      try {
        const make = url.searchParams.get("make")?.toLowerCase();
        const q = url.searchParams.get("q")?.toLowerCase();

        let sql = `SELECT * FROM key_blank_reference`;
        const params: string[] = [];

        if (make || q) {
          sql += ` WHERE 1=1`;
          if (make) {
            sql += ` AND LOWER(make) = ?`;
            params.push(make);
          }
          if (q) {
            sql += ` AND (LOWER(model) LIKE ? OR LOWER(key_blank) LIKE ? OR LOWER(notes) LIKE ?)`;
            params.push(`%${q}%`, `%${q}%`, `%${q}%`);
          }
        }

        const result = await env.LOCKSMITH_DB.prepare(sql).bind(...params).all();
        return textResponse(JSON.stringify({ rows: result.results || [] }), 200);
      } catch (e: any) {
        return textResponse(JSON.stringify({ error: e.message }), 500);
      }
    }

    // Vehicle Master Guides endpoint - comprehensive walkthroughs
    if (path === "/api/guides") {
      try {
        const make = url.searchParams.get("make")?.toLowerCase() || "";
        const model = url.searchParams.get("model")?.toLowerCase() || "";
        const id = url.searchParams.get("id") || "";

        const conditions: string[] = [];
        const params: string[] = [];

        if (id) {
          conditions.push("id = ?");
          params.push(id);
        } else {
          if (make) {
            conditions.push("LOWER(make) = ?");
            params.push(make);
          }
          if (model) {
            conditions.push("LOWER(model) LIKE ?");
            params.push(`%${model}%`);
          }
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
        const sql = `SELECT * FROM vehicle_guides ${whereClause} ORDER BY make, model`;

        const result = await env.LOCKSMITH_DB.prepare(sql).bind(...params).all();

        // Enrich with Make Assets
        // Note: For ID-based lookups we might need to query the vehicle to get the make first if it's not in the guide?
        // But vehicle_guides table has 'make' column.
        const rows = (result.results || []).map((row: any) => {
          const makeKey = (row.make || "").toLowerCase();
          const assets = MAKE_ASSETS[makeKey];
          if (assets) {
            return { ...row, assets };
          }
          return row;
        });

        return new Response(JSON.stringify({ rows }), {
          headers: {
            "content-type": "application/json",
            "Cache-Control": "public, max-age=3600",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "*",
          },
        });
      } catch (err: any) {
        return textResponse(JSON.stringify({ error: err.message }), 500);
      }
    }


    // ==============================================
    // R2 ASSET SERVING
    // ==============================================

    // Serve assets from R2 bucket
    if (path.startsWith("/api/assets/")) {
      try {
        const key = decodeURIComponent(path.replace("/api/assets/", ""));
        if (!key) {
          return textResponse(JSON.stringify({ error: "Asset key required" }), 400);
        }

        const object = await env.ASSETS_BUCKET.get(key);

        if (!object) {
          return textResponse("Asset not found", 404);
        }

        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set("etag", object.httpEtag);
        headers.set("Cache-Control", "public, max-age=31536000"); // Cache for 1 year
        headers.set("Access-Control-Allow-Origin", "*");

        return new Response(object.body, { headers });
      } catch (err: any) {
        return textResponse(JSON.stringify({ error: err.message || "Failed to fetch asset" }), 500);
      }
    }

    // ==============================================
    // NEW ENDPOINTS FOR CROSS-TAB NAVIGATION
    // ==============================================

    // Get a specific vehicle by ID (for cross-linking)
    if (path.startsWith("/api/vehicle/")) {
      try {
        const vehicleId = parseInt(path.split("/").pop() || "", 10);
        if (isNaN(vehicleId)) {
          return textResponse(JSON.stringify({ error: "Invalid vehicle ID" }), 400);
        }

        // Get vehicle info from lookup table
        const vehicle = await env.LOCKSMITH_DB.prepare(
          "SELECT * FROM vehicles WHERE id = ?"
        ).bind(vehicleId).first<any>();

        if (!vehicle) {
          return textResponse(JSON.stringify({ error: "Vehicle not found" }), 404);
        }

        // Get all locksmith data for this vehicle
        const locksmithData = await env.LOCKSMITH_DB.prepare(
          "SELECT * FROM locksmith_data WHERE vehicle_id = ? ORDER BY year"
        ).bind(vehicleId).all();

        // Get any guides for this vehicle
        const guides = await env.LOCKSMITH_DB.prepare(
          "SELECT * FROM vehicle_guides WHERE vehicle_id = ?"
        ).bind(vehicleId).all();

        // Get AKL / EEPROM Data (fuzzy match by make/model/year as fallback for now)
        // Note: Ideally we link this by ID in the future, but for now we match on strings
        const eeprom = await env.LOCKSMITH_DB.prepare(
          "SELECT * FROM eeprom_data WHERE LOWER(make) = ? AND LOWER(model) = ? AND year_start <= ? AND year_end >= ?"
        ).bind(
          vehicle.make.toLowerCase(),
          vehicle.model.toLowerCase(),
          vehicle.year,
          vehicle.year
        ).all();

        return new Response(JSON.stringify({
          vehicle,
          locksmith_data: locksmithData.results || [],
          guides: guides.results || [],
          eeprom_data: eeprom.results || []
        }), {
          headers: {
            "content-type": "application/json",
            "Cache-Control": "public, max-age=3600",
            "Access-Control-Allow-Origin": "*",
          },
        });
      } catch (err: any) {
        return textResponse(JSON.stringify({ error: err.message }), 500);
      }
    }

    // Get all vehicles that use a specific FCC ID (for FCC -> Browse linking)
    if (path.startsWith("/api/vehicles-by-fcc/")) {
      try {
        const fccId = decodeURIComponent(path.split("/").pop() || "");
        if (!fccId) {
          return textResponse(JSON.stringify({ error: "FCC ID required" }), 400);
        }

        // Get FCC ID info from lookup table
        const fccInfo = await env.LOCKSMITH_DB.prepare(
          "SELECT * FROM fcc_ids WHERE fcc_id = ?"
        ).bind(fccId).first();

        // Get all vehicles using this FCC ID
        const vehicleData = await env.LOCKSMITH_DB.prepare(`
          SELECT DISTINCT
            ld.vehicle_id,
            v.make,
            v.make_norm,
            v.model,
            ld.year,
            ld.keyway,
            ld.keyway_id,
            ld.immobilizer_system
          FROM locksmith_data ld
          LEFT JOIN vehicles v ON ld.vehicle_id = v.id
          WHERE UPPER(ld.fcc_id) = UPPER(?)
          ORDER BY v.make, v.model, ld.year
        `).bind(fccId).all();

        return new Response(JSON.stringify({
          fcc_id: fccId,
          fcc_info: fccInfo,
          vehicles: vehicleData.results || [],
          count: vehicleData.results?.length || 0
        }), {
          headers: {
            "content-type": "application/json",
            "Cache-Control": "public, max-age=3600",
            "Access-Control-Allow-Origin": "*",
          },
        });
      } catch (err: any) {
        return textResponse(JSON.stringify({ error: err.message }), 500);
      }
    }

    // Get Lishi tools compatible with a specific keyway (for Browse -> Tools linking)
    if (path.startsWith("/api/tools-by-keyway/")) {
      try {
        const keywayParam = decodeURIComponent(path.split("/").pop() || "");
        if (!keywayParam) {
          return textResponse(JSON.stringify({ error: "Keyway required" }), 400);
        }

        // Get keyway info
        const keyway = await env.LOCKSMITH_DB.prepare(
          "SELECT * FROM keyways WHERE keyway = ? OR keyway_norm = ?"
        ).bind(keywayParam, keywayParam.toLowerCase()).first();

        // Get compatible Lishi tools
        const tools = await env.LOCKSMITH_DB.prepare(`
          SELECT lt.* 
          FROM lishi_tools lt
          WHERE lt.keyway = ? OR lt.keyway LIKE ?
        `).bind(keywayParam, `%${keywayParam}%`).all();

        return new Response(JSON.stringify({
          keyway: keywayParam,
          keyway_info: keyway,
          tools: tools.results || []
        }), {
          headers: {
            "content-type": "application/json",
            "Cache-Control": "public, max-age=3600",
            "Access-Control-Allow-Origin": "*",
          },
        });
      } catch (err: any) {
        return textResponse(JSON.stringify({ error: err.message }), 500);
      }
    }

    // Get all unique vehicles for dropdown population
    if (path === "/api/vehicles") {
      try {
        const make = url.searchParams.get("make")?.toLowerCase() || "";

        let sql = "SELECT * FROM vehicles";
        const params: string[] = [];

        if (make) {
          sql += " WHERE LOWER(make) = ? OR LOWER(make_norm) = ?";
          params.push(make, make);
        }

        sql += " ORDER BY make, model";

        const result = await env.LOCKSMITH_DB.prepare(sql).bind(...params).all();

        return new Response(JSON.stringify({
          count: result.results?.length || 0,
          vehicles: result.results || []
        }), {
          headers: {
            "content-type": "application/json",
            "Cache-Control": "public, max-age=3600",
            "Access-Control-Allow-Origin": "*",
          },
        });
      } catch (err: any) {
        return textResponse(JSON.stringify({ error: err.message }), 500);
      }
    }

    // Get vehicle generations (structured data from curated guides)
    if (path === "/api/generations" || path.startsWith("/api/generations?")) {
      try {
        const make = url.searchParams.get("make")?.toLowerCase() || "";
        const model = url.searchParams.get("model")?.toLowerCase() || "";
        const year = url.searchParams.get("year") || "";

        const conditions: string[] = [];
        const params: (string | number)[] = [];

        if (make) {
          conditions.push("LOWER(make) = ?");
          params.push(make);
        }
        if (model) {
          conditions.push("LOWER(model) LIKE ?");
          params.push(`%${model}%`);
        }
        if (year) {
          const yearNum = parseInt(year, 10);
          conditions.push("year_start <= ? AND year_end >= ?");
          params.push(yearNum, yearNum);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
        const sql = `SELECT * FROM vehicle_generations ${whereClause} ORDER BY make, model, year_start`;

        const result = await env.LOCKSMITH_DB.prepare(sql).bind(...params).all();

        return new Response(JSON.stringify({
          count: result.results?.length || 0,
          generations: result.results || []
        }), {
          headers: {
            "content-type": "application/json",
            "Cache-Control": "public, max-age=3600",
            "Access-Control-Allow-Origin": "*",
          },
        });
      } catch (err: any) {
        return textResponse(JSON.stringify({ error: err.message }), 500);
      }
    }

    // Get vehicle variants with enriched data (chip details)
    if (path === "/api/variants" || path.startsWith("/api/variants?")) {
      try {
        const make = url.searchParams.get("make")?.toLowerCase() || "";
        const model = url.searchParams.get("model")?.toLowerCase() || "";
        const year = url.searchParams.get("year") || "";
        const keyType = url.searchParams.get("key_type") || "";

        const conditions: string[] = [];
        const params: (string | number)[] = [];

        // Join with vehicles_master and chip_registry
        let sql = `
          SELECT 
            vv.*, 
            vm.make, 
            vm.model,
            cr.technology as chip_tech,
            cr.bits as chip_bits,
            cr.clonable as chip_clonable,
            cr.description as chip_desc
          FROM vehicle_variants vv
          JOIN vehicles_master vm ON vv.vehicle_id = vm.id
          LEFT JOIN chip_registry cr ON vv.chip_type = cr.chip_type
        `;

        if (make) {
          conditions.push("LOWER(vm.make) = ?");
          params.push(make);
        }
        if (model) {
          conditions.push("LOWER(vm.model) LIKE ?");
          params.push(`%${model}%`);
        }
        if (year) {
          const yearNum = parseInt(year, 10);
          conditions.push("vv.year_start <= ? AND vv.year_end >= ?");
          params.push(yearNum, yearNum);
        }
        if (keyType) {
          conditions.push("LOWER(vv.key_type) LIKE ?");
          params.push(`%${keyType}%`);
        }

        if (conditions.length > 0) {
          sql += ` WHERE ${conditions.join(" AND ")}`;
        }

        sql += " ORDER BY vm.make, vm.model, vv.year_start, vv.key_type";

        const result = await env.LOCKSMITH_DB.prepare(sql).bind(...params).all();

        return new Response(JSON.stringify({
          count: result.results?.length || 0,
          variants: result.results || []
        }), {
          headers: {
            "content-type": "application/json",
            "Cache-Control": "public, max-age=3600",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "*",
          },
        });
      } catch (err: any) {
        return textResponse(JSON.stringify({ error: err.message }), 500);
      }
    }

    // Programming / Tool Coverage Endpoint
    if (path === "/api/programming" || path.startsWith("/api/programming?")) {
      try {
        const make = url.searchParams.get("make")?.toLowerCase() || "";
        const model = url.searchParams.get("model")?.toLowerCase() || "";
        const year = url.searchParams.get("year") || "";

        let sql = "SELECT * FROM tool_coverage";
        const conditions: string[] = [];
        const params: (string | number)[] = [];

        if (make) {
          conditions.push("LOWER(make) = ?");
          params.push(make);
        }
        if (model) {
          conditions.push("LOWER(model) LIKE ?");
          params.push(`%${model}%`);
        }
        if (year) {
          const yearNum = parseInt(year, 10);
          conditions.push("year_start <= ? AND year_end >= ?");
          params.push(yearNum, yearNum);
        }

        if (conditions.length > 0) {
          sql += ` WHERE ${conditions.join(" AND ")}`;
        }

        sql += " ORDER BY make, model, year_start";

        const result = await env.LOCKSMITH_DB.prepare(sql).bind(...params).all();

        return new Response(JSON.stringify({
          count: result.results?.length || 0,
          coverage: result.results || []
        }), {
          headers: {
            "content-type": "application/json",
            "Cache-Control": "public, max-age=3600",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "*",
          },
        });
      } catch (err: any) {
        return textResponse(JSON.stringify({ error: err.message }), 500);
      }
    }

    // Key Cross-Reference Endpoint
    if (path === "/api/crossref" || path.startsWith("/api/crossref?")) {
      try {
        const make = url.searchParams.get("make")?.toLowerCase() || "";
        const part = url.searchParams.get("part")?.toLowerCase() || "";
        const fcc = url.searchParams.get("fcc")?.toLowerCase() || "";

        let sql = "SELECT * FROM part_crossref";
        const conditions: string[] = [];
        const params: string[] = [];

        if (make) {
          conditions.push("LOWER(make) = ?");
          params.push(make);
        }
        if (part) {
          conditions.push("(LOWER(oem_part) LIKE ? OR LOWER(ilco_part) LIKE ? OR LOWER(strattec_part) LIKE ? OR LOWER(jma_part) LIKE ? OR LOWER(keydiy_part) LIKE ?)");
          params.push(`%${part}%`, `%${part}%`, `%${part}%`, `%${part}%`, `%${part}%`);
        }
        if (fcc) {
          conditions.push("LOWER(fcc_id) LIKE ?");
          params.push(`%${fcc}%`);
        }

        if (conditions.length > 0) {
          sql += ` WHERE ${conditions.join(" AND ")}`;
        }

        const result = await env.LOCKSMITH_DB.prepare(sql).bind(...params).all();

        return new Response(JSON.stringify({
          count: result.results?.length || 0,
          crossref: result.results || []
        }), {
          headers: {
            "content-type": "application/json",
            "Cache-Control": "public, max-age=3600",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "*",
          },
        });
      } catch (err: any) {
        return textResponse(JSON.stringify({ error: err.message }), 500);
      }
    }

    // Clean Models endpoint - returns deduplicated clean model names for dropdowns
    if (path === "/api/models") {
      try {
        const make = url.searchParams.get("make")?.toLowerCase() || "";
        const year = url.searchParams.get("year") || "";

        const conditions: string[] = ["clean_model IS NOT NULL", "clean_model != ''"];
        const params: (string | number)[] = [];

        if (make) {
          conditions.push("LOWER(make) = ?");
          params.push(make);
        }
        if (year) {
          const yearNum = parseInt(year, 10);
          if (!isNaN(yearNum)) {
            conditions.push("year = ?");
            params.push(yearNum);
          }
        }

        const whereClause = `WHERE ${conditions.join(" AND ")}`;
        const sql = `
          SELECT DISTINCT clean_model 
          FROM locksmith_data 
          ${whereClause}
          ORDER BY clean_model
        `;

        const result = await env.LOCKSMITH_DB.prepare(sql).bind(...params).all();

        return new Response(JSON.stringify({
          count: result.results?.length || 0,
          models: result.results || []
        }), {
          headers: {
            "content-type": "application/json",
            "Cache-Control": "public, max-age=3600",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "*",
          },
        });
      } catch (err: any) {
        return textResponse(JSON.stringify({ error: err.message }), 500);
      }
    }

    // EEPROM / AKL Data Endpoint
    if (path === "/api/eeprom" || path.startsWith("/api/eeprom?")) {
      try {
        const make = url.searchParams.get("make")?.toLowerCase() || "";
        const model = url.searchParams.get("model")?.toLowerCase() || "";
        const year = url.searchParams.get("year") || "";

        let sql = "SELECT * FROM eeprom_data";
        const conditions: string[] = [];
        const params: (string | number)[] = [];

        if (make) {
          conditions.push("LOWER(make) = ?");
          params.push(make);
        }
        if (model) {
          conditions.push("LOWER(model) LIKE ?");
          params.push(`%${model}%`);
        }
        if (year) {
          const yearNum = parseInt(year, 10);
          conditions.push("year_start <= ? AND year_end >= ?");
          params.push(yearNum, yearNum);
        }

        if (conditions.length > 0) {
          sql += ` WHERE ${conditions.join(" AND ")}`;
        }

        sql += " ORDER BY make, model, year_start";

        const result = await env.LOCKSMITH_DB.prepare(sql).bind(...params).all();

        return new Response(JSON.stringify({
          count: result.results?.length || 0,
          eeprom_data: result.results || []
        }), {
          headers: {
            "content-type": "application/json",
            "Cache-Control": "public, max-age=3600",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "*",
          },
        });
      } catch (err: any) {
        return textResponse(JSON.stringify({ error: err.message }), 500);
      }
    }



    // Get all vehicles from the master registry
    if (path === "/api/vehicles-master" || path.startsWith("/api/vehicles-master?")) {
      try {
        const make = url.searchParams.get("make")?.toLowerCase() || "";

        let sql = "SELECT * FROM vehicles_master";
        const params: string[] = [];

        if (make) {
          sql += " WHERE LOWER(make) = ?";
          params.push(make);
        }

        sql += " ORDER BY make, model";

        const result = await env.LOCKSMITH_DB.prepare(sql).bind(...params).all();

        return new Response(JSON.stringify({
          count: result.results?.length || 0,
          vehicles: result.results || []
        }), {
          headers: {
            "content-type": "application/json",
            "Cache-Control": "public, max-age=3600",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "*",
          },
        });
      } catch (err: any) {
        return textResponse(JSON.stringify({ error: err.message }), 500);
      }
    }

    // Cross-Reference Endpoint - part_crossref table with ILCO/Strattec/JMA/KEYDIY
    if (path === "/api/crossref" || path.startsWith("/api/crossref?")) {
      try {
        const make = url.searchParams.get("make")?.toLowerCase() || "";
        const fcc_id = url.searchParams.get("fcc_id") || "";
        const oem_part = url.searchParams.get("oem_part") || "";

        let sql = "SELECT * FROM part_crossref";
        const conditions: string[] = [];
        const params: string[] = [];

        if (make) {
          conditions.push("LOWER(make) = ?");
          params.push(make);
        }
        if (fcc_id) {
          conditions.push("LOWER(fcc_id) = ?");
          params.push(fcc_id.toLowerCase());
        }
        if (oem_part) {
          conditions.push("oem_part = ?");
          params.push(oem_part);
        }

        if (conditions.length > 0) {
          sql += ` WHERE ${conditions.join(" AND ")}`;
        }

        sql += " ORDER BY make, oem_part LIMIT 100";

        const result = await env.LOCKSMITH_DB.prepare(sql).bind(...params).all();

        return new Response(JSON.stringify({
          count: result.results?.length || 0,
          rows: result.results || []
        }), {
          headers: {
            "content-type": "application/json",
            "Cache-Control": "public, max-age=3600",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "*",
          },
        });
      } catch (err: any) {
        return textResponse(JSON.stringify({ error: err.message }), 500);
      }
    }

    // ============ STRIPE SUBSCRIPTION ENDPOINTS ============

    // Create Stripe Checkout Session
    if (path === "/api/create-checkout-session" && request.method === "POST") {
      try {
        const body = await request.json() as { userId: string; email: string; plan: string };
        const { userId, email, plan } = body;

        if (!userId || !email || !plan) {
          return textResponse(JSON.stringify({ error: "Missing userId, email, or plan" }), 400);
        }

        // Price IDs - you'll need to create these in Stripe Dashboard and replace
        const priceIds: Record<string, string> = {
          monthly: "price_monthly_placeholder",  // Replace with real Stripe price ID
          annual: "price_annual_placeholder",    // Replace with real Stripe price ID
          lifetime: "price_lifetime_placeholder" // Replace with real Stripe price ID
        };

        const priceId = priceIds[plan];
        if (!priceId) {
          return textResponse(JSON.stringify({ error: "Invalid plan" }), 400);
        }

        // Create Stripe Checkout Session via API
        const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${env.STRIPE_SECRET_KEY}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            "mode": plan === "lifetime" ? "payment" : "subscription",
            "success_url": "https://eurokeys.app/?subscription=success",
            "cancel_url": "https://eurokeys.app/?subscription=canceled",
            "customer_email": email,
            "client_reference_id": userId,
            "line_items[0][price]": priceId,
            "line_items[0][quantity]": "1",
            "metadata[userId]": userId,
            "metadata[plan]": plan,
          }),
        });

        const session = await stripeResponse.json() as { url?: string; error?: { message: string } };

        if (!stripeResponse.ok || session.error) {
          return textResponse(JSON.stringify({ error: session.error?.message || "Stripe error" }), 500);
        }

        return textResponse(JSON.stringify({ url: session.url }));
      } catch (err: any) {
        return textResponse(JSON.stringify({ error: err.message }), 500);
      }
    }

    // Stripe Webhook Handler
    if (path === "/api/webhook" && request.method === "POST") {
      try {
        const payload = await request.text();
        // In production, verify webhook signature using STRIPE_WEBHOOK_SECRET
        // For now, we trust the payload (add signature verification for production)

        const event = JSON.parse(payload) as {
          type: string;
          data: {
            object: {
              client_reference_id?: string;
              customer?: string;
              subscription?: string;
              metadata?: { userId?: string; plan?: string };
              current_period_end?: number;
              status?: string;
            }
          }
        };

        if (event.type === "checkout.session.completed") {
          const session = event.data.object;
          const userId = session.client_reference_id || session.metadata?.userId;
          const plan = session.metadata?.plan || "monthly";
          const stripeCustomerId = session.customer;
          const stripeSubscriptionId = session.subscription;

          if (userId) {
            // Calculate expiry (lifetime = far future, subscription = current_period_end)
            const expiry = plan === "lifetime"
              ? Math.floor(Date.now() / 1000) + (100 * 365 * 24 * 60 * 60) // 100 years
              : session.current_period_end || Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60);

            await env.LOCKSMITH_DB.prepare(`
              INSERT INTO subscriptions (user_id, stripe_customer_id, stripe_subscription_id, plan, status, current_period_end, updated_at)
              VALUES (?, ?, ?, ?, 'active', ?, datetime('now'))
              ON CONFLICT(user_id) DO UPDATE SET
                stripe_customer_id = excluded.stripe_customer_id,
                stripe_subscription_id = excluded.stripe_subscription_id,
                plan = excluded.plan,
                status = 'active',
                current_period_end = excluded.current_period_end,
                updated_at = datetime('now')
            `).bind(userId, stripeCustomerId, stripeSubscriptionId, plan, expiry).run();
          }
        }

        if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
          const subscription = event.data.object;
          const stripeSubscriptionId = subscription.subscription || event.data.object as any;
          const status = subscription.status === "active" ? "active" : "canceled";
          const periodEnd = subscription.current_period_end;

          if (stripeSubscriptionId) {
            await env.LOCKSMITH_DB.prepare(`
              UPDATE subscriptions 
              SET status = ?, current_period_end = ?, updated_at = datetime('now')
              WHERE stripe_subscription_id = ?
            `).bind(status, periodEnd, stripeSubscriptionId).run();
          }
        }

        return textResponse(JSON.stringify({ received: true }));
      } catch (err: any) {
        return textResponse(JSON.stringify({ error: err.message }), 400);
      }
    }

    // Get Subscription Status
    if (path === "/api/subscription-status") {
      try {
        const userId = url.searchParams.get("userId");

        if (!userId) {
          return textResponse(JSON.stringify({ error: "Missing userId" }), 400);
        }

        const result = await env.LOCKSMITH_DB.prepare(`
          SELECT plan, status, current_period_end 
          FROM subscriptions 
          WHERE user_id = ?
        `).bind(userId).first() as { plan: string; status: string; current_period_end: number } | null;

        if (!result) {
          return textResponse(JSON.stringify({ isPro: false, plan: null }));
        }

        const now = Math.floor(Date.now() / 1000);
        const isActive = result.status === "active" && result.current_period_end > now;

        return textResponse(JSON.stringify({
          isPro: isActive,
          plan: isActive ? result.plan : null,
          expiresAt: isActive ? result.current_period_end : null
        }));
      } catch (err: any) {
        return textResponse(JSON.stringify({ error: err.message }), 500);
      }
    }

    return textResponse(JSON.stringify({ error: "Not found" }), 404);
  },

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(runAIAnalysis(env));
  }
};

async function runAIAnalysis(env: Env) {
  try {
    // 1. Gather Data
    // A. Low Stock Inventory
    const inventoryResult: any = await env.LOCKSMITH_DB.prepare(
      "SELECT item_key, type, qty, vehicle FROM inventory WHERE qty <= 2 LIMIT 10"
    ).all();
    const inventory = inventoryResult.results || [];

    // B. Job Logs (Financials)
    // Get last 50 jobs to analyze trends
    const logsResult: any = await env.LOCKSMITH_DB.prepare(
      "SELECT data, created_at FROM job_logs ORDER BY created_at DESC LIMIT 50"
    ).all();

    // Process Logs for Analytics
    let totalRevenue = 0;
    let totalCost = 0;
    const clientRevenue: Record<string, number> = {};
    const jobTypes: Record<string, number> = {};

    (logsResult.results || []).forEach((log: any) => {
      try {
        const data = JSON.parse(log.data);
        const r = parseFloat(data.revenue) || 0;
        const c = parseFloat(data.cost) || 0;
        totalRevenue += r;
        totalCost += c;

        // Client ranking
        const client = data.customer || 'Unknown';
        if (client !== 'Manual Job') {
          clientRevenue[client] = (clientRevenue[client] || 0) + r;
        }

        // Job type trending
        const type = data.type || 'unknown';
        jobTypes[type] = (jobTypes[type] || 0) + 1;
      } catch (e) { }
    });

    const ebitda = totalRevenue - totalCost; // Simplified: Revenue - COGS
    const taxEstimate = ebitda * 0.30; // 30% estimation

    // Top Clients
    const topClients = Object.entries(clientRevenue)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([name, rev]) => ({ name, revenue: rev }));

    // 2. Build Prompt
    const prompt = `
      You are an expert locksmith business consultant (Analyst).
      
      Here is my current business snapshot (Based on last 50 jobs):
      - Total Revenue: $${totalRevenue.toFixed(2)}
      - Total Cost (COGS): $${totalCost.toFixed(2)}
      - Est. EBITDA (Profit): $${ebitda.toFixed(2)}
      - Est. Taxes (30%): $${taxEstimate.toFixed(2)}
      - Top Clients: ${JSON.stringify(topClients)}
      - Low Stock Items: ${JSON.stringify(inventory)}

      Act as my 'Best Friend' & Business Partner. 
      1. Analyze my "Productive Clients": Who should I focus on?
      2. Analyze my Financials: Am I profitable? Any advice on taxes or EBITDA?
      3. Recommend 3 items to restock from Amazon.

      Format your response as valid JSON with keys: 
      - "message" (A encouraging summary of my business health),
      - "financial_tip" (Specific advice on the figures),
      - "client_strategy" (How to handle my top clients),
      - "restock_recommendations" (Array of 3 item names).
    `;

    // 3. Call AI
    const response: any = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
      messages: [
        { role: 'system', content: 'You are a helpful assistant that outputs JSON only.' },
        { role: 'user', content: prompt }
      ]
    });

    // Parse response
    let content = response.response || JSON.stringify(response);
    let recommendations: any[] = [];

    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        content = parsed.message;
        if (parsed.client_strategy) content += "\n\n**Client Strategy:** " + parsed.client_strategy;
        if (parsed.financial_tip) content += "\n\n**Financial Insight:** " + parsed.financial_tip;
        recommendations = parsed.restock_recommendations;
      }
    } catch (e) {
      content = "Analysis complete. Revenue: $" + totalRevenue.toFixed(2);
    }

    // 4. Save to DB
    const id = crypto.randomUUID();
    await env.LOCKSMITH_DB.prepare(
      "INSERT INTO insights (id, user_id, content, recommendations, created_at) VALUES (?, ?, ?, ?, ?)"
    ).bind(id, 'global', content, JSON.stringify(recommendations), Date.now()).run();

    return { success: true, id, insight: content };

  } catch (e: any) {
    console.error("AI Error:", e);
    return { error: e.message };
  }
}
