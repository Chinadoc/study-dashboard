import { SignJWT, jwtVerify } from 'jose';

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
  DEV_EMAILS: string;  // Comma-separated developer email addresses
  AI: any;
  OPENROUTER_API_KEY: string;
  GEMINI_API_KEY?: string;  // Gemini API key for direct Google AI calls
  CHAT_AI_PROVIDER?: string;  // 'gemini' or 'openrouter' (default: openrouter)
  CF_ANALYTICS_TOKEN?: string;  // Cloudflare Global API Key
  CF_ZONE_ID?: string;          // Cloudflare Zone ID for eurokeys.app
  CF_AUTH_EMAIL?: string;       // Cloudflare account email for API auth
}

const MAKE_ASSETS: Record<string, { infographic?: string, pdf?: string, pdf_title?: string }> = {
  'bmw': { infographic: '/assets/BMW infographic.png', pdf: '/assets/BMW_Security_Mastery_The_Professional_Ladder.pdf', pdf_title: 'Security Mastery Guide' },
  'chrysler': { infographic: '/assets/Chrysler infographic.png', pdf: '/assets/CDJR_Security_Eras_Explained.pdf', pdf_title: 'Security Eras Explained' },
  'dodge': { infographic: '/assets/Chrysler infographic.png', pdf: '/assets/CDJR_Security_Eras_Explained.pdf', pdf_title: 'Security Eras Explained' },
  'jeep': { infographic: '/assets/Chrysler infographic.png', pdf: '/assets/CDJR_Security_Eras_Explained.pdf', pdf_title: 'Security Eras Explained' },
  'ram': { infographic: '/assets/Chrysler infographic.png', pdf: '/assets/CDJR_Security_Eras_Explained.pdf', pdf_title: 'Security Eras Explained' },
  'ford': { infographic: '/assets/Ford_Key_Programming_Deep_Dive.png', pdf: '/assets/Ford_Key_Programming_Deep_Dive.pdf', pdf_title: 'Key Programming Deep Dive' },
  'lincoln': { infographic: '/assets/Ford_Key_Programming_Deep_Dive.png', pdf: '/assets/Ford_Key_Programming_Deep_Dive.pdf', pdf_title: 'Key Programming Deep Dive' },
  'honda': { infographic: '/assets/Honda_Immobilizer_Master_Guide.png', pdf: '/assets/Honda_Immobilizer_Master_Guide.pdf', pdf_title: 'Immobilizer Master Guide' },
  'acura': { infographic: '/assets/Honda_Immobilizer_Master_Guide.png', pdf: '/assets/Honda_Immobilizer_Master_Guide.pdf', pdf_title: 'Immobilizer Master Guide' },
  'hyundai': { infographic: '/assets/Hyundai_Key_Programming_Field_Guide.png', pdf: '/assets/Hyundai_Key_Programming_Field_Guide.pdf', pdf_title: 'Key Programming Field Guide' },
  'kia': { infographic: '/assets/Hyundai_Key_Programming_Field_Guide.png', pdf: '/assets/Hyundai_Key_Programming_Field_Guide.pdf', pdf_title: 'Key Programming Field Guide' },
  'mazda': { infographic: '/assets/Mazda Infographic.png' },
  'mercedes': { pdf: '/assets/Mercedes_Locksmith_Codex.pdf', pdf_title: 'Locksmith Codex' },
  'nissan': { infographic: '/assets/Nissan infographic.png', pdf: '/assets/Nissan_Immobilizer_Systems_A_Professional_Guide.pdf', pdf_title: 'Immobilizer Systems Guide' },
  'infiniti': { infographic: '/assets/Nissan infographic.png', pdf: '/assets/Nissan_Immobilizer_Systems_A_Professional_Guide.pdf', pdf_title: 'Immobilizer Systems Guide' },
  // GM Brands - Global A/B Architecture
  'chevrolet': { infographic: '/guides/Camaro_PEPS_Topology.png', pdf_title: 'Global A PEPS Guide' },
  'gmc': { pdf_title: 'Global A PEPS Guide' },
  'buick': { pdf_title: 'Global A PEPS Guide' },
  'cadillac': { pdf_title: 'Global A PEPS Guide' }
};


// Helper for CORS-compliant responses
function corsResponse(request: Request, body: string, status = 200, extraHeaders?: Headers, contentType = "application/json") {
  const origin = request.headers.get("Origin") || "*";
  // Allow production domain, local development, and file:// (which sends 'null')
  const isAllowedOrigin = origin === "https://eurokeys.app" ||
    origin === "https://study-dashboard-8a9.pages.dev" ||
    origin.endsWith(".study-dashboard-8a9.pages.dev") ||
    origin.endsWith(".workers.dev") ||
    origin.startsWith("http://localhost:") ||
    origin.startsWith("http://127.0.0.1:") ||
    origin === "null" ||  // file:// protocol sends null origin
    origin === "*";       // Fallback for missing origin

  const headers: Record<string, string> = {
    "Content-Type": contentType,
    "Access-Control-Allow-Origin": isAllowedOrigin ? (origin === "null" ? "*" : origin) : "https://eurokeys.app",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Cookie, Authorization",
  };

  if (isAllowedOrigin && origin !== "null" && origin !== "*") {
    headers["Access-Control-Allow-Credentials"] = "true";
  }

  // Combine with extra headers
  const finalHeaders = new Headers(headers);
  if (extraHeaders) {
    extraHeaders.forEach((value, key) => {
      finalHeaders.set(key, value);
    });
  }

  return new Response(body, { status, headers: finalHeaders });
}

// Legacy helper (only for cases where request isn't available, but we should minimize this)
function textResponse(body: string, status = 200, contentType = "application/json") {
  return new Response(body, {
    status,
    headers: {
      "Content-Type": contentType,
      "Access-Control-Allow-Origin": "https://eurokeys.app",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Credentials": "true"
    },
  });
}

const DEFAULT_AUTH_REDIRECT = "https://eurokeys.app";

function normalizeAuthRedirect(candidate?: string | null): string {
  if (!candidate) return DEFAULT_AUTH_REDIRECT;
  try {
    const url = new URL(candidate);
    const host = url.hostname.toLowerCase();
    const isLocalhost = host === "localhost" || host === "127.0.0.1";
    const isAllowedHost =
      host === "eurokeys.app" ||
      host.endsWith(".eurokeys.app") ||
      host === "study-dashboard-8a9.pages.dev" ||
      host.endsWith(".study-dashboard-8a9.pages.dev") ||
      isLocalhost;

    if (!isAllowedHost) return DEFAULT_AUTH_REDIRECT;
    if (!isLocalhost && url.protocol !== "https:") return DEFAULT_AUTH_REDIRECT;
    return url.origin;
  } catch {
    return DEFAULT_AUTH_REDIRECT;
  }
}

async function createInternalToken(user: any, secret: string) {
  const secretKey = new TextEncoder().encode(secret);
  return await new SignJWT({
    sub: user.id,
    email: user.email,
    name: user.name,
    is_pro: !!user.is_pro,
    is_developer: !!user.is_developer,
    picture: user.picture,
    trial_until: user.trial_until || null
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

// Check if email is in developer allow-list
function isDeveloper(email: string, devEmails: string): boolean {
  const allowed = (devEmails || '').split(',').map(e => e.trim().toLowerCase());
  return allowed.includes((email || '').toLowerCase());
}

// Extract session token from Authorization header (Bearer) or Cookie
// This allows cross-domain auth when cookies can't be shared
function getSessionToken(request: Request): string | null {
  // First try Authorization header (preferred for cross-domain)
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  // Fall back to cookie
  const cookieHeader = request.headers.get("Cookie");
  return cookieHeader?.split(';').find(c => c.trim().startsWith('session='))?.split('=')[1] || null;
}



// ==============================================
// KEY DATA HELPERS (Global)
// ==============================================

// Patterns to HIDE (not unique keys, just purchasing variants)
const HIDE_PATTERNS = [
  /^\d+-PACK\s/i,           // "5-PACK Ford..." - multipacks
  /^\d+-Pack\s/i,           // Case variant
  /\bSHELL\b/i,             // "Key SHELL" - case only, no electronics
  /\bBLANK\b/i,             // Key blank only
];

// Helper: Extract button count from title
function extractButtons(title: string): number {
  const match = title.match(/(\d+)-?(?:Btn|Button|B)\b/i);
  return match ? parseInt(match[1], 10) : 0;
}

// Helper: Extract features from title
function extractFeatures(title: string): string[] {
  const features: string[] = [];
  const t = title.toLowerCase();
  if (t.includes('w/trunk') || t.includes('w/ trunk') || (t.includes('trunk') && !t.includes('hatch'))) features.push('trunk');
  if (t.includes('w/hatch') || t.includes('w/ hatch') || t.includes('hatch')) features.push('hatch');
  if (t.includes('w/rs') || t.includes('w/ rs') || t.includes('remote start') || t.includes('rmt start')) features.push('rs');
  if (t.includes('w/roof') || t.includes('w/ roof') || t.includes('roof')) features.push('roof');
  if (t.includes('w/doors') || t.includes('power door') || t.includes('sliding door')) features.push('doors');
  return features.sort();
}

// Helper: Extract key type from title
function extractKeyType(title: string): string {
  const t = title.toLowerCase();
  if (t.includes('smart key') || t.includes('smart') && t.includes('key')) return 'smart';
  if (t.includes('fobik')) return 'fobik';
  if (t.includes('flip') && (t.includes('rhk') || t.includes('remote head'))) return 'flip';
  if (t.includes('rhk') || t.includes('remote head')) return 'rhk';
  if (t.includes('transponder')) return 'transponder';
  if (t.includes('mechanical') || t.includes('mech key')) return 'mechanical';
  if (t.includes('remote') && !t.includes('head') && !t.includes('start')) return 'remote';
  if (t.includes('emergency') || t.includes('blade only') || t.includes('insert')) return 'blade';
  return 'key';
}

// Helper: Check if aftermarket (BRK)
function isAftermarket(title: string): boolean {
  return /\(BRK\)/i.test(title) || /—BRK$/i.test(title) || title.toLowerCase().startsWith('for ');
}

// Helper: Parse price to float (handle "$139.25 $128.11" -> 128.11)
function parsePrice(priceStr: string | null): number {
  if (!priceStr) return 9999;
  // If multiple prices (sale), take the lower one (usually 2nd)
  const prices = priceStr.match(/\$?(\d+\.?\d*)/g);
  if (!prices) return 9999;
  return Math.min(...prices.map(p => parseFloat(p.replace('$', ''))));
}

// Helper: Generate unique key signature
function getKeySignature(row: any): string {
  const title = (row.product_title || row.title || '');
  const fccId = (row.fcc_id || 'NOFCC').toUpperCase();
  const buttons = extractButtons(title) || row.buttons || 0;
  const features = extractFeatures(title).join('-') || 'base';
  const keyType = extractKeyType(title);
  return `${fccId}_${buttons}_${features}_${keyType}`;
}

// Helper: Generate random invite code for fleet invitations
function generateRandomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No O/0, I/1/L confusion
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const url = new URL(request.url);
      if (request.method === "OPTIONS") {
        return corsResponse(request, "", 204);
      }

      const path = url.pathname;

      // ==============================================
      // AUTHENTICATION
      // ==============================================

      // 1. Google Login Redirect
      if (path === "/api/auth/google") {
        try {
          console.log("Auth: Starting Google login redirect...");

          // Defensive checks
          if (!env.GOOGLE_CLIENT_ID) {
            console.error("Auth Error: GOOGLE_CLIENT_ID is not set!");
            return corsResponse(request, JSON.stringify({ error: "OAuth not configured: Missing Client ID" }), 500);
          }

          const redirectUri = `${url.origin}/api/auth/callback`;
          console.log("Auth: redirectUri =", redirectUri);

          const scope = "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email";
          const redirectTarget = normalizeAuthRedirect(url.searchParams.get("redirect"));
          const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${env.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent&state=${encodeURIComponent(redirectTarget)}`;

          console.log("Auth: Redirecting to Google...");
          return Response.redirect(authUrl, 302);
        } catch (authErr: any) {
          console.error("Auth Handler Crash:", authErr.message, authErr.stack);
          return corsResponse(request, JSON.stringify({ error: "Auth redirect failed: " + authErr.message }), 500);
        }
      }

      // 2. Google Callback (Redirect Flow)
      if (path === "/api/auth/callback") {
        try {
          const code = url.searchParams.get("code");
          if (!code) return corsResponse(request, "Missing code", 400);

          const redirectUri = `${url.origin}/api/auth/callback`;
          const tokenData: any = await getGoogleToken(code, env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, redirectUri);

          if (!tokenData.access_token) {
            return corsResponse(request, JSON.stringify(tokenData), 400); // Debug error
          }

          const googleUser: any = await getGoogleUser(tokenData.access_token);

          // Upsert User in D1
          const existingUser = await env.LOCKSMITH_DB.prepare("SELECT * FROM users WHERE id = ?").bind(googleUser.id).first<any>();

          if (!existingUser) {
            const trialUntil = Date.now() + (14 * 24 * 60 * 60 * 1000); // 14 days trial
            await env.LOCKSMITH_DB.prepare(
              "INSERT INTO users (id, email, name, picture, created_at, trial_until) VALUES (?, ?, ?, ?, ?, ?)"
            ).bind(googleUser.id, googleUser.email, googleUser.name, googleUser.picture, Date.now(), trialUntil).run();
          } else {
            // Update details just in case
            await env.LOCKSMITH_DB.prepare(
              "UPDATE users SET email = ?, name = ?, picture = ? WHERE id = ?"
            ).bind(googleUser.email, googleUser.name, googleUser.picture, googleUser.id).run();
          }

          // Get final user state (checking is_pro)
          const user = await env.LOCKSMITH_DB.prepare("SELECT * FROM users WHERE id = ?").bind(googleUser.id).first<any>();

          // Check if user is a developer based on email allow-list
          const userIsDeveloper = isDeveloper(googleUser.email, env.DEV_EMAILS);

          // Update developer status in DB if needed
          if (userIsDeveloper && !user.is_developer) {
            await env.LOCKSMITH_DB.prepare("UPDATE users SET is_developer = TRUE WHERE id = ?").bind(googleUser.id).run();
            user.is_developer = true;
          }

          // Log sign-in activity
          try {
            await env.LOCKSMITH_DB.prepare(
              "INSERT INTO user_activity (user_id, action, details, created_at) VALUES (?, ?, ?, ?)"
            ).bind(googleUser.id, 'sign_in', JSON.stringify({ email: googleUser.email }), Date.now()).run();
          } catch (e) { /* activity logging is non-critical */ }

          // Create Session Cookie (include is_developer in token)
          const userWithDev = { ...user, is_developer: userIsDeveloper || user.is_developer };
          const sessionToken = await createInternalToken(userWithDev, env.JWT_SECRET || 'dev-secret');

          // Redirect to Frontend with token in URL fragment
          // Cross-domain cookies won't work, so pass the token in the URL for the frontend to store
          const redirectTarget = normalizeAuthRedirect(url.searchParams.get("state"));
          const headers = new Headers();
          // Still set cookie for Workers domain (for API calls that go directly to Workers)
          headers.set("Set-Cookie", `session=${sessionToken}; Path=/; HttpOnly; SameSite=None; Secure; Max-Age=2592000`);
          // Redirect with token in hash (hash fragment is not sent to server, so it's secure)
          headers.set("Location", `${redirectTarget}/#auth_token=${sessionToken}`);

          return new Response(null, { status: 302, headers });

        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // 2.5 Google Token Verification (Popup/One-Tap Flow)
      if (path === "/api/auth/verify" && request.method === "POST") {
        try {
          const { credential, visitor_id } = await request.json() as { credential?: string, visitor_id?: string };
          if (!credential) return corsResponse(request, "Missing credential", 400);

          // Verify with Google
          const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
          const googleUser: any = await googleRes.json();

          if (googleUser.error || googleUser.aud !== env.GOOGLE_CLIENT_ID) {
            return corsResponse(request, JSON.stringify({ error: "Invalid token" }), 401);
          }

          // Upsert User in D1 (using sub as the ID)
          const userId = googleUser.sub;
          const email = googleUser.email;
          const name = googleUser.name;
          const picture = googleUser.picture;

          const existingUser = await env.LOCKSMITH_DB.prepare("SELECT * FROM users WHERE id = ?").bind(userId).first<any>();

          if (!existingUser) {
            const trialUntil = Date.now() + (14 * 24 * 60 * 60 * 1000); // 14 days trial
            await env.LOCKSMITH_DB.prepare(
              "INSERT INTO users (id, email, name, picture, created_at, trial_until, visitor_id) VALUES (?, ?, ?, ?, ?, ?, ?)"
            ).bind(userId, email, name, picture, Date.now(), trialUntil, visitor_id || null).run();
          } else {
            // Update details + visitor_id if provided and not already set
            if (visitor_id && !existingUser.visitor_id) {
              await env.LOCKSMITH_DB.prepare(
                "UPDATE users SET email = ?, name = ?, picture = ?, visitor_id = ? WHERE id = ?"
              ).bind(email, name, picture, visitor_id, userId).run();
            } else {
              await env.LOCKSMITH_DB.prepare(
                "UPDATE users SET email = ?, name = ?, picture = ? WHERE id = ?"
              ).bind(email, name, picture, userId).run();
            }
          }

          const user = await env.LOCKSMITH_DB.prepare("SELECT * FROM users WHERE id = ?").bind(userId).first<any>();
          const userIsDeveloper = isDeveloper(email, env.DEV_EMAILS);

          if (userIsDeveloper && !user.is_developer) {
            await env.LOCKSMITH_DB.prepare("UPDATE users SET is_developer = TRUE WHERE id = ?").bind(userId).run();
            user.is_developer = true;
          }

          // Log activity
          try {
            await env.LOCKSMITH_DB.prepare(
              "INSERT INTO user_activity (user_id, action, details, created_at) VALUES (?, ?, ?, ?)"
            ).bind(userId, 'sign_in_popup', JSON.stringify({ email }), Date.now()).run();
          } catch (e) { }

          // Create Session Cookie
          const userWithDev = { ...user, is_developer: userIsDeveloper || user.is_developer };
          const sessionToken = await createInternalToken(userWithDev, env.JWT_SECRET || 'dev-secret');

          const headers = new Headers();
          headers.set("Set-Cookie", `session=${sessionToken}; Path=/; HttpOnly; SameSite=None; Secure; Max-Age=2592000`);

          return corsResponse(request, JSON.stringify({ success: true, user: userWithDev }), 200, headers);
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // 3. Get Current User
      if (path === "/api/user") {
        try {
          // Use getSessionToken to support both Bearer and Cookie auth
          const sessionToken = getSessionToken(request);

          if (!sessionToken) {
            return corsResponse(request, JSON.stringify({ user: null }), 200);
          }

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload) {
            return corsResponse(request, JSON.stringify({ user: null }), 200);
          }

          // Refresh data from DB to get latest status and also check developer email
          const user = await env.LOCKSMITH_DB.prepare("SELECT id, name, email, picture, is_pro, is_developer, trial_until, created_at FROM users WHERE id = ?").bind(payload.sub).first<any>();

          // Also check email allow-list for developer access
          if (user && !user.is_developer && isDeveloper(user.email, env.DEV_EMAILS)) {
            user.is_developer = true;
          }

          return corsResponse(request, JSON.stringify({ user }), 200);
        } catch (err: any) {
          console.error('/api/user error:', err);
          return corsResponse(request, JSON.stringify({ user: null, error: err.message }), 200);
        }
      }

      // 4. Logout
      if (path === "/api/auth/logout") {
        const headers = new Headers();
        headers.set("Set-Cookie", `session=; Path=/; HttpOnly; SameSite=None; Secure; Max-Age=0`);
        return corsResponse(request, JSON.stringify({ success: true }), 200, headers, "application/json");
      }

      // ==============================================
      // SYNC HEALTH CHECK ENDPOINT
      // ==============================================

      // GET /api/sync/health - Validate database schema for sync compatibility
      if (path === "/api/sync/health" && request.method === "GET") {
        try {
          // Define required tables and their columns for sync
          const requiredSchema = {
            job_logs: ['id', 'user_id', 'data', 'created_at', 'updated_at'],
            user_inventory: ['id', 'user_id', 'data', 'created_at', 'updated_at'],
            pipeline_leads: ['id', 'user_id', 'data', 'created_at', 'updated_at'],
            invoices: ['id', 'user_id', 'data', 'created_at', 'updated_at'],
            fleet_customers: ['id', 'user_id', 'data', 'created_at', 'updated_at'],
            technicians: ['id', 'user_id', 'data', 'created_at', 'updated_at'],
            user_licenses: ['id', 'user_id', 'data', 'created_at', 'updated_at'],
          };

          const results: Record<string, { exists: boolean; columns: string[]; missing: string[] }> = {};
          let allValid = true;

          for (const [tableName, requiredColumns] of Object.entries(requiredSchema)) {
            try {
              // Check if table exists and get its columns
              const tableInfo = await env.LOCKSMITH_DB.prepare(
                `PRAGMA table_info(${tableName})`
              ).all();

              if (!tableInfo.results || tableInfo.results.length === 0) {
                results[tableName] = { exists: false, columns: [], missing: requiredColumns };
                allValid = false;
              } else {
                const existingColumns = tableInfo.results.map((col: any) => col.name);
                const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));

                results[tableName] = {
                  exists: true,
                  columns: existingColumns,
                  missing: missingColumns
                };

                if (missingColumns.length > 0) {
                  allValid = false;
                }
              }
            } catch (e) {
              results[tableName] = { exists: false, columns: [], missing: requiredColumns };
              allValid = false;
            }
          }

          return corsResponse(request, JSON.stringify({
            healthy: allValid,
            schemaVersion: 1,
            serverTime: Date.now(),
            tables: results
          }), allValid ? 200 : 503);
        } catch (err: any) {
          console.error('/api/sync/health error:', err);
          return corsResponse(request, JSON.stringify({
            healthy: false,
            error: err.message,
            serverTime: Date.now()
          }), 500);
        }
      }

      // ==============================================
      // JOBS CLOUD SYNC ENDPOINTS
      // ==============================================

      // GET /api/jobs - Get all jobs for authenticated user (with delta sync support)
      if (path === "/api/jobs" && request.method === "GET") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const userId = payload.sub as string;

          // Delta sync support: only return jobs updated since the given timestamp
          const sinceParam = url.searchParams.get('since');
          // Select individual columns (structured like user_inventory)
          let query = `SELECT 
            id, created_at, updated_at, 
            vehicle, fcc_id, key_type, job_type, price, date, notes,
            customer_name, customer_phone, customer_email, customer_address,
            fleet_id, technician_id, technician_name,
            status, claimed_at, started_at, completed_at, priority, source,
            parts_cost, key_cost, service_cost, miles_driven, gas_cost,
            referral_source, synced_at, sync_status, device_id
          FROM job_logs WHERE user_id = ?`;
          const params: any[] = [userId];

          if (sinceParam) {
            const sinceTs = parseInt(sinceParam, 10);
            if (!isNaN(sinceTs)) {
              query += " AND (updated_at > ? OR (updated_at IS NULL AND created_at > ?))";
              params.push(sinceTs, sinceTs);
            }
          }

          query += " ORDER BY created_at DESC";

          const result = await env.LOCKSMITH_DB.prepare(query).bind(...params).all();

          // Map DB columns to camelCase response
          const jobs = (result.results || []).map((row: any) => ({
            id: row.id,
            vehicle: row.vehicle,
            fccId: row.fcc_id,
            keyType: row.key_type,
            jobType: row.job_type,
            price: row.price,
            date: row.date,
            notes: row.notes,
            customerName: row.customer_name,
            customerPhone: row.customer_phone,
            customerEmail: row.customer_email,
            customerAddress: row.customer_address,
            fleetId: row.fleet_id,
            technicianId: row.technician_id,
            technicianName: row.technician_name,
            status: row.status || 'completed',
            claimedAt: row.claimed_at,
            startedAt: row.started_at,
            completedAt: row.completed_at,
            priority: row.priority || 'normal',
            source: row.source,
            partsCost: row.parts_cost,
            keyCost: row.key_cost,
            serviceCost: row.service_cost,
            milesDriven: row.miles_driven,
            gasCost: row.gas_cost,
            referralSource: row.referral_source,
            createdAt: row.created_at,
            updatedAt: row.updated_at || row.created_at,
            syncedAt: row.synced_at,
            syncStatus: row.sync_status || 'synced',
            deviceId: row.device_id
          }));

          // Add server time header for clock sync
          const headers = new Headers();
          headers.set('X-Server-Time', String(Date.now()));

          return corsResponse(request, JSON.stringify({
            jobs,
            serverTime: Date.now(),
            isDelta: !!sinceParam
          }), 200, headers);
        } catch (err: any) {
          console.error('/api/jobs GET error:', err);
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // POST /api/jobs - Create or sync a job
      if (path === "/api/jobs" && request.method === "POST") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const userId = payload.sub as string;
          const job = await request.json() as any;

          // Generate ID if not provided
          const jobId = job.id || `job_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
          const createdAt = job.createdAt || Date.now();
          const updatedAt = job.updatedAt || Date.now();

          // Insert into individual columns (structured like user_inventory)
          await env.LOCKSMITH_DB.prepare(`
            INSERT OR REPLACE INTO job_logs (
              id, user_id, created_at, updated_at,
              vehicle, fcc_id, key_type, job_type, price, date, notes,
              customer_name, customer_phone, customer_email, customer_address,
              fleet_id, technician_id, technician_name,
              status, claimed_at, started_at, completed_at, priority, source,
              parts_cost, key_cost, service_cost, miles_driven, gas_cost,
              referral_source, synced_at, sync_status, device_id, data
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            jobId, userId, createdAt, updatedAt,
            job.vehicle || null,
            job.fccId || null,
            job.keyType || null,
            job.jobType || null,
            job.price || null,
            job.date || null,
            job.notes || null,
            job.customerName || null,
            job.customerPhone || null,
            job.customerEmail || null,
            job.customerAddress || null,
            job.fleetId || null,
            job.technicianId || null,
            job.technicianName || null,
            job.status || 'completed',
            job.claimedAt || null,
            job.startedAt || null,
            job.completedAt || null,
            job.priority || 'normal',
            job.source || null,
            job.partsCost || null,
            job.keyCost || null,
            job.serviceCost || null,
            job.milesDriven || null,
            job.gasCost || null,
            job.referralSource || null,
            Date.now(),
            'synced',
            job.deviceId || null,
            JSON.stringify(job) // Keep JSON for backwards compatibility during transition
          ).run();

          return corsResponse(request, JSON.stringify({ success: true, id: jobId, serverTime: Date.now() }), 200);
        } catch (err: any) {
          console.error('/api/jobs POST error:', err);
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // DELETE /api/jobs/:id - Delete a job
      if (path.startsWith("/api/jobs/") && request.method === "DELETE") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const userId = payload.sub as string;
          const jobId = path.replace("/api/jobs/", "");

          // Only delete if the job belongs to this user
          await env.LOCKSMITH_DB.prepare(
            "DELETE FROM job_logs WHERE id = ? AND user_id = ?"
          ).bind(jobId, userId).run();

          return corsResponse(request, JSON.stringify({ success: true }), 200);
        } catch (err: any) {
          console.error('/api/jobs DELETE error:', err);
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // POST /api/jobs/sync - Bulk sync jobs from localStorage
      if (path === "/api/jobs/sync" && request.method === "POST") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const userId = payload.sub as string;
          const { jobs, deviceId } = await request.json() as { jobs: any[], deviceId?: string };

          if (!Array.isArray(jobs)) {
            return corsResponse(request, JSON.stringify({ error: "jobs must be an array" }), 400);
          }

          // Batch insert/update all jobs into individual columns
          let synced = 0;
          const serverTime = Date.now();
          for (const job of jobs) {
            const jobId = job.id || `job_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            const createdAt = job.createdAt || serverTime;
            const updatedAt = job.updatedAt || serverTime;
            const jobDeviceId = deviceId || job.deviceId || null;

            await env.LOCKSMITH_DB.prepare(`
              INSERT OR REPLACE INTO job_logs (
                id, user_id, created_at, updated_at,
                vehicle, fcc_id, key_type, job_type, price, date, notes,
                customer_name, customer_phone, customer_email, customer_address,
                fleet_id, technician_id, technician_name,
                status, claimed_at, started_at, completed_at, priority, source,
                parts_cost, key_cost, service_cost, miles_driven, gas_cost,
                referral_source, synced_at, sync_status, device_id, data
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(
              jobId, userId, createdAt, updatedAt,
              job.vehicle || null,
              job.fccId || null,
              job.keyType || null,
              job.jobType || null,
              job.price || null,
              job.date || null,
              job.notes || null,
              job.customerName || null,
              job.customerPhone || null,
              job.customerEmail || null,
              job.customerAddress || null,
              job.fleetId || null,
              job.technicianId || null,
              job.technicianName || null,
              job.status || 'completed',
              job.claimedAt || null,
              job.startedAt || null,
              job.completedAt || null,
              job.priority || 'normal',
              job.source || null,
              job.partsCost || null,
              job.keyCost || null,
              job.serviceCost || null,
              job.milesDriven || null,
              job.gasCost || null,
              job.referralSource || null,
              serverTime,
              'synced',
              jobDeviceId,
              JSON.stringify(job) // Keep JSON for backwards compatibility
            ).run();
            synced++;
          }

          return corsResponse(request, JSON.stringify({
            success: true,
            synced,
            serverTime
          }), 200);
        } catch (err: any) {
          console.error('/api/jobs/sync error:', err);
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // ==============================================
      // STRIPE SUBSCRIPTION ENDPOINTS
      // ==============================================

      // POST /api/stripe/checkout - Create Stripe Checkout Session
      if (path === "/api/stripe/checkout" && request.method === "POST") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const userId = payload.sub as string;
          const userEmail = payload.email as string;

          // Get or create Stripe customer
          const user = await env.LOCKSMITH_DB.prepare("SELECT stripe_customer_id FROM users WHERE id = ?").bind(userId).first<any>();

          let customerId = user?.stripe_customer_id;

          if (!customerId) {
            // Create Stripe customer
            const customerRes = await fetch("https://api.stripe.com/v1/customers", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${env.STRIPE_SECRET_KEY}`,
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: new URLSearchParams({
                email: userEmail,
                metadata: { user_id: userId } as any,
              }),
            });
            const customer = await customerRes.json() as any;
            if (customer.error) {
              return corsResponse(request, JSON.stringify({ error: customer.error.message }), 400);
            }
            customerId = customer.id;

            // Save customer ID to DB
            await env.LOCKSMITH_DB.prepare("UPDATE users SET stripe_customer_id = ? WHERE id = ?").bind(customerId, userId).run();
          }

          // Create checkout session with 7-day trial
          const origin = request.headers.get("Origin") || "https://eurokeys.app";
          const checkoutRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${env.STRIPE_SECRET_KEY}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              "customer": customerId,
              "mode": "subscription",
              "line_items[0][price]": env.STRIPE_PRICE_ID,
              "line_items[0][quantity]": "1",
              "subscription_data[trial_period_days]": "7",
              "success_url": `${origin}/pricing?success=true`,
              "cancel_url": `${origin}/pricing?canceled=true`,
              "metadata[user_id]": userId,
            }),
          });
          const session = await checkoutRes.json() as any;

          if (session.error) {
            return corsResponse(request, JSON.stringify({ error: session.error.message }), 400);
          }

          return corsResponse(request, JSON.stringify({ url: session.url }));
        } catch (err: any) {
          console.error("/api/stripe/checkout error:", err);
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // POST /api/stripe/webhook - Handle Stripe webhook events
      if (path === "/api/stripe/webhook" && request.method === "POST") {
        try {
          const body = await request.text();
          const sig = request.headers.get("stripe-signature");

          if (!sig || !env.STRIPE_WEBHOOK_SECRET) {
            return new Response("Missing signature or webhook secret", { status: 400 });
          }

          // Verify webhook signature using Stripe's algorithm
          const signatureParts = sig.split(",").reduce((acc: any, part) => {
            const [key, value] = part.split("=");
            acc[key] = value;
            return acc;
          }, {});

          const timestamp = signatureParts.t;
          const expectedSig = signatureParts.v1;

          if (!timestamp || !expectedSig) {
            return new Response("Invalid signature format", { status: 400 });
          }

          // Verify timestamp is within tolerance (5 minutes)
          const timestampAge = Math.floor(Date.now() / 1000) - parseInt(timestamp);
          if (timestampAge > 300) {
            return new Response("Timestamp too old", { status: 400 });
          }

          // Compute expected signature
          const signedPayload = `${timestamp}.${body}`;
          const encoder = new TextEncoder();
          const key = await crypto.subtle.importKey(
            "raw",
            encoder.encode(env.STRIPE_WEBHOOK_SECRET),
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["sign"]
          );
          const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(signedPayload));
          const computedSig = Array.from(new Uint8Array(signature))
            .map(b => b.toString(16).padStart(2, "0"))
            .join("");

          if (computedSig !== expectedSig) {
            return new Response("Invalid signature", { status: 400 });
          }

          const event = JSON.parse(body);
          console.log("Stripe webhook event:", event.type);

          // Handle subscription events
          if (event.type === "checkout.session.completed") {
            const session = event.data.object;
            const customerId = session.customer;

            // Find user by customer ID and update is_pro
            await env.LOCKSMITH_DB.prepare(`
              UPDATE users SET is_pro = 1, subscription_status = 'active' 
              WHERE stripe_customer_id = ?
            `).bind(customerId).run();

            console.log("User upgraded to Pro:", customerId);
          }

          if (event.type === "customer.subscription.updated") {
            const subscription = event.data.object;
            const customerId = subscription.customer;
            const status = subscription.status; // active, trialing, past_due, canceled, etc.

            const isPro = status === "active" || status === "trialing";
            await env.LOCKSMITH_DB.prepare(`
              UPDATE users SET is_pro = ?, subscription_status = ? 
              WHERE stripe_customer_id = ?
            `).bind(isPro ? 1 : 0, status, customerId).run();

            console.log("Subscription updated:", customerId, status);
          }

          if (event.type === "customer.subscription.deleted") {
            const subscription = event.data.object;
            const customerId = subscription.customer;

            await env.LOCKSMITH_DB.prepare(`
              UPDATE users SET is_pro = 0, subscription_status = 'canceled' 
              WHERE stripe_customer_id = ?
            `).bind(customerId).run();

            console.log("Subscription canceled:", customerId);
          }

          return new Response(JSON.stringify({ received: true }), { status: 200 });
        } catch (err: any) {
          console.error("/api/stripe/webhook error:", err);
          return new Response(err.message, { status: 400 });
        }
      }

      // GET /api/stripe/portal - Create Stripe Customer Portal session
      if (path === "/api/stripe/portal" && request.method === "GET") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const userId = payload.sub as string;
          const user = await env.LOCKSMITH_DB.prepare("SELECT stripe_customer_id FROM users WHERE id = ?").bind(userId).first<any>();

          if (!user?.stripe_customer_id) {
            return corsResponse(request, JSON.stringify({ error: "No subscription found" }), 404);
          }

          const origin = request.headers.get("Origin") || "https://eurokeys.app";
          const portalRes = await fetch("https://api.stripe.com/v1/billing_portal/sessions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${env.STRIPE_SECRET_KEY}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              customer: user.stripe_customer_id,
              return_url: `${origin}/business`,
            }),
          });
          const portal = await portalRes.json() as any;

          if (portal.error) {
            return corsResponse(request, JSON.stringify({ error: portal.error.message }), 400);
          }

          return corsResponse(request, JSON.stringify({ url: portal.url }));
        } catch (err: any) {
          console.error("/api/stripe/portal error:", err);
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // 5. Sync Data (Frontend -> Cloud)
      if (path === "/api/sync" && request.method === "POST") {
        try {
          // Authenticate
          const cookieHeader = request.headers.get("Cookie");
          const sessionToken = cookieHeader?.split(';').find(c => c.trim().startsWith('session='))?.split('=')[1];
          if (!sessionToken) return corsResponse(request, "Unauthorized", 401);
          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, "Unauthorized", 401);
          const userId = payload.sub as string;

          const body: any = await request.json();
          const { inventory, logs, settings } = body;

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

          return corsResponse(request, JSON.stringify({ success: true, synced_at: Date.now() }), 200);

        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // ==============================================
      // USER INVENTORY ENDPOINTS (Cloud Sync)
      // ==============================================

      // GET /api/user/inventory - Fetch user's inventory (with ETag + Delta sync support)
      if (path === "/api/user/inventory" && request.method === "GET") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const userId = payload.sub as string;

          // Delta sync support: only return items updated since the given timestamp
          const sinceParam = url.searchParams.get('since');
          let query = `SELECT item_key, type, qty, used, vehicle, amazon_link, updated_at FROM inventory WHERE user_id = ?`;
          const params: any[] = [userId];

          if (sinceParam) {
            const sinceTs = parseInt(sinceParam, 10);
            if (!isNaN(sinceTs)) {
              query += ` AND updated_at > ?`;
              params.push(sinceTs);
            }
          }

          const result = await env.LOCKSMITH_DB.prepare(query).bind(...params).all();

          const keys: Record<string, any> = {};
          const blanks: Record<string, any> = {};

          for (const row of (result.results || []) as any[]) {
            const item = { qty: row.qty, used: row.used || 0, vehicle: row.vehicle, amazonLink: row.amazon_link, updatedAt: row.updated_at };
            if (row.type === 'key') keys[row.item_key] = item;
            else blanks[row.item_key] = item;
          }

          const responseData = { keys, blanks };
          const dataString = JSON.stringify(responseData);

          // Generate ETag from data hash
          const encoder = new TextEncoder();
          const data = encoder.encode(dataString);
          const hashBuffer = await crypto.subtle.digest('SHA-256', data);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          const etag = `"${hashArray.slice(0, 8).map(b => b.toString(16).padStart(2, '0')).join('')}"`;

          // Check If-None-Match header
          const clientEtag = request.headers.get('If-None-Match');
          if (clientEtag && clientEtag === etag) {
            // Data hasn't changed - return 304 Not Modified
            const headers = new Headers();
            headers.set('ETag', etag);
            headers.set('Cache-Control', 'private, max-age=0, must-revalidate');
            return corsResponse(request, '', 304, headers);
          }

          // Return data with ETag
          const headers = new Headers();
          headers.set('ETag', etag);
          headers.set('Cache-Control', 'private, max-age=0, must-revalidate');
          return corsResponse(request, dataString, 200, headers);
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // POST /api/user/inventory - Add/Update single inventory item
      if (path === "/api/user/inventory" && request.method === "POST") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const userId = payload.sub as string;
          const body: any = await request.json();
          const { item_key, type, qty, used, vehicle, amazon_link } = body;

          if (!item_key || !type) return corsResponse(request, JSON.stringify({ error: "Missing item_key or type" }), 400);

          await env.LOCKSMITH_DB.prepare(`
          INSERT INTO inventory (user_id, item_key, type, qty, used, vehicle, amazon_link, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(user_id, item_key, type) DO UPDATE SET
            qty = excluded.qty, used = excluded.used, vehicle = COALESCE(excluded.vehicle, vehicle),
            amazon_link = COALESCE(excluded.amazon_link, amazon_link), updated_at = excluded.updated_at
        `).bind(userId, item_key, type, qty || 0, used || 0, vehicle || null, amazon_link || null, Date.now()).run();

          return corsResponse(request, JSON.stringify({ success: true, item_key, type, qty }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // DELETE /api/user/inventory - Remove inventory item
      if (path === "/api/user/inventory" && request.method === "DELETE") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const userId = payload.sub as string;
          const body: any = await request.json();
          const { item_key, type } = body;

          if (!item_key || !type) return corsResponse(request, JSON.stringify({ error: "Missing item_key or type" }), 400);

          await env.LOCKSMITH_DB.prepare(`DELETE FROM inventory WHERE user_id = ? AND item_key = ? AND type = ?`).bind(userId, item_key, type).run();

          return corsResponse(request, JSON.stringify({ success: true, deleted: { item_key, type } }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // ==============================================
      // JOB LOGS ENDPOINTS (Cloud Sync)
      // ==============================================

      // GET /api/user/job_logs - Fetch user's job logs
      if (path === "/api/user/job_logs" && request.method === "GET") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const userId = payload.sub as string;

          const result = await env.LOCKSMITH_DB.prepare(`
          SELECT id, data, created_at FROM job_logs WHERE user_id = ? ORDER BY created_at DESC
        `).bind(userId).all();

          const logs = (result.results || []).map((row: any) => ({
            id: row.id,
            ...JSON.parse(row.data || '{}'),
            created_at: row.created_at
          }));

          return corsResponse(request, JSON.stringify({ logs }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // POST /api/user/job_logs - Add a job log entry
      if (path === "/api/user/job_logs" && request.method === "POST") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const userId = payload.sub as string;
          const body: any = await request.json();
          const { id, log } = body;

          if (!id || !log) return corsResponse(request, JSON.stringify({ error: "Missing id or log data" }), 400);

          await env.LOCKSMITH_DB.prepare(`
          INSERT INTO job_logs (id, user_id, data, created_at)
          VALUES (?, ?, ?, ?)
          ON CONFLICT(id) DO NOTHING
        `).bind(id, userId, JSON.stringify(log), log.timestamp || Date.now()).run();

          return corsResponse(request, JSON.stringify({ success: true, id }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // ==============================================
      // TOOL SUBSCRIPTIONS ENDPOINTS (Cloud Sync)
      // ==============================================

      // GET /api/user/tool-subscriptions - Fetch user's tool subscriptions
      if (path === "/api/user/tool-subscriptions" && request.method === "GET") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const userId = payload.sub as string;

          const result = await env.LOCKSMITH_DB.prepare(`
          SELECT id, data, created_at FROM user_tool_subscriptions WHERE user_id = ? ORDER BY created_at DESC
        `).bind(userId).all();

          const subscriptions = (result.results || []).map((row: any) => ({
            id: row.id,
            ...JSON.parse(row.data || '{}'),
            createdAt: row.created_at
          }));

          return corsResponse(request, JSON.stringify({ subscriptions }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // POST /api/user/tool-subscriptions - Add/Update a tool subscription
      if (path === "/api/user/tool-subscriptions" && request.method === "POST") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const userId = payload.sub as string;
          const body: any = await request.json();
          const { subscription } = body;

          if (!subscription || !subscription.id) return corsResponse(request, JSON.stringify({ error: "Missing subscription data or ID" }), 400);

          await env.LOCKSMITH_DB.prepare(`
          INSERT INTO user_tool_subscriptions (id, user_id, data, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            data = excluded.data,
            updated_at = excluded.updated_at
        `).bind(
            subscription.id,
            userId,
            JSON.stringify(subscription),
            subscription.createdAt || Date.now(),
            Date.now()
          ).run();

          return corsResponse(request, JSON.stringify({ success: true, id: subscription.id }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // DELETE /api/user/tool-subscriptions - Delete a tool subscription
      if (path === "/api/user/tool-subscriptions" && request.method === "DELETE") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const userId = payload.sub as string;
          const body: any = await request.json();
          const { id } = body;

          if (!id) return corsResponse(request, JSON.stringify({ error: "Missing ID" }), 400);

          await env.LOCKSMITH_DB.prepare(`
          DELETE FROM user_tool_subscriptions WHERE id = ? AND user_id = ?
        `).bind(id, userId).run();

          return corsResponse(request, JSON.stringify({ success: true, id }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // ==============================================
      // USER PREFERENCES ENDPOINTS (AI Insights Memory)
      // ==============================================

      // ==============================================
      // BUSINESS PROFILE ENDPOINTS (Cloud Sync for Tools)
      // ==============================================

      // GET /api/user/business-profile - Fetch user's business profile
      if (path === "/api/user/business-profile" && request.method === "GET") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const userId = payload.sub as string;

          const result = await env.LOCKSMITH_DB.prepare(`
            SELECT * FROM user_business_profile WHERE user_id = ?
          `).bind(userId).first();

          if (!result) {
            return corsResponse(request, JSON.stringify({ profile: null }));
          }

          return corsResponse(request, JSON.stringify({
            profile: {
              businessName: result.business_name,
              phone: result.phone,
              email: result.email,
              address: result.address,
              logo: result.logo,
              tools: result.tools ? JSON.parse(result.tools as string) : [],
              setupComplete: !!result.setup_complete,
              setupStep: result.setup_step,
              updatedAt: result.updated_at
            }
          }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // POST /api/user/business-profile - Save user's business profile
      if (path === "/api/user/business-profile" && request.method === "POST") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const userId = payload.sub as string;
          const body: any = await request.json();
          const { businessName, phone, email, address, logo, tools, setupComplete, setupStep } = body;

          await env.LOCKSMITH_DB.prepare(`
            INSERT INTO user_business_profile (user_id, business_name, phone, email, address, logo, tools, setup_complete, setup_step, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET
              business_name = COALESCE(excluded.business_name, user_business_profile.business_name),
              phone = COALESCE(excluded.phone, user_business_profile.phone),
              email = COALESCE(excluded.email, user_business_profile.email),
              address = COALESCE(excluded.address, user_business_profile.address),
              logo = COALESCE(excluded.logo, user_business_profile.logo),
              tools = COALESCE(excluded.tools, user_business_profile.tools),
              setup_complete = COALESCE(excluded.setup_complete, user_business_profile.setup_complete),
              setup_step = COALESCE(excluded.setup_step, user_business_profile.setup_step),
              updated_at = excluded.updated_at
          `).bind(
            userId,
            businessName || null,
            phone || null,
            email || null,
            address || null,
            logo || null,
            tools ? JSON.stringify(tools) : null,
            setupComplete ? 1 : 0,
            setupStep || null,
            Date.now()
          ).run();

          return corsResponse(request, JSON.stringify({ success: true }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // ==============================================
      // PIPELINE LEADS ENDPOINTS (Cloud Sync)
      // ==============================================

      // GET /api/user/pipeline-leads - Fetch user's pipeline leads
      if (path === "/api/user/pipeline-leads" && request.method === "GET") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const userId = payload.sub as string;

          const result = await env.LOCKSMITH_DB.prepare(`
            SELECT id, created_at, updated_at,
              customer_name, customer_phone, customer_email,
              vehicle, job_type, estimated_value, status, lost_reason,
              source, notes, follow_up_date
            FROM pipeline_leads WHERE user_id = ? ORDER BY updated_at DESC
          `).bind(userId).all();

          const leads = (result.results || []).map((row: any) => ({
            id: row.id,
            customerName: row.customer_name,
            customerPhone: row.customer_phone,
            customerEmail: row.customer_email,
            vehicle: row.vehicle,
            jobType: row.job_type,
            estimatedValue: row.estimated_value,
            status: row.status || 'new',
            lostReason: row.lost_reason,
            source: row.source,
            notes: row.notes,
            followUpDate: row.follow_up_date,
            createdAt: row.created_at,
            updatedAt: row.updated_at
          }));

          return corsResponse(request, JSON.stringify({ leads }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // POST /api/user/pipeline-leads - Add/Update a pipeline lead
      if (path === "/api/user/pipeline-leads" && request.method === "POST") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const userId = payload.sub as string;
          const body: any = await request.json();
          const { lead } = body;

          if (!lead || !lead.id) return corsResponse(request, JSON.stringify({ error: "Missing lead data or ID" }), 400);

          const now = Date.now();
          await env.LOCKSMITH_DB.prepare(`
            INSERT INTO pipeline_leads (
              id, user_id, created_at, updated_at,
              customer_name, customer_phone, customer_email,
              vehicle, job_type, estimated_value, status, lost_reason,
              source, notes, follow_up_date, synced_at, sync_status, data
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              updated_at = excluded.updated_at,
              customer_name = excluded.customer_name, customer_phone = excluded.customer_phone,
              customer_email = excluded.customer_email, vehicle = excluded.vehicle,
              job_type = excluded.job_type, estimated_value = excluded.estimated_value,
              status = excluded.status, lost_reason = excluded.lost_reason,
              source = excluded.source, notes = excluded.notes, follow_up_date = excluded.follow_up_date,
              synced_at = excluded.synced_at, data = excluded.data
          `).bind(
            lead.id,
            userId,
            lead.createdAt || now,
            now,
            lead.customerName || null,
            lead.customerPhone || null,
            lead.customerEmail || null,
            lead.vehicle || null,
            lead.jobType || null,
            lead.estimatedValue || null,
            lead.status || 'new',
            lead.lostReason || null,
            lead.source || null,
            lead.notes || null,
            lead.followUpDate || null,
            now,
            'synced',
            JSON.stringify(lead)
          ).run();

          return corsResponse(request, JSON.stringify({ success: true, id: lead.id }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // DELETE /api/user/pipeline-leads - Delete a pipeline lead
      if (path === "/api/user/pipeline-leads" && request.method === "DELETE") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const userId = payload.sub as string;
          const body: any = await request.json();
          const { id } = body;

          if (!id) return corsResponse(request, JSON.stringify({ error: "Missing ID" }), 400);

          await env.LOCKSMITH_DB.prepare(`
            DELETE FROM pipeline_leads WHERE id = ? AND user_id = ?
          `).bind(id, userId).run();

          return corsResponse(request, JSON.stringify({ success: true, id }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // ==============================================
      // INVOICES ENDPOINTS (Cloud Sync)
      // ==============================================

      // GET /api/user/invoices - Fetch user's invoices
      if (path === "/api/user/invoices" && request.method === "GET") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const userId = payload.sub as string;

          const result = await env.LOCKSMITH_DB.prepare(`
            SELECT id, created_at, updated_at,
              invoice_number, job_id, subtotal, tax_rate, tax_amount, total, notes, due_date, status,
              business_name, business_address, business_phone, business_email, business_logo_url,
              customer_name, customer_address, customer_phone, customer_email,
              line_items
            FROM invoices WHERE user_id = ? ORDER BY created_at DESC
          `).bind(userId).all();

          const invoices = (result.results || []).map((row: any) => ({
            id: row.id,
            invoiceNumber: row.invoice_number,
            jobId: row.job_id,
            subtotal: row.subtotal,
            taxRate: row.tax_rate,
            taxAmount: row.tax_amount,
            total: row.total,
            notes: row.notes,
            dueDate: row.due_date,
            status: row.status || 'draft',
            businessInfo: {
              name: row.business_name,
              address: row.business_address,
              phone: row.business_phone,
              email: row.business_email,
              logoUrl: row.business_logo_url
            },
            customerInfo: {
              name: row.customer_name,
              address: row.customer_address,
              phone: row.customer_phone,
              email: row.customer_email
            },
            lineItems: row.line_items ? JSON.parse(row.line_items) : [],
            createdAt: row.created_at
          }));

          return corsResponse(request, JSON.stringify({ invoices }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // POST /api/user/invoices - Add an invoice
      if (path === "/api/user/invoices" && request.method === "POST") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const userId = payload.sub as string;
          const body: any = await request.json();
          const { invoice } = body;

          if (!invoice || !invoice.id) return corsResponse(request, JSON.stringify({ error: "Missing invoice data or ID" }), 400);

          const now = Date.now();
          await env.LOCKSMITH_DB.prepare(`
            INSERT INTO invoices (
              id, user_id, created_at, updated_at,
              invoice_number, job_id, subtotal, tax_rate, tax_amount, total, notes, due_date, status,
              business_name, business_address, business_phone, business_email, business_logo_url,
              customer_name, customer_address, customer_phone, customer_email,
              line_items, synced_at, sync_status, data
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              updated_at = excluded.updated_at,
              invoice_number = excluded.invoice_number, job_id = excluded.job_id,
              subtotal = excluded.subtotal, tax_rate = excluded.tax_rate, tax_amount = excluded.tax_amount,
              total = excluded.total, notes = excluded.notes, due_date = excluded.due_date, status = excluded.status,
              business_name = excluded.business_name, business_address = excluded.business_address,
              business_phone = excluded.business_phone, business_email = excluded.business_email, business_logo_url = excluded.business_logo_url,
              customer_name = excluded.customer_name, customer_address = excluded.customer_address,
              customer_phone = excluded.customer_phone, customer_email = excluded.customer_email,
              line_items = excluded.line_items, synced_at = excluded.synced_at, data = excluded.data
          `).bind(
            invoice.id,
            userId,
            invoice.createdAt || now,
            now,
            invoice.invoiceNumber || null,
            invoice.jobId || null,
            invoice.subtotal || 0,
            invoice.taxRate || null,
            invoice.taxAmount || null,
            invoice.total || 0,
            invoice.notes || null,
            invoice.dueDate || null,
            invoice.status || 'draft',
            invoice.businessInfo?.name || null,
            invoice.businessInfo?.address || null,
            invoice.businessInfo?.phone || null,
            invoice.businessInfo?.email || null,
            invoice.businessInfo?.logoUrl || null,
            invoice.customerInfo?.name || null,
            invoice.customerInfo?.address || null,
            invoice.customerInfo?.phone || null,
            invoice.customerInfo?.email || null,
            JSON.stringify(invoice.lineItems || []),
            now,
            'synced',
            JSON.stringify(invoice) // Keep JSON for backwards compatibility
          ).run();

          return corsResponse(request, JSON.stringify({ success: true, id: invoice.id }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // DELETE /api/user/invoices - Delete an invoice
      if (path === "/api/user/invoices" && request.method === "DELETE") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const userId = payload.sub as string;
          const body: any = await request.json();
          const { id } = body;

          if (!id) return corsResponse(request, JSON.stringify({ error: "Missing ID" }), 400);

          await env.LOCKSMITH_DB.prepare(`DELETE FROM invoices WHERE id = ? AND user_id = ?`).bind(id, userId).run();

          return corsResponse(request, JSON.stringify({ success: true, id }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // ==============================================
      // FLEET CUSTOMERS ENDPOINTS (Cloud Sync)
      // ==============================================

      // GET /api/user/fleet-customers - Fetch user's fleet customers
      if (path === "/api/user/fleet-customers" && request.method === "GET") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const userId = payload.sub as string;

          const result = await env.LOCKSMITH_DB.prepare(`
            SELECT id, data, created_at, updated_at FROM fleet_customers WHERE user_id = ? ORDER BY updated_at DESC
          `).bind(userId).all();

          const customers = (result.results || []).map((row: any) => ({
            id: row.id,
            ...JSON.parse(row.data || '{}'),
            createdAt: row.created_at,
            updatedAt: row.updated_at
          }));

          return corsResponse(request, JSON.stringify({ customers }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // POST /api/user/fleet-customers - Add/Update a fleet customer
      if (path === "/api/user/fleet-customers" && request.method === "POST") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const userId = payload.sub as string;
          const body: any = await request.json();
          const { customer } = body;

          if (!customer || !customer.id) return corsResponse(request, JSON.stringify({ error: "Missing customer data or ID" }), 400);

          await env.LOCKSMITH_DB.prepare(`
            INSERT INTO fleet_customers (id, user_id, data, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              data = excluded.data,
              updated_at = excluded.updated_at
          `).bind(
            customer.id,
            userId,
            JSON.stringify(customer),
            customer.createdAt || Date.now(),
            Date.now()
          ).run();

          return corsResponse(request, JSON.stringify({ success: true, id: customer.id }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // DELETE /api/user/fleet-customers - Delete a fleet customer
      if (path === "/api/user/fleet-customers" && request.method === "DELETE") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const userId = payload.sub as string;
          const body: any = await request.json();
          const { id } = body;

          if (!id) return corsResponse(request, JSON.stringify({ error: "Missing ID" }), 400);

          await env.LOCKSMITH_DB.prepare(`DELETE FROM fleet_customers WHERE id = ? AND user_id = ?`).bind(id, userId).run();

          return corsResponse(request, JSON.stringify({ success: true, id }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // ==============================================
      // TECHNICIANS ENDPOINTS (Cloud Sync)
      // ==============================================

      // GET /api/user/technicians - Fetch user's technicians
      if (path === "/api/user/technicians" && request.method === "GET") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const userId = payload.sub as string;

          const result = await env.LOCKSMITH_DB.prepare(`
            SELECT id, data, created_at, updated_at FROM technicians WHERE user_id = ? ORDER BY updated_at DESC
          `).bind(userId).all();

          const technicians = (result.results || []).map((row: any) => ({
            id: row.id,
            ...JSON.parse(row.data || '{}'),
            createdAt: row.created_at,
            updatedAt: row.updated_at
          }));

          return corsResponse(request, JSON.stringify({ technicians }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // POST /api/user/technicians - Add/Update a technician
      if (path === "/api/user/technicians" && request.method === "POST") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const userId = payload.sub as string;
          const body: any = await request.json();
          const { technician } = body;

          if (!technician || !technician.id) return corsResponse(request, JSON.stringify({ error: "Missing technician data or ID" }), 400);

          await env.LOCKSMITH_DB.prepare(`
            INSERT INTO technicians (id, user_id, data, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              data = excluded.data,
              updated_at = excluded.updated_at
          `).bind(
            technician.id,
            userId,
            JSON.stringify(technician),
            technician.createdAt || Date.now(),
            Date.now()
          ).run();

          return corsResponse(request, JSON.stringify({ success: true, id: technician.id }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // DELETE /api/user/technicians - Delete a technician
      if (path === "/api/user/technicians" && request.method === "DELETE") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const userId = payload.sub as string;
          const body: any = await request.json();
          const { id } = body;

          if (!id) return corsResponse(request, JSON.stringify({ error: "Missing ID" }), 400);

          await env.LOCKSMITH_DB.prepare(`DELETE FROM technicians WHERE id = ? AND user_id = ?`).bind(id, userId).run();

          return corsResponse(request, JSON.stringify({ success: true, id }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // ==============================================
      // USER LICENSES ENDPOINTS (Cloud Sync for Licenses/Tokens)
      // ==============================================

      // GET /api/user/licenses - Fetch user's licenses with token history
      if (path === "/api/user/licenses" && request.method === "GET") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const userId = payload.sub as string;

          const result = await env.LOCKSMITH_DB.prepare(`
            SELECT id, data, created_at, updated_at FROM user_licenses WHERE user_id = ? ORDER BY updated_at DESC
          `).bind(userId).all();

          const licenses = (result.results || []).map((row: any) => ({
            id: row.id,
            ...JSON.parse(row.data || '{}'),
            createdAt: row.created_at,
            updatedAt: row.updated_at
          }));

          return corsResponse(request, JSON.stringify({ licenses }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // POST /api/user/licenses - Add/Update a license (includes token history)
      if (path === "/api/user/licenses" && request.method === "POST") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const userId = payload.sub as string;
          const body: any = await request.json();
          const { license } = body;

          if (!license || !license.id) return corsResponse(request, JSON.stringify({ error: "Missing license data or ID" }), 400);

          await env.LOCKSMITH_DB.prepare(`
            INSERT INTO user_licenses (id, user_id, data, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              data = excluded.data,
              updated_at = excluded.updated_at
          `).bind(
            license.id,
            userId,
            JSON.stringify(license),
            license.createdAt || Date.now(),
            Date.now()
          ).run();

          return corsResponse(request, JSON.stringify({ success: true, id: license.id }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // DELETE /api/user/licenses - Delete a license
      if (path === "/api/user/licenses" && request.method === "DELETE") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const userId = payload.sub as string;
          const body: any = await request.json();
          const { id } = body;

          if (!id) return corsResponse(request, JSON.stringify({ error: "Missing ID" }), 400);

          await env.LOCKSMITH_DB.prepare(`DELETE FROM user_licenses WHERE id = ? AND user_id = ?`).bind(id, userId).run();

          return corsResponse(request, JSON.stringify({ success: true, id }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // ==============================================
      // FLEET ORGANIZATION ENDPOINTS (Multi-User Teams)
      // ==============================================

      // GET /api/fleet/organization - Get current user's fleet org, members, and invites
      if (path === "/api/fleet/organization" && request.method === "GET") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const userId = payload.sub as string;

          // First check if user is an owner
          let org = await env.LOCKSMITH_DB.prepare(`
            SELECT * FROM fleet_organizations WHERE owner_user_id = ?
          `).bind(userId).first();

          // If not an owner, check if they're a member of any org
          let memberRecord: any = null;
          if (!org) {
            memberRecord = await env.LOCKSMITH_DB.prepare(`
              SELECT fm.*, fo.* FROM fleet_members fm
              JOIN fleet_organizations fo ON fm.organization_id = fo.id
              WHERE fm.user_id = ? AND fm.status = 'active'
            `).bind(userId).first();

            if (memberRecord) {
              org = {
                id: memberRecord.organization_id || memberRecord.id,
                owner_user_id: memberRecord.owner_user_id,
                name: memberRecord.name,
                plan: memberRecord.plan,
                max_dispatchers: memberRecord.max_dispatchers,
                max_technicians: memberRecord.max_technicians,
                status: memberRecord.status,
                created_at: memberRecord.created_at,
                updated_at: memberRecord.updated_at
              };
            }
          }

          if (!org) {
            return corsResponse(request, JSON.stringify({
              organization: null,
              members: [],
              invites: []
            }));
          }

          const orgId = (org as any).id;

          // Get members
          const membersResult = await env.LOCKSMITH_DB.prepare(`
            SELECT * FROM fleet_members WHERE organization_id = ? ORDER BY created_at ASC
          `).bind(orgId).all();

          const members = (membersResult.results || []).map((m: any) => ({
            id: m.id,
            organizationId: m.organization_id,
            userId: m.user_id,
            role: m.role,
            permissions: m.permissions ? JSON.parse(m.permissions) : null,
            displayName: m.display_name,
            phone: m.phone,
            email: m.email,
            status: m.status,
            invitedBy: m.invited_by,
            invitedAt: m.invited_at,
            joinedAt: m.joined_at,
            createdAt: m.created_at,
            updatedAt: m.updated_at
          }));

          // Get pending invites (only if owner)
          let invites: any[] = [];
          if ((org as any).owner_user_id === userId) {
            const invitesResult = await env.LOCKSMITH_DB.prepare(`
              SELECT * FROM fleet_invites WHERE organization_id = ? AND accepted_at IS NULL ORDER BY created_at DESC
            `).bind(orgId).all();

            invites = (invitesResult.results || []).map((i: any) => ({
              id: i.id,
              organizationId: i.organization_id,
              email: i.email,
              role: i.role,
              inviteCode: i.invite_code,
              organizationName: i.organization_name,
              invitedByName: i.invited_by_name,
              expiresAt: i.expires_at,
              acceptedAt: i.accepted_at,
              createdAt: i.created_at
            }));
          }

          return corsResponse(request, JSON.stringify({
            organization: {
              id: (org as any).id,
              ownerUserId: (org as any).owner_user_id,
              name: (org as any).name,
              plan: (org as any).plan || 'fleet_basic',
              stripeSubscriptionId: (org as any).stripe_subscription_id,
              stripeCustomerId: (org as any).stripe_customer_id,
              maxDispatchers: (org as any).max_dispatchers || 4,
              maxTechnicians: (org as any).max_technicians || 4,
              billingCycle: (org as any).billing_cycle || 'monthly',
              currentPeriodStart: (org as any).current_period_start,
              currentPeriodEnd: (org as any).current_period_end,
              monthlyCost: (org as any).monthly_cost || 15000,
              status: (org as any).status || 'active',
              createdAt: (org as any).created_at,
              updatedAt: (org as any).updated_at
            },
            members,
            invites
          }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // POST /api/fleet/organization - Create a new fleet organization
      if (path === "/api/fleet/organization" && request.method === "POST") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const userId = payload.sub as string;
          const userEmail = (payload as any).email as string;
          const userName = (payload as any).name as string;
          const body: any = await request.json();

          // Check if user already owns an org
          const existing = await env.LOCKSMITH_DB.prepare(`
            SELECT id FROM fleet_organizations WHERE owner_user_id = ?
          `).bind(userId).first();

          if (existing) {
            return corsResponse(request, JSON.stringify({ error: "User already owns an organization" }), 400);
          }

          const orgId = body.id || `org_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const memberId = `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const now = Date.now();

          // Create organization
          await env.LOCKSMITH_DB.prepare(`
            INSERT INTO fleet_organizations (id, owner_user_id, name, plan, max_dispatchers, max_technicians, billing_cycle, monthly_cost, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            orgId,
            userId,
            body.name || 'My Fleet',
            body.plan || 'fleet_basic',
            body.maxDispatchers || 4,
            body.maxTechnicians || 4,
            body.billingCycle || 'monthly',
            body.monthlyCost || 15000,
            'active',
            now,
            now
          ).run();

          // Create owner as first member
          await env.LOCKSMITH_DB.prepare(`
            INSERT INTO fleet_members (id, organization_id, user_id, role, display_name, email, status, joined_at, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            memberId,
            orgId,
            userId,
            'owner',
            userName || userEmail?.split('@')[0] || 'Owner',
            userEmail,
            'active',
            now,
            now,
            now
          ).run();

          return corsResponse(request, JSON.stringify({
            success: true,
            organization: {
              id: orgId,
              ownerUserId: userId,
              name: body.name || 'My Fleet',
              plan: body.plan || 'fleet_basic',
              maxDispatchers: body.maxDispatchers || 4,
              maxTechnicians: body.maxTechnicians || 4,
              status: 'active',
              createdAt: now
            }
          }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // POST /api/fleet/invite - Create an invitation
      if (path === "/api/fleet/invite" && request.method === "POST") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const userId = payload.sub as string;
          const userName = (payload as any).name as string;
          const body: any = await request.json();

          // Verify user owns the organization
          const org = await env.LOCKSMITH_DB.prepare(`
            SELECT * FROM fleet_organizations WHERE owner_user_id = ?
          `).bind(userId).first();

          if (!org) {
            return corsResponse(request, JSON.stringify({ error: "No organization found" }), 404);
          }

          // Check seat limits
          const orgId = (org as any).id;
          const role = body.role;

          const memberCounts = await env.LOCKSMITH_DB.prepare(`
            SELECT role, COUNT(*) as count FROM fleet_members 
            WHERE organization_id = ? AND status = 'active'
            GROUP BY role
          `).bind(orgId).all();

          const counts: Record<string, number> = {};
          (memberCounts.results || []).forEach((r: any) => {
            counts[r.role] = r.count;
          });

          if (role === 'dispatcher' && (counts['dispatcher'] || 0) >= ((org as any).max_dispatchers || 4)) {
            return corsResponse(request, JSON.stringify({ error: "Dispatcher seat limit reached" }), 400);
          }
          if (role === 'technician' && (counts['technician'] || 0) >= ((org as any).max_technicians || 4)) {
            return corsResponse(request, JSON.stringify({ error: "Technician seat limit reached" }), 400);
          }

          const inviteId = body.id || `invite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const inviteCode = body.inviteCode || generateRandomCode();
          const now = Date.now();
          const expiresAt = body.expiresAt || (now + 7 * 24 * 60 * 60 * 1000); // 7 days

          await env.LOCKSMITH_DB.prepare(`
            INSERT INTO fleet_invites (id, organization_id, email, role, invite_code, organization_name, invited_by_name, expires_at, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            inviteId,
            orgId,
            body.email,
            body.role,
            inviteCode,
            (org as any).name,
            userName || 'Owner',
            expiresAt,
            now
          ).run();

          return corsResponse(request, JSON.stringify({
            success: true,
            invite: {
              id: inviteId,
              organizationId: orgId,
              email: body.email,
              role: body.role,
              inviteCode,
              organizationName: (org as any).name,
              invitedByName: userName || 'Owner',
              expiresAt,
              createdAt: now
            }
          }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // GET /api/fleet/invite/:code - Get invite details by code (public)
      if (path.startsWith("/api/fleet/invite/") && request.method === "GET") {
        try {
          const inviteCode = path.split("/").pop();
          if (!inviteCode) {
            return corsResponse(request, JSON.stringify({ error: "Missing invite code" }), 400);
          }

          const invite = await env.LOCKSMITH_DB.prepare(`
            SELECT * FROM fleet_invites WHERE invite_code = ?
          `).bind(inviteCode).first();

          if (!invite) {
            return corsResponse(request, JSON.stringify({ error: "Invite not found" }), 404);
          }

          return corsResponse(request, JSON.stringify({
            invite: {
              id: (invite as any).id,
              organizationId: (invite as any).organization_id,
              email: (invite as any).email,
              role: (invite as any).role,
              inviteCode: (invite as any).invite_code,
              organizationName: (invite as any).organization_name,
              invitedByName: (invite as any).invited_by_name,
              expiresAt: (invite as any).expires_at,
              acceptedAt: (invite as any).accepted_at,
              createdAt: (invite as any).created_at
            }
          }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // POST /api/fleet/invite/accept - Accept an invitation
      if (path === "/api/fleet/invite/accept" && request.method === "POST") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const userId = payload.sub as string;
          const userEmail = (payload as any).email as string;
          const userName = (payload as any).name as string;
          const body: any = await request.json();
          const { inviteCode } = body;

          // Find the invite
          const invite = await env.LOCKSMITH_DB.prepare(`
            SELECT * FROM fleet_invites WHERE invite_code = ? AND accepted_at IS NULL
          `).bind(inviteCode).first();

          if (!invite) {
            return corsResponse(request, JSON.stringify({ error: "Invite not found or already used" }), 404);
          }

          // Check if expired
          if ((invite as any).expires_at < Date.now()) {
            return corsResponse(request, JSON.stringify({ error: "Invite has expired" }), 400);
          }

          // Check if user is already a member
          const existingMember = await env.LOCKSMITH_DB.prepare(`
            SELECT id FROM fleet_members WHERE organization_id = ? AND user_id = ?
          `).bind((invite as any).organization_id, userId).first();

          if (existingMember) {
            return corsResponse(request, JSON.stringify({ error: "Already a member of this organization" }), 400);
          }

          const memberId = `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const now = Date.now();

          // Create member
          await env.LOCKSMITH_DB.prepare(`
            INSERT INTO fleet_members (id, organization_id, user_id, role, display_name, email, status, invited_at, joined_at, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            memberId,
            (invite as any).organization_id,
            userId,
            (invite as any).role,
            userName || userEmail?.split('@')[0] || 'Team Member',
            userEmail,
            'active',
            (invite as any).created_at,
            now,
            now,
            now
          ).run();

          // Mark invite as accepted
          await env.LOCKSMITH_DB.prepare(`
            UPDATE fleet_invites SET accepted_at = ?, accepted_by_user_id = ? WHERE id = ?
          `).bind(now, userId, (invite as any).id).run();

          // Get the organization
          const org = await env.LOCKSMITH_DB.prepare(`
            SELECT * FROM fleet_organizations WHERE id = ?
          `).bind((invite as any).organization_id).first();

          return corsResponse(request, JSON.stringify({
            success: true,
            member: {
              id: memberId,
              organizationId: (invite as any).organization_id,
              userId,
              role: (invite as any).role,
              displayName: userName || userEmail?.split('@')[0] || 'Team Member',
              email: userEmail,
              status: 'active',
              joinedAt: now
            },
            organization: org ? {
              id: (org as any).id,
              name: (org as any).name,
              plan: (org as any).plan
            } : null
          }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // PUT /api/fleet/members/:id - Update a member's role
      if (path.startsWith("/api/fleet/members/") && request.method === "PUT") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const userId = payload.sub as string;
          const memberId = path.split("/").pop();
          const body: any = await request.json();

          // Get member and verify ownership
          const member = await env.LOCKSMITH_DB.prepare(`
            SELECT fm.*, fo.owner_user_id FROM fleet_members fm
            JOIN fleet_organizations fo ON fm.organization_id = fo.id
            WHERE fm.id = ?
          `).bind(memberId).first();

          if (!member) {
            return corsResponse(request, JSON.stringify({ error: "Member not found" }), 404);
          }

          if ((member as any).owner_user_id !== userId) {
            return corsResponse(request, JSON.stringify({ error: "Not authorized" }), 403);
          }

          if ((member as any).role === 'owner') {
            return corsResponse(request, JSON.stringify({ error: "Cannot modify owner" }), 400);
          }

          // Update member
          await env.LOCKSMITH_DB.prepare(`
            UPDATE fleet_members SET role = ?, updated_at = ? WHERE id = ?
          `).bind(body.role, Date.now(), memberId).run();

          return corsResponse(request, JSON.stringify({
            success: true,
            member: {
              id: memberId,
              role: body.role
            }
          }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // DELETE /api/fleet/members/:id - Remove a member
      if (path.startsWith("/api/fleet/members/") && request.method === "DELETE") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const userId = payload.sub as string;
          const memberId = path.split("/").pop();

          // Get member and verify ownership
          const member = await env.LOCKSMITH_DB.prepare(`
            SELECT fm.*, fo.owner_user_id FROM fleet_members fm
            JOIN fleet_organizations fo ON fm.organization_id = fo.id
            WHERE fm.id = ?
          `).bind(memberId).first();

          if (!member) {
            return corsResponse(request, JSON.stringify({ error: "Member not found" }), 404);
          }

          if ((member as any).owner_user_id !== userId) {
            return corsResponse(request, JSON.stringify({ error: "Not authorized" }), 403);
          }

          if ((member as any).role === 'owner') {
            return corsResponse(request, JSON.stringify({ error: "Cannot remove owner" }), 400);
          }

          // Delete member
          await env.LOCKSMITH_DB.prepare(`
            DELETE FROM fleet_members WHERE id = ?
          `).bind(memberId).run();

          return corsResponse(request, JSON.stringify({ success: true, id: memberId }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // ==============================================
      // RENEWAL DIGEST ENDPOINTS (Proactive Notifications)
      // ==============================================

      // GET /api/digest/renewal-summary - Generate weekly renewal digest content
      if (path === "/api/digest/renewal-summary" && request.method === "GET") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const userId = payload.sub as string;

          // Fetch user's licenses
          const result = await env.LOCKSMITH_DB.prepare(`
            SELECT data FROM user_licenses WHERE user_id = ?
          `).bind(userId).all();

          const licenses = (result.results || []).map((row: any) => JSON.parse(row.data || '{}'));
          const now = Date.now();
          const thirtyDays = 30 * 24 * 60 * 60 * 1000;

          // Calculate renewals due
          const upcomingRenewals = licenses.filter((l: any) => {
            if (!l.expirationDate) return false;
            const expiry = new Date(l.expirationDate).getTime();
            const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
            return daysLeft > 0 && daysLeft <= 30;
          }).map((l: any) => ({
            name: l.name,
            daysLeft: Math.ceil((new Date(l.expirationDate).getTime() - now) / (1000 * 60 * 60 * 24)),
            price: l.price || 0,
            renewalUrl: l.renewalUrl
          })).sort((a: any, b: any) => a.daysLeft - b.daysLeft);

          // Calculate low token items
          const lowTokenItems = licenses.filter((l: any) =>
            l.tokensRemaining !== undefined && l.tokensRemaining < 10
          ).map((l: any) => ({
            name: l.name,
            tokensRemaining: l.tokensRemaining
          }));

          // Calculate costs
          const totalAnnualCost = licenses.reduce((sum: number, l: any) => sum + (l.price || 0), 0);
          const upcomingRenewalCost = upcomingRenewals.reduce((sum: number, r: any) => sum + (r.price || 0), 0);

          // Generate summary message
          let summary = '';
          if (upcomingRenewals.length > 0) {
            summary += `📅 ${upcomingRenewals.length} renewal(s) due in the next 30 days ($${upcomingRenewalCost} total):\n`;
            upcomingRenewals.slice(0, 5).forEach((r: any) => {
              summary += `  • ${r.name} - ${r.daysLeft} days ($${r.price || 0})\n`;
            });
          }
          if (lowTokenItems.length > 0) {
            summary += `\n🎟️ ${lowTokenItems.length} item(s) low on tokens:\n`;
            lowTokenItems.slice(0, 3).forEach((t: any) => {
              summary += `  • ${t.name} - ${t.tokensRemaining} remaining\n`;
            });
          }
          summary += `\n💰 Total annual operating cost: $${totalAnnualCost.toLocaleString()} (~$${Math.round(totalAnnualCost / 12)}/mo)`;

          return corsResponse(request, JSON.stringify({
            success: true,
            digest: {
              generatedAt: now,
              upcomingRenewals,
              lowTokenItems,
              totalAnnualCost,
              upcomingRenewalCost,
              monthlyBurnRate: Math.round(totalAnnualCost / 12),
              summary
            }
          }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }


      // GET /api/user/preferences - Fetch user preferences
      if (path === "/api/user/preferences" && request.method === "GET") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const userId = payload.sub as string;

          const result = await env.LOCKSMITH_DB.prepare(`
            SELECT * FROM user_preferences WHERE user_id = ?
          `).bind(userId).first();

          if (!result) {
            return corsResponse(request, JSON.stringify({ preferences: null }));
          }

          return corsResponse(request, JSON.stringify({
            preferences: {
              state: result.state,
              sales_tax_rate: result.sales_tax_rate,
              business_name: result.business_name,
              default_labor_rate: result.default_labor_rate,
              preferences: result.preferences ? JSON.parse(result.preferences as string) : {},
              updated_at: result.updated_at
            }
          }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // POST /api/user/preferences - Set user preferences
      if (path === "/api/user/preferences" && request.method === "POST") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const userId = payload.sub as string;
          const body: any = await request.json();
          const { state, sales_tax_rate, business_name, default_labor_rate, preferences } = body;

          await env.LOCKSMITH_DB.prepare(`
            INSERT INTO user_preferences (user_id, state, sales_tax_rate, business_name, default_labor_rate, preferences, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET
              state = COALESCE(excluded.state, user_preferences.state),
              sales_tax_rate = COALESCE(excluded.sales_tax_rate, user_preferences.sales_tax_rate),
              business_name = COALESCE(excluded.business_name, user_preferences.business_name),
              default_labor_rate = COALESCE(excluded.default_labor_rate, user_preferences.default_labor_rate),
              preferences = COALESCE(excluded.preferences, user_preferences.preferences),
              updated_at = excluded.updated_at
          `).bind(
            userId,
            state || null,
            sales_tax_rate || null,
            business_name || null,
            default_labor_rate || null,
            preferences ? JSON.stringify(preferences) : null,
            Date.now()
          ).run();

          return corsResponse(request, JSON.stringify({ success: true }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // ==============================================
      // AI INSIGHTS ENDPOINTS
      // ==============================================

      // POST /api/ai/generate-title - Generate a descriptive title for a pearl
      if (path === "/api/ai/generate-title" && request.method === "POST") {
        try {
          const body: any = await request.json();
          const { content, category, make, model } = body;

          if (!content) {
            return corsResponse(request, JSON.stringify({ error: "Content required" }), 400);
          }

          const prompt = `Generate a short, descriptive title (max 60 chars) for this automotive locksmith technical insight.

Content: ${(content || "").slice(0, 500)}
Category: ${category || "reference"}
Vehicle: ${make || "General"} ${model || ""}

Requirements:
- Title should summarize the KEY ACTIONABLE insight
- Be specific (e.g., "Autel IM608 PIN Read for 2019+ RAM" not "RAM Key Programming")
- Include tool names, procedures, or warnings if relevant
- Max 60 characters

Respond with ONLY the title, nothing else.`;

          const aiResponse = await env.AI.run("@cf/meta/llama-3-8b-instruct", {
            prompt,
            max_tokens: 100
          });

          let title = (aiResponse as any).response?.trim() || "";
          // Clean up - remove quotes but DO NOT truncate
          title = title.replace(/^["']|["']$/g, "").trim();
          // Remove trailing ellipsis if AI added one
          if (title.endsWith("...")) {
            title = title.slice(0, -3).trim();
          }

          // Fallback if empty
          if (!title || title.length < 5) {
            title = `${make || "General"} - ${model || "All"} - ${(category || "reference").slice(0, 20)}`;
          }

          return corsResponse(request, JSON.stringify({ title }));
        } catch (err: any) {
          console.error("AI title generation error:", err);
          return corsResponse(request, JSON.stringify({
            error: err.message,
            title: "General - Reference"
          }), 200); // Return fallback title even on error
        }
      }

      // GET /api/ai/insights - Fetch cached AI insights by category
      if (path === "/api/ai/insights" && request.method === "GET") {
        try {
          const category = url.searchParams.get("category") || "overview";
          const refresh = url.searchParams.get("refresh") === "true";
          const vehicleId = url.searchParams.get("vehicleId");
          const userId = "global"; // TODO: Get from session when auth is required

          // Check cache first (unless refresh requested)
          if (!refresh) {
            const cached = await env.LOCKSMITH_DB.prepare(
              "SELECT insight FROM ai_insights_cache WHERE category = ? AND user_id = ? AND expires_at > ?"
            ).bind(category, userId, Date.now()).first<{ insight: string }>();

            if (cached) {
              return corsResponse(request, JSON.stringify({ insight: cached.insight, cached: true }));
            }
          }

          // Generate new insight based on category
          let contextData = "";
          let prompt = "";

          if (category === "inventory") {
            const lowStock = await env.LOCKSMITH_DB.prepare(
              "SELECT item_key, type, qty FROM inventory WHERE qty <= 2 LIMIT 10"
            ).all();
            const items = (lowStock.results || []) as any[];
            contextData = JSON.stringify(items);
            prompt = `Analyze this inventory data and provide a brief, actionable insight (2-3 sentences max):
            Low stock items: ${contextData}
            Focus on: restocking priorities, which items are critical, and any patterns.`;
          } else if (category === "jobs") {
            const recentJobs = await env.LOCKSMITH_DB.prepare(
              "SELECT data FROM job_logs ORDER BY created_at DESC LIMIT 20"
            ).all();
            const jobs = (recentJobs.results || []) as any[];
            const revenues = jobs.map(j => {
              try { return JSON.parse(j.data)?.revenue || 0; } catch { return 0; }
            });
            const totalRev = revenues.reduce((a, b) => a + b, 0);
            contextData = JSON.stringify({ jobCount: jobs.length, totalRevenue: totalRev });
            prompt = `Analyze this job data and provide a brief insight (2-3 sentences max):
            Recent jobs: ${jobs.length}, Total revenue: $${totalRev}
            Focus on: performance trends, revenue optimization opportunities.`;
          } else if (category === "tools") {
            const tools = await env.LOCKSMITH_DB.prepare(
              "SELECT name, license_type, expiry_date FROM tools WHERE expiry_date IS NOT NULL ORDER BY expiry_date ASC LIMIT 5"
            ).all();
            contextData = JSON.stringify(tools.results || []);
            prompt = `Analyze this tool subscription data and provide a brief insight (2-3 sentences max):
            Tools with expiry dates: ${contextData}
            Focus on: upcoming renewals, cost optimization, ROI considerations.`;
          } else if (category === "subscriptions") {
            const subs = await env.LOCKSMITH_DB.prepare(
              "SELECT name, type, expiration_date, price FROM licenses ORDER BY expiration_date ASC LIMIT 10"
            ).all();
            contextData = JSON.stringify(subs.results || []);
            prompt = `Analyze this subscription/license data and provide a brief insight (2-3 sentences max):
            Subscriptions: ${contextData}
            Focus on: renewal priorities, cost management, compliance reminders.`;
          } else {
            // Overview - combine multiple data sources
            const lowStock = await env.LOCKSMITH_DB.prepare(
              "SELECT COUNT(*) as count FROM inventory WHERE qty <= 2"
            ).first<{ count: number }>();
            const jobCount = await env.LOCKSMITH_DB.prepare(
              "SELECT COUNT(*) as count FROM job_logs"
            ).first<{ count: number }>();
            contextData = JSON.stringify({ lowStockCount: lowStock?.count || 0, totalJobs: jobCount?.count || 0 });
            prompt = `Provide a brief business overview insight (2-3 sentences max):
            Low stock items: ${lowStock?.count || 0}, Total jobs logged: ${jobCount?.count || 0}
            Focus on: overall business health, key actions to take today.`;
          }

          // Call AI to generate insight
          const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${env.OPENROUTER_API_KEY}`,
              "HTTP-Referer": "https://eurokeys.app",
              "X-Title": "EuroKeys AI Insights",
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              "model": "deepseek/deepseek-v3.2",
              "messages": [
                { "role": "system", "content": "You are a business analyst for an automotive locksmith company. Provide concise, actionable insights. No fluff." },
                { "role": "user", "content": prompt }
              ],
              "max_tokens": 150
            })
          });

          if (!aiResponse.ok) {
            throw new Error(`AI service error: ${aiResponse.status}`);
          }

          const aiData: any = await aiResponse.json();
          const insight = aiData.choices?.[0]?.message?.content || "No insight available.";

          // Cache the insight (expires in 6 hours)
          const id = crypto.randomUUID();
          const expiresAt = Date.now() + (6 * 60 * 60 * 1000);

          await env.LOCKSMITH_DB.prepare(
            "INSERT OR REPLACE INTO ai_insights_cache (id, user_id, category, insight, context_data, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
          ).bind(id, userId, category, insight, contextData, Date.now(), expiresAt).run();

          return corsResponse(request, JSON.stringify({ insight, cached: false }));
        } catch (err: any) {
          console.error("AI Insights error:", err);
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // POST /api/ai/business-insights - Generate AI insights about business stats
      if (path === "/api/ai/business-insights" && request.method === "POST") {
        try {
          // Local development bypass - allow unauthenticated access on localhost
          const origin = request.headers.get("Origin") || "";
          const isLocalDev = origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:");

          let userId = "dev-local-user";

          if (!isLocalDev) {
            // Production: require authentication
            const sessionToken = getSessionToken(request);
            if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

            const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
            if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

            userId = payload.sub as string;

            // Check if user has AI Insights subscription (is_pro or is_developer)
            const userCheck = await env.LOCKSMITH_DB.prepare(
              "SELECT is_pro, is_developer FROM users WHERE id = ?"
            ).bind(userId).first<any>();

            const hasAccess = userCheck?.is_pro || userCheck?.is_developer;
            if (!hasAccess) {
              return corsResponse(request, JSON.stringify({
                error: "AI Insights subscription required",
                upgrade_url: "/pricing"
              }), 403);
            }
          }

          const body: any = await request.json();
          const { insightType } = body; // 'tax', 'revenue', 'general', 'team', 'customers', 'pipeline', 'coverage'

          // Fetch user preferences
          const prefs = await env.LOCKSMITH_DB.prepare(`
            SELECT * FROM user_preferences WHERE user_id = ?
          `).bind(userId).first<any>();

          // Fetch recent job logs (last 30 days)
          const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
          const jobs = await env.LOCKSMITH_DB.prepare(`
            SELECT data FROM job_logs WHERE user_id = ? AND created_at > ? ORDER BY created_at DESC LIMIT 100
          `).bind(userId, thirtyDaysAgo).all();

          const jobData = (jobs.results || []).map((r: any) => {
            try { return JSON.parse(r.data); } catch { return null; }
          }).filter(Boolean);

          // ========== EXPANDED DATA FETCHING ==========

          // Fetch technicians
          const techResult = await env.LOCKSMITH_DB.prepare(`
            SELECT id, data FROM technicians WHERE user_id = ?
          `).bind(userId).all();
          const technicians = (techResult.results || []).map((r: any) => {
            try { return { id: r.id, ...JSON.parse(r.data || '{}') }; } catch { return null; }
          }).filter(Boolean);

          // Fetch fleet customers
          const fleetResult = await env.LOCKSMITH_DB.prepare(`
            SELECT id, data FROM fleet_customers WHERE user_id = ?
          `).bind(userId).all();
          const fleetCustomers = (fleetResult.results || []).map((r: any) => {
            try { return { id: r.id, ...JSON.parse(r.data || '{}') }; } catch { return null; }
          }).filter(Boolean);

          // Fetch pipeline leads
          const leadsResult = await env.LOCKSMITH_DB.prepare(`
            SELECT id, data FROM pipeline_leads WHERE user_id = ?
          `).bind(userId).all();
          const pipelineLeads = (leadsResult.results || []).map((r: any) => {
            try { return { id: r.id, ...JSON.parse(r.data || '{}') }; } catch { return null; }
          }).filter(Boolean);

          // Calculate job stats
          const totalRevenue = jobData.reduce((sum: number, j: any) => sum + (j.price || 0), 0);
          const totalKeyCost = jobData.reduce((sum: number, j: any) => sum + (j.keyCost || 0), 0);
          const totalGasCost = jobData.reduce((sum: number, j: any) => sum + (j.gasCost || 0), 0);
          const totalPartsCost = jobData.reduce((sum: number, j: any) => sum + (j.partsCost || 0), 0);
          const netProfit = totalRevenue - totalKeyCost - totalGasCost - totalPartsCost;
          const avgJobValue = jobData.length > 0 ? totalRevenue / jobData.length : 0;

          // Calculate technician stats
          const techStats = technicians.map((tech: any) => {
            const techJobs = jobData.filter((j: any) => j.technicianId === tech.id);
            const techRevenue = techJobs.reduce((sum: number, j: any) => sum + (j.price || 0), 0);
            const commissionRate = tech.commissionRate || 0.10; // Default 10%
            return {
              name: tech.name || 'Unknown',
              jobCount: techJobs.length,
              revenue: techRevenue,
              commission: techRevenue * commissionRate,
              commissionRate: commissionRate * 100
            };
          });

          // Calculate fleet customer stats
          const fleetRevenue = jobData
            .filter((j: any) => j.fleetCustomerId || j.isFleet)
            .reduce((sum: number, j: any) => sum + (j.price || 0), 0);
          const fleetJobCount = jobData.filter((j: any) => j.fleetCustomerId || j.isFleet).length;

          // Calculate pipeline stats
          const leadsByStage: Record<string, number> = {};
          pipelineLeads.forEach((lead: any) => {
            const stage = lead.stage || 'new';
            leadsByStage[stage] = (leadsByStage[stage] || 0) + 1;
          });
          const totalLeadValue = pipelineLeads.reduce((sum: number, l: any) => sum + (l.estimatedValue || 0), 0);

          // Collect vehicle makes from jobs for coverage analysis
          const vehicleMakes = [...new Set(jobData.map((j: any) => j.make || j.vehicle?.make).filter(Boolean))];

          // Pre-computed knowledge base statistics (from dossier_capability_index.json and image_gallery_details.json)
          const knowledgeStats = {
            dossiers: 312,
            procedures: 1714,
            pearls: 18921,
            classifiedImages: 1535,
            topMakes: ['RAM', 'Audi', 'Ford', 'Volkswagen', 'Toyota', 'FCA', 'Chrysler', 'Mercedes-Benz', 'Nissan', 'BMW'],
            topTools: { autel: 296, xhorse: 216, smartpro: 179, lishi: 127, lonsdor: 108 },
            imageMakes: ['Toyota', 'Ford', 'BMW', 'Chevrolet', 'Audi', 'Honda', 'Mazda', 'Nissan', 'Acura']
          };

          // Build context for AI
          const userState = prefs?.state || 'unknown';
          const taxRate = prefs?.sales_tax_rate || 0;
          const businessName = prefs?.business_name || 'your business';

          let prompt = `You are a professional locksmith business consultant providing actionable insights.

BUSINESS CONTEXT:
- Business: ${businessName}
- Location: ${userState}
- Sales Tax Rate: ${taxRate}%
- Period: Last 30 days

FINANCIAL STATS:
- Total Jobs: ${jobData.length}
- Revenue: $${totalRevenue.toFixed(2)}
- Key/Fob Costs: $${totalKeyCost.toFixed(2)}
- Gas/Travel: $${totalGasCost.toFixed(2)}
- Parts/Supplies: $${totalPartsCost.toFixed(2)}
- Net Profit: $${netProfit.toFixed(2)}
- Average Job Value: $${avgJobValue.toFixed(2)}
- Profit Margin: ${totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0}%

TEAM DATA:
- Technicians: ${technicians.length}
${techStats.map((t: any) => `  • ${t.name}: ${t.jobCount} jobs, $${t.revenue.toFixed(2)} revenue, $${t.commission.toFixed(2)} commission (${t.commissionRate}%)`).join('\n')}

CUSTOMER DATA:
- Fleet Customers: ${fleetCustomers.length}
- Fleet Jobs (30d): ${fleetJobCount}
- Fleet Revenue (30d): $${fleetRevenue.toFixed(2)}
- B2B Revenue %: ${totalRevenue > 0 ? ((fleetRevenue / totalRevenue) * 100).toFixed(1) : 0}%

PIPELINE DATA:
- Total Leads: ${pipelineLeads.length}
- Lead Stages: ${Object.entries(leadsByStage).map(([k, v]) => `${k}: ${v}`).join(', ') || 'none'}
- Total Pipeline Value: $${totalLeadValue.toFixed(2)}

VEHICLE COVERAGE & SERVICE READINESS:
- Makes Serviced: ${vehicleMakes.join(', ') || 'none recorded'}
- (Note: For detailed service readiness - what vehicles the user can fully service based on tools, subscriptions, and inventory - see the Coverage Heatmap at /business/coverage-heatmap. The data shows vehicle groups the user is READY to service, ones where they NEED PARTS, NEED SUBSCRIPTION renewals, or CANNOT SERVICE due to missing tools. Use this context to provide actionable recommendations about expanding coverage or renewing subscriptions.)

`;

          if (insightType === 'tax') {
            prompt += `Provide specific tax insights for a locksmith in ${userState}:
1. Estimated quarterly tax liability at the ${taxRate}% rate
2. Common deductible expenses for mobile locksmiths
3. Business expense tracking recommendations
4. Any state-specific tax considerations for ${userState}

Keep response under 300 words, practical and actionable.`;
          } else if (insightType === 'revenue') {
            prompt += `Analyze the revenue and suggest optimizations:
1. Profit margin analysis (current: ${((netProfit / totalRevenue) * 100 || 0).toFixed(1)}%)
2. Job type mix recommendations
3. Pricing strategy suggestions
4. Cost reduction opportunities

Keep response under 300 words, practical and actionable.`;
          } else if (insightType === 'team') {
            prompt += `Analyze the team performance data:
1. Technician workload balance - is work distributed evenly?
2. Top performer recognition and what makes them successful
3. Commission structure analysis - is it incentivizing the right behavior?
4. Recommendations for improving team productivity

Keep response under 300 words, practical and actionable.`;
          } else if (insightType === 'customers') {
            prompt += `Analyze the customer mix:
1. B2B vs D2C balance (${((fleetRevenue / totalRevenue) * 100 || 0).toFixed(1)}% fleet)
2. Fleet customer relationship health
3. Customer retention and repeat business opportunities
4. Recommendations for growing the most profitable segments

Keep response under 300 words, practical and actionable.`;
          } else if (insightType === 'pipeline') {
            prompt += `Analyze the sales pipeline:
1. Lead volume and stage distribution
2. Conversion rate analysis (leads to jobs)
3. Pipeline value vs actual revenue benchmark
4. Recommendations for improving lead conversion

Keep response under 300 words, practical and actionable.`;
          } else if (insightType === 'coverage') {
            prompt += `Analyze technical coverage based on vehicles serviced and service readiness:

YOUR JOB HISTORY:
- Makes you've serviced: ${vehicleMakes.slice(0, 5).join(', ') || 'not enough data'}

KNOWLEDGE BASE STATS:
- ${knowledgeStats.dossiers} technical dossiers available
- ${knowledgeStats.procedures} documented procedures
- ${knowledgeStats.pearls} expert tips/pearls
- ${knowledgeStats.classifiedImages} reference images
- Best documented makes: ${knowledgeStats.topMakes.slice(0, 5).join(', ')}
- Tool documentation: Autel (${knowledgeStats.topTools.autel}), Xhorse (${knowledgeStats.topTools.xhorse}), SmartPro (${knowledgeStats.topTools.smartpro})

SERVICE READINESS (conceptual framework):
- READY: Have tools + key stock + active subscriptions
- NEED PARTS: Tools ready but key blank/fob stock depleted  
- NEED SUBSCRIPTION: Tool capable but annual subscription expired
- CAN'T SERVICE: Missing required programming tool

Analyze:
1. How well does your job history align with our best-documented vehicles?
2. Coverage gaps - what popular vehicles should you expand into?
3. Tool subscriptions - are all annual updates current? (Autel, Lonsdor, etc.)
4. Inventory gaps - which key blanks/fobs need restocking based on your service history?

Keep response under 300 words, practical and actionable.`;
          } else {
            prompt += `Provide a comprehensive business health check:
1. Overall financial health assessment
2. Key metrics that stand out
3. Top 3 actionable recommendations
4. Any concerns or areas needing attention

Keep response under 300 words, practical and actionable.`;
          }

          // Call AI provider (Gemini or OpenRouter/DeepSeek)
          let insight: string;
          const aiProvider = env.CHAT_AI_PROVIDER || 'openrouter';

          if (aiProvider === 'gemini' && env.GEMINI_API_KEY) {
            // Use Gemini API
            const geminiResponse = await fetch(
              "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
              {
                method: "POST",
                headers: {
                  "x-goog-api-key": env.GEMINI_API_KEY,
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  system_instruction: {
                    parts: [{ text: "You are a professional business consultant specializing in mobile automotive locksmith businesses. Provide concise, actionable advice." }]
                  },
                  contents: [
                    { parts: [{ text: prompt }] }
                  ],
                  generationConfig: {
                    maxOutputTokens: 800,
                    temperature: 0.7
                  }
                })
              }
            );

            if (!geminiResponse.ok) {
              throw new Error(`AI API error: ${geminiResponse.status}`);
            }

            const geminiData: any = await geminiResponse.json();
            insight = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "Unable to generate insight.";
          } else {
            // Use OpenRouter / DeepSeek (default)
            const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${env.OPENROUTER_API_KEY}`,
                "HTTP-Referer": "https://eurokeys.app",
                "X-Title": "EuroKeys AI Insights",
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                "model": "deepseek/deepseek-v3.2",
                "messages": [
                  { "role": "system", "content": "You are a professional business consultant specializing in mobile automotive locksmith businesses. Provide concise, actionable advice." },
                  { "role": "user", "content": prompt }
                ],
                "max_tokens": 800
              })
            });

            if (!aiResponse.ok) {
              throw new Error(`AI API error: ${aiResponse.status}`);
            }

            const aiData: any = await aiResponse.json();
            insight = aiData.choices?.[0]?.message?.content || "Unable to generate insight.";
          }

          // Save to history
          await env.LOCKSMITH_DB.prepare(`
            INSERT INTO ai_insights_history (user_id, insight_type, content, context_data)
            VALUES (?, ?, ?, ?)
          `).bind(
            userId,
            insightType || 'general',
            insight,
            JSON.stringify({ jobCount: jobData.length, revenue: totalRevenue, profit: netProfit, state: userState })
          ).run();

          return corsResponse(request, JSON.stringify({
            insight,
            stats: {
              jobCount: jobData.length,
              revenue: totalRevenue,
              expenses: totalKeyCost + totalGasCost + totalPartsCost,
              profit: netProfit,
              avgJobValue,
              state: userState,
              taxRate,
              // Extended stats
              technicianCount: technicians.length,
              topTechnician: techStats.sort((a: any, b: any) => b.revenue - a.revenue)[0]?.name || null,
              fleetCustomerCount: fleetCustomers.length,
              fleetRevenue,
              fleetRevenuePercent: totalRevenue > 0 ? ((fleetRevenue / totalRevenue) * 100) : 0,
              leadCount: pipelineLeads.length,
              pipelineValue: totalLeadValue,
              leadsByStage,
              vehicleMakes: vehicleMakes.slice(0, 10),
              // Knowledge base stats
              knowledgeBase: {
                dossiers: knowledgeStats.dossiers,
                procedures: knowledgeStats.procedures,
                pearls: knowledgeStats.pearls,
                images: knowledgeStats.classifiedImages,
                topMakes: knowledgeStats.topMakes.slice(0, 5)
              }
            }
          }));

        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // GET /api/ai/insights-history - Get past AI insights
      if (path === "/api/ai/insights-history" && request.method === "GET") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const userId = payload.sub as string;

          const result = await env.LOCKSMITH_DB.prepare(`
            SELECT id, insight_type, content, context_data, created_at 
            FROM ai_insights_history 
            WHERE user_id = ? 
            ORDER BY created_at DESC 
            LIMIT 10
          `).bind(userId).all();

          const insights = (result.results || []).map((row: any) => ({
            id: row.id,
            type: row.insight_type,
            content: row.content,
            context: row.context_data ? JSON.parse(row.context_data) : {},
            createdAt: row.created_at
          }));

          return corsResponse(request, JSON.stringify({ insights }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // ==============================================
      // CHATBOT ENDPOINT (Knowledge-based Vehicle Q&A)
      // ==============================================

      // POST /api/chat - Knowledge-based vehicle chatbot
      if (path === "/api/chat" && request.method === "POST") {
        try {
          const body: any = await request.json();
          const { message, vehicleContext } = body;

          if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return corsResponse(request, JSON.stringify({ error: "Message is required" }), 400);
          }

          const userMessage = message.trim();

          // 1. Extract vehicle info from message or use provided context
          let make = vehicleContext?.make?.toLowerCase() || null;
          let model = vehicleContext?.model?.toLowerCase() || null;
          let year: number | null = vehicleContext?.year ? parseInt(vehicleContext.year, 10) : null;

          // Try to parse vehicle from message if not provided (e.g., "2014 BMW 5 series")
          if (!make || !model) {
            const vehicleMatch = userMessage.match(/(\d{4})\s+(\w+)\s+(.+?)(?:\s+series|\s+sport|\?|$)/i);
            if (vehicleMatch) {
              year = year || parseInt(vehicleMatch[1], 10);
              make = make || vehicleMatch[2].toLowerCase();
              model = model || vehicleMatch[3].toLowerCase().replace(/\s+series$/i, '').trim();
            }
          }

          // 2. Query locksmith_data for vehicle information
          let vehicleData: any[] = [];
          if (make) {
            let query = `SELECT DISTINCT make, model, year, immobilizer_system, key_type, chip, 
                         transponder_family, prog_method, prog_tools, akl_supported, fcc_id
                         FROM locksmith_data WHERE LOWER(make) = ?`;
            const params: any[] = [make];

            if (model) {
              query += ` AND LOWER(model) LIKE ?`;
              params.push(`%${model}%`);
            }
            if (year) {
              query += ` AND year = ?`;
              params.push(year);
            }
            query += ` LIMIT 10`;

            const result = await env.LOCKSMITH_DB.prepare(query).bind(...params).all();
            vehicleData = result.results || [];
          }

          // 3. Query pearls for relevant tips (by make/model or general)
          let relevantPearls: any[] = [];
          if (make) {
            const pearlQuery = `SELECT snippet, section, tags FROM locksmith_pearls 
                               WHERE (LOWER(make) = ? OR make IS NULL)
                               ${model ? `AND (LOWER(model) LIKE ? OR model IS NULL OR model = 'General')` : ''}
                               ORDER BY quality_score DESC LIMIT 5`;
            const pearlParams = model ? [make, `%${model}%`] : [make];

            try {
              const pearlResult = await env.LOCKSMITH_DB.prepare(pearlQuery).bind(...pearlParams).all();
              relevantPearls = pearlResult.results || [];
            } catch {
              // Pearls table might not exist in all environments, continue without
            }
          }

          // 4. Build context prompt with retrieved knowledge
          let contextBlock = "";

          if (vehicleData.length > 0) {
            const v = vehicleData[0];
            contextBlock += `\n## Vehicle Information Found:\n`;
            contextBlock += `- Make: ${v.make}\n`;
            contextBlock += `- Model: ${v.model}\n`;
            if (v.year) contextBlock += `- Year: ${v.year}\n`;
            if (v.immobilizer_system) contextBlock += `- Immobilizer System: ${v.immobilizer_system}\n`;
            if (v.key_type) contextBlock += `- Key Type: ${v.key_type}\n`;
            if (v.chip) contextBlock += `- Chip: ${v.chip}\n`;
            if (v.transponder_family) contextBlock += `- Transponder Family: ${v.transponder_family}\n`;
            if (v.prog_method) contextBlock += `- Programming Method: ${v.prog_method}\n`;
            if (v.prog_tools) contextBlock += `- Programming Tools: ${v.prog_tools}\n`;
            if (v.akl_supported) contextBlock += `- AKL Supported: ${v.akl_supported}\n`;
            if (v.fcc_id) contextBlock += `- FCC ID: ${v.fcc_id}\n`;

            // Add additional years if different models found
            if (vehicleData.length > 1) {
              const years = [...new Set(vehicleData.map(d => d.year).filter(Boolean))].sort();
              if (years.length > 1) {
                contextBlock += `- Available Years in Database: ${years.join(', ')}\n`;
              }
            }
          }

          if (relevantPearls.length > 0) {
            contextBlock += `\n## Expert Tips (Pearls):\n`;
            for (const pearl of relevantPearls) {
              contextBlock += `- ${pearl.snippet}\n`;
            }
          }

          // 4b. Query top community comments for this vehicle
          let communityTips: any[] = [];
          if (make && model) {
            try {
              const vehicleKey = year
                ? `${make[0].toUpperCase() + make.slice(1)}|${model[0].toUpperCase() + model.slice(1)}|${year}`
                : `${make[0].toUpperCase() + make.slice(1)}|${model[0].toUpperCase() + model.slice(1)}`;

              const communityQuery = `
                SELECT content, user_name, upvotes, COALESCE(downvotes, 0) as downvotes,
                       (upvotes - COALESCE(downvotes, 0)) as score
                FROM vehicle_comments 
                WHERE vehicle_key LIKE ? AND COALESCE(is_deleted, 0) = 0
                ORDER BY score DESC, upvotes DESC
                LIMIT 3
              `;
              const communityResult = await env.LOCKSMITH_DB.prepare(communityQuery)
                .bind(`${vehicleKey}%`).all();
              communityTips = (communityResult.results || []).filter((c: any) => c.score >= 1);
            } catch {
              // Community table might not exist, continue without
            }
          }

          if (communityTips.length > 0) {
            contextBlock += `\n## Community Tips (from technicians):\n`;
            for (const tip of communityTips) {
              contextBlock += `- "${tip.content}" — ${tip.user_name} (${tip.score > 0 ? '+' : ''}${tip.score} votes)\n`;
            }
          }

          // 5. Call AI provider (Gemini or OpenRouter/DeepSeek)
          const systemPrompt = `You are EuroKeys AI, an expert automotive locksmith assistant. You help locksmiths with vehicle key programming, immobilizer systems, and related technical questions.

Your knowledge includes:
- Immobilizer systems and their programming requirements
- Key types, chips, and transponders for various vehicles
- Programming tools (Autel IM608, Smart Pro, Lonsdor K518, etc.)
- All Keys Lost (AKL) procedures
- FCC IDs and key fob specifications

Guidelines:
- Be concise and practical - locksmiths are working in the field
- If you have specific data from the knowledge base, cite it clearly
- If you're uncertain, say so rather than guessing
- Focus on actionable information`;

          const userPrompt = contextBlock
            ? `Based on the following knowledge base data:\n${contextBlock}\n\nUser Question: ${userMessage}`
            : userMessage;

          let responseContent: string;
          const aiProvider = env.CHAT_AI_PROVIDER || 'openrouter';

          if (aiProvider === 'gemini' && env.GEMINI_API_KEY) {
            // Use Gemini API (gemini-2.0-flash for speed)
            const geminiResponse = await fetch(
              "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
              {
                method: "POST",
                headers: {
                  "x-goog-api-key": env.GEMINI_API_KEY,
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  system_instruction: {
                    parts: [{ text: systemPrompt }]
                  },
                  contents: [
                    { parts: [{ text: userPrompt }] }
                  ],
                  generationConfig: {
                    maxOutputTokens: 800,
                    temperature: 0.7
                  }
                })
              }
            );

            if (!geminiResponse.ok) {
              const errorText = await geminiResponse.text();
              console.error("Gemini API error:", geminiResponse.status, errorText);
              throw new Error(`AI service error: ${geminiResponse.status}`);
            }

            const geminiData: any = await geminiResponse.json();
            responseContent = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't generate a response.";
          } else {
            // Use OpenRouter / DeepSeek (default)
            const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${env.OPENROUTER_API_KEY}`,
                "HTTP-Referer": "https://eurokeys.app",
                "X-Title": "EuroKeys Chat",
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                "model": "deepseek/deepseek-v3.2",
                "messages": [
                  { "role": "system", "content": systemPrompt },
                  { "role": "user", "content": userPrompt }
                ],
                "max_tokens": 800,
                "temperature": 0.7
              })
            });

            if (!aiResponse.ok) {
              const errorText = await aiResponse.text();
              console.error("OpenRouter error:", aiResponse.status, errorText);
              throw new Error(`AI service error: ${aiResponse.status}`);
            }

            const aiData: any = await aiResponse.json();
            responseContent = aiData.choices?.[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
          }

          // 6. Return response with sources
          return corsResponse(request, JSON.stringify({
            response: responseContent,
            vehicleContext: vehicleData.length > 0 ? {
              make: vehicleData[0].make,
              model: vehicleData[0].model,
              year: vehicleData[0].year,
              system: vehicleData[0].immobilizer_system
            } : null,
            sourcesUsed: {
              vehicleRecords: vehicleData.length,
              pearls: relevantPearls.length
            }
          }));

        } catch (err: any) {
          console.error("Chat endpoint error:", err);
          return corsResponse(request, JSON.stringify({ error: err.message || "Chat service error" }), 500);
        }
      }

      // ==============================================
      // BUSINESS ASSETS ENDPOINTS (Cloud Sync)
      // ==============================================

      // GET /api/user/assets - Fetch user's business assets
      if (path === "/api/user/assets" && request.method === "GET") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const userId = payload.sub as string;

          const result = await env.LOCKSMITH_DB.prepare(`
          SELECT id, data, created_at FROM user_assets WHERE user_id = ? ORDER BY created_at DESC
        `).bind(userId).all();

          const assets = (result.results || []).map((row: any) => ({
            id: row.id,
            ...JSON.parse(row.data || '{}'),
            createdAt: row.created_at
          }));

          return corsResponse(request, JSON.stringify({ assets }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // POST /api/user/assets - Add/Update a business asset
      if (path === "/api/user/assets" && request.method === "POST") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const userId = payload.sub as string;
          const body: any = await request.json();
          const { asset } = body;

          if (!asset || !asset.id) return corsResponse(request, JSON.stringify({ error: "Missing asset data or ID" }), 400);

          await env.LOCKSMITH_DB.prepare(`
          INSERT INTO user_assets (id, user_id, data, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            data = excluded.data,
            updated_at = excluded.updated_at
        `).bind(
            asset.id,
            userId,
            JSON.stringify(asset),
            asset.createdAt || Date.now(),
            Date.now()
          ).run();

          return corsResponse(request, JSON.stringify({ success: true, id: asset.id }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // DELETE /api/user/assets - Delete a business asset
      if (path === "/api/user/assets" && request.method === "DELETE") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const userId = payload.sub as string;
          const body: any = await request.json();
          const { id } = body;

          if (!id) return corsResponse(request, JSON.stringify({ error: "Missing ID" }), 400);

          await env.LOCKSMITH_DB.prepare(`
          DELETE FROM user_assets WHERE id = ? AND user_id = ?
        `).bind(id, userId).run();

          return corsResponse(request, JSON.stringify({ success: true, id }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // ==============================================
      // VEHICLE COMMENTS ENDPOINTS (Public Job Notes)
      // ==============================================

      // GET /api/vehicle-comments - Fetch comments for a vehicle (with threading)
      if (path === "/api/vehicle-comments" && request.method === "GET") {
        try {
          // Support both old vehicle_key and new make/model params
          const vehicleKey = url.searchParams.get('vehicle_key');
          const make = url.searchParams.get('make');
          const model = url.searchParams.get('model');

          if (!vehicleKey && (!make || !model)) {
            return corsResponse(request, JSON.stringify({ error: "Missing vehicle_key or make/model" }), 400);
          }

          // Get current user for vote status (optional)
          let currentUserId: string | null = null;
          const sessionToken = getSessionToken(request);
          if (sessionToken) {
            const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
            if (payload?.sub) currentUserId = payload.sub as string;
          }

          // Fetch all comments for this vehicle
          const nastfOnly = url.searchParams.get('nastf_only') === 'true';
          const bindValue = vehicleKey || `${make?.toLowerCase()}_${model?.toLowerCase()}`;

          // Build query with NASTF filter support
          let whereConditions = 'vc.vehicle_key = ?';
          if (nastfOnly) {
            whereConditions += ' AND COALESCE(u.nastf_verified, 0) = 1';
          }

          const result = await env.LOCKSMITH_DB.prepare(`
            SELECT vc.id, vc.parent_id, vc.user_id, vc.user_name, vc.user_picture, vc.content, vc.job_type, vc.tool_used, 
                   vc.upvotes, COALESCE(vc.downvotes, 0) as downvotes, vc.created_at, vc.updated_at, 
                   COALESCE(vc.is_deleted, 0) as is_deleted,
                   COALESCE(u.nastf_verified, 0) as nastf_verified,
                   ur.rank_level
            FROM vehicle_comments vc
            LEFT JOIN users u ON vc.user_id = u.id
            LEFT JOIN user_reputation ur ON vc.user_id = ur.user_id
            WHERE ${whereConditions}
            ORDER BY vc.created_at ASC
          `).bind(bindValue).all();

          const comments = result.results || [];

          // Fetch user's votes if authenticated
          let userVotes: Record<string, number> = {};
          if (currentUserId && comments.length > 0) {
            const commentIds = comments.map((c: any) => c.id);
            const votesResult = await env.LOCKSMITH_DB.prepare(`
              SELECT comment_id, vote FROM comment_votes 
              WHERE user_id = ? AND comment_id IN (${commentIds.map(() => '?').join(',')})
            `).bind(currentUserId, ...commentIds).all();

            for (const v of (votesResult.results || []) as any[]) {
              userVotes[v.comment_id] = v.vote;
            }
          }

          // Build threaded structure
          const commentMap: Record<string, any> = {};
          const topLevel: any[] = [];

          for (const c of comments as any[]) {
            const comment = {
              ...c,
              content: c.is_deleted ? '[deleted]' : c.content,
              user_name: c.is_deleted ? '[deleted]' : c.user_name,
              user_picture: c.is_deleted ? null : c.user_picture,
              score: (c.upvotes || 0) - (c.downvotes || 0),
              user_vote: userVotes[c.id] || 0,
              replies: []
            };
            commentMap[c.id] = comment;
          }

          for (const c of comments as any[]) {
            if (c.parent_id && commentMap[c.parent_id]) {
              commentMap[c.parent_id].replies.push(commentMap[c.id]);
            } else {
              topLevel.push(commentMap[c.id]);
            }
          }

          // Sort top-level by score (hot), then by date
          topLevel.sort((a, b) => b.score - a.score || b.created_at - a.created_at);

          return corsResponse(request, JSON.stringify({
            comments: topLevel,
            vehicle_key: bindValue,
            comment_count: comments.length
          }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // POST /api/vehicle-comments - Add a new comment or reply (requires auth)
      if (path === "/api/vehicle-comments" && request.method === "POST") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Please sign in to leave a comment" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Please sign in to leave a comment" }), 401);

          const userId = payload.sub as string;
          const userName = (payload.name as string) || 'Anonymous';
          const userPicture = (payload.picture as string) || null;

          const body: any = await request.json();
          const { vehicle_key, make, model, content, parent_id, job_type, tool_used } = body;

          // Support both old vehicle_key and new make/model params
          const effectiveKey = vehicle_key || (make && model ? `${make.toLowerCase()}_${model.toLowerCase()}` : null);

          if (!effectiveKey || !content) {
            return corsResponse(request, JSON.stringify({ error: "Missing vehicle identifier or content" }), 400);
          }

          if (content.length > 2000) {
            return corsResponse(request, JSON.stringify({ error: "Comment too long (max 2000 chars)" }), 400);
          }

          // Generate comment ID
          const commentId = `cmt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

          await env.LOCKSMITH_DB.prepare(`
            INSERT INTO vehicle_comments (id, vehicle_key, user_id, user_name, user_picture, content, parent_id, job_type, tool_used, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(commentId, effectiveKey, userId, userName, userPicture, content.trim(), parent_id || null, job_type || null, tool_used || null, Date.now()).run();

          // Log activity
          try {
            await env.LOCKSMITH_DB.prepare(
              "INSERT INTO user_activity (user_id, action, details, created_at) VALUES (?, ?, ?, ?)"
            ).bind(userId, parent_id ? 'reply_comment' : 'add_comment', JSON.stringify({ vehicle_key: effectiveKey, comment_id: commentId }), Date.now()).run();
          } catch (e) { /* non-critical */ }

          return corsResponse(request, JSON.stringify({
            success: true,
            message: parent_id ? "Reply added!" : "Comment added!",
            comment_id: commentId
          }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // POST /api/vehicle-comments/vote - Vote on a comment (requires auth)
      if (path === "/api/vehicle-comments/vote" && request.method === "POST") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Please sign in to vote" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Please sign in to vote" }), 401);

          const userId = payload.sub as string;

          // Rate limiting: 30 votes per minute per user
          const oneMinuteAgo = Date.now() - 60000;
          const recentVotes = await env.LOCKSMITH_DB.prepare(`
            SELECT COUNT(*) as count FROM comment_votes 
            WHERE user_id = ? AND created_at > ?
          `).bind(userId, oneMinuteAgo).first<any>();

          if (recentVotes && recentVotes.count >= 30) {
            return corsResponse(request, JSON.stringify({
              error: "Too many votes. Please wait a moment before voting again."
            }), 429);
          }

          const body: any = await request.json();
          const { comment_id, vote } = body;  // vote: 1 (upvote), -1 (downvote), 0 (remove vote)

          if (!comment_id || vote === undefined) {
            return corsResponse(request, JSON.stringify({ error: "Missing comment_id or vote" }), 400);
          }

          // Verify comment exists and is not deleted
          const comment = await env.LOCKSMITH_DB.prepare(
            `SELECT id, user_id, is_deleted FROM vehicle_comments WHERE id = ?`
          ).bind(comment_id).first<any>();

          if (!comment) {
            return corsResponse(request, JSON.stringify({ error: "Comment not found" }), 404);
          }

          if (comment.is_deleted) {
            return corsResponse(request, JSON.stringify({ error: "Cannot vote on deleted comments" }), 400);
          }

          // Prevent self-voting
          if (comment.user_id === userId) {
            return corsResponse(request, JSON.stringify({ error: "Cannot vote on your own comment" }), 400);
          }

          // Check existing vote
          const existingVote = await env.LOCKSMITH_DB.prepare(
            `SELECT vote FROM comment_votes WHERE user_id = ? AND comment_id = ?`
          ).bind(userId, comment_id).first<any>();

          const oldVote = existingVote?.vote || 0;

          if (vote === 0) {
            // Remove vote
            if (oldVote !== 0) {
              await env.LOCKSMITH_DB.prepare(`DELETE FROM comment_votes WHERE user_id = ? AND comment_id = ?`).bind(userId, comment_id).run();
              // Update comment counts
              if (oldVote === 1) {
                await env.LOCKSMITH_DB.prepare(`UPDATE vehicle_comments SET upvotes = upvotes - 1 WHERE id = ?`).bind(comment_id).run();
              } else {
                await env.LOCKSMITH_DB.prepare(`UPDATE vehicle_comments SET downvotes = COALESCE(downvotes, 0) - 1 WHERE id = ?`).bind(comment_id).run();
              }
            }
          } else {
            // Add or change vote
            if (oldVote === 0) {
              // New vote
              await env.LOCKSMITH_DB.prepare(
                `INSERT INTO comment_votes (user_id, comment_id, vote, created_at) VALUES (?, ?, ?, ?)`
              ).bind(userId, comment_id, vote, Date.now()).run();
              if (vote === 1) {
                await env.LOCKSMITH_DB.prepare(`UPDATE vehicle_comments SET upvotes = upvotes + 1 WHERE id = ?`).bind(comment_id).run();
              } else {
                await env.LOCKSMITH_DB.prepare(`UPDATE vehicle_comments SET downvotes = COALESCE(downvotes, 0) + 1 WHERE id = ?`).bind(comment_id).run();
              }
            } else if (oldVote !== vote) {
              // Change vote
              await env.LOCKSMITH_DB.prepare(
                `UPDATE comment_votes SET vote = ?, created_at = ? WHERE user_id = ? AND comment_id = ?`
              ).bind(vote, Date.now(), userId, comment_id).run();
              if (vote === 1) {
                // Changed from down to up
                await env.LOCKSMITH_DB.prepare(`UPDATE vehicle_comments SET upvotes = upvotes + 1, downvotes = COALESCE(downvotes, 0) - 1 WHERE id = ?`).bind(comment_id).run();
              } else {
                // Changed from up to down
                await env.LOCKSMITH_DB.prepare(`UPDATE vehicle_comments SET upvotes = upvotes - 1, downvotes = COALESCE(downvotes, 0) + 1 WHERE id = ?`).bind(comment_id).run();
              }
            }
            // If oldVote === vote, it's a toggle-off (treat as remove)
            else {
              await env.LOCKSMITH_DB.prepare(`DELETE FROM comment_votes WHERE user_id = ? AND comment_id = ?`).bind(userId, comment_id).run();
              if (vote === 1) {
                await env.LOCKSMITH_DB.prepare(`UPDATE vehicle_comments SET upvotes = upvotes - 1 WHERE id = ?`).bind(comment_id).run();
              } else {
                await env.LOCKSMITH_DB.prepare(`UPDATE vehicle_comments SET downvotes = COALESCE(downvotes, 0) - 1 WHERE id = ?`).bind(comment_id).run();
              }
            }
          }

          return corsResponse(request, JSON.stringify({ success: true, vote }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // DELETE /api/vehicle-comments - Soft-delete a comment (requires auth, owner only)
      if (path === "/api/vehicle-comments" && request.method === "DELETE") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const userId = payload.sub as string;
          const body: any = await request.json();
          const { comment_id } = body;

          if (!comment_id) {
            return corsResponse(request, JSON.stringify({ error: "Missing comment_id" }), 400);
          }

          // Verify ownership
          const comment = await env.LOCKSMITH_DB.prepare(
            `SELECT user_id FROM vehicle_comments WHERE id = ?`
          ).bind(comment_id).first<any>();

          if (!comment) {
            return corsResponse(request, JSON.stringify({ error: "Comment not found" }), 404);
          }

          if (comment.user_id !== userId) {
            return corsResponse(request, JSON.stringify({ error: "You can only delete your own comments" }), 403);
          }

          // Soft delete (preserve threading)
          await env.LOCKSMITH_DB.prepare(
            `UPDATE vehicle_comments SET is_deleted = 1, content = '[deleted]', updated_at = ? WHERE id = ?`
          ).bind(Date.now(), comment_id).run();

          return corsResponse(request, JSON.stringify({ success: true }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }
      // ==============================================
      // ENHANCED COMMUNITY SYSTEM ENDPOINTS
      // ==============================================

      // POST /api/vehicle-comments/flag - Report a comment for moderation
      if (path === "/api/vehicle-comments/flag" && request.method === "POST") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Please sign in to report" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const userId = payload.sub as string;
          const body: any = await request.json();
          const { comment_id, reason, details } = body;

          if (!comment_id || !reason) {
            return corsResponse(request, JSON.stringify({ error: "Missing comment_id or reason" }), 400);
          }

          const validReasons = ['spam', 'misinformation', 'offensive', 'off_topic', 'other'];
          if (!validReasons.includes(reason)) {
            return corsResponse(request, JSON.stringify({ error: "Invalid reason" }), 400);
          }

          // Check if user already flagged this comment
          const existingFlag = await env.LOCKSMITH_DB.prepare(
            `SELECT id FROM comment_flags WHERE comment_id = ? AND reporter_id = ?`
          ).bind(comment_id, userId).first();

          if (existingFlag) {
            return corsResponse(request, JSON.stringify({ error: "You already reported this comment" }), 400);
          }

          const flagId = `flag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

          await env.LOCKSMITH_DB.prepare(`
            INSERT INTO comment_flags (id, comment_id, reporter_id, reason, details, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
          `).bind(flagId, comment_id, userId, reason, details || null, Date.now()).run();

          // Update flag_count on comment
          await env.LOCKSMITH_DB.prepare(`
            UPDATE vehicle_comments SET flag_count = COALESCE(flag_count, 0) + 1 WHERE id = ?
          `).bind(comment_id).run();

          return corsResponse(request, JSON.stringify({ success: true, message: "Comment reported" }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // GET /api/moderation/queue - Get flagged comments (admin only)
      if (path === "/api/moderation/queue" && request.method === "GET") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const userIsDev = payload.is_developer || isDeveloper(payload.email as string, env.DEV_EMAILS);
          if (!userIsDev) return corsResponse(request, JSON.stringify({ error: "Admin access required" }), 403);

          const result = await env.LOCKSMITH_DB.prepare(`
            SELECT 
              cf.id as flag_id, cf.comment_id, cf.reason, cf.details, cf.created_at as flag_created,
              cf.reporter_id,
              vc.content, vc.vehicle_key, vc.user_id as comment_author_id, vc.user_name as comment_author_name,
              vc.flag_count, vc.created_at as comment_created,
              u.name as reporter_name, u.email as reporter_email
            FROM comment_flags cf
            JOIN vehicle_comments vc ON cf.comment_id = vc.id
            LEFT JOIN users u ON cf.reporter_id = u.id
            WHERE cf.resolved = 0
            ORDER BY cf.created_at DESC
            LIMIT 100
          `).all();

          return corsResponse(request, JSON.stringify({ flags: result.results || [] }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // POST /api/moderation/resolve - Resolve a flag (admin only)
      if (path === "/api/moderation/resolve" && request.method === "POST") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const userId = payload.sub as string;
          const userIsDev = payload.is_developer || isDeveloper(payload.email as string, env.DEV_EMAILS);
          if (!userIsDev) return corsResponse(request, JSON.stringify({ error: "Admin access required" }), 403);

          const body: any = await request.json();
          const { flag_id, resolution, delete_comment } = body;

          if (!flag_id || !resolution) {
            return corsResponse(request, JSON.stringify({ error: "Missing flag_id or resolution" }), 400);
          }

          const validResolutions = ['dismissed', 'deleted', 'warning_issued'];
          if (!validResolutions.includes(resolution)) {
            return corsResponse(request, JSON.stringify({ error: "Invalid resolution" }), 400);
          }

          // Get the flag to find the comment
          const flag = await env.LOCKSMITH_DB.prepare(
            `SELECT comment_id FROM comment_flags WHERE id = ?`
          ).bind(flag_id).first<any>();

          if (!flag) {
            return corsResponse(request, JSON.stringify({ error: "Flag not found" }), 404);
          }

          // Resolve the flag
          await env.LOCKSMITH_DB.prepare(`
            UPDATE comment_flags SET resolved = 1, resolution = ?, resolved_by = ?, resolved_at = ?
            WHERE id = ?
          `).bind(resolution, userId, Date.now(), flag_id).run();

          // If delete_comment is true, soft-delete the comment
          if (delete_comment) {
            await env.LOCKSMITH_DB.prepare(`
              UPDATE vehicle_comments SET is_deleted = 1, content = '[removed by moderator]', updated_at = ?
              WHERE id = ?
            `).bind(Date.now(), flag.comment_id).run();
          }

          return corsResponse(request, JSON.stringify({ success: true }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // POST /api/vehicle-comments/verify - Mark comment as verified pearl (admin/field lead)
      if (path === "/api/vehicle-comments/verify" && request.method === "POST") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const userId = payload.sub as string;
          const userIsDev = payload.is_developer || isDeveloper(payload.email as string, env.DEV_EMAILS);
          if (!userIsDev) return corsResponse(request, JSON.stringify({ error: "Admin access required" }), 403);

          const body: any = await request.json();
          const { comment_id, verification_type, notes } = body;

          if (!comment_id || !verification_type) {
            return corsResponse(request, JSON.stringify({ error: "Missing comment_id or verification_type" }), 400);
          }

          const validTypes = ['confirmed', 'integrated', 'expert_verified'];
          if (!validTypes.includes(verification_type)) {
            return corsResponse(request, JSON.stringify({ error: "Invalid verification_type" }), 400);
          }

          // Get comment to find author
          const comment = await env.LOCKSMITH_DB.prepare(
            `SELECT user_id FROM vehicle_comments WHERE id = ?`
          ).bind(comment_id).first<any>();

          if (!comment) {
            return corsResponse(request, JSON.stringify({ error: "Comment not found" }), 404);
          }

          // Add to verified_pearls
          const pearlId = `pearl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          await env.LOCKSMITH_DB.prepare(`
            INSERT INTO verified_pearls (id, comment_id, verified_by, verification_type, notes, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(comment_id) DO UPDATE SET
              verified_by = excluded.verified_by,
              verification_type = excluded.verification_type,
              notes = excluded.notes,
              created_at = excluded.created_at
          `).bind(pearlId, comment_id, userId, verification_type, notes || null, Date.now()).run();

          // Update comment's verification status
          await env.LOCKSMITH_DB.prepare(`
            UPDATE vehicle_comments SET is_verified = 1, verified_type = ? WHERE id = ?
          `).bind(verification_type, comment_id).run();

          // Increment author's pearls_validated count in user_reputation
          await env.LOCKSMITH_DB.prepare(`
            INSERT INTO user_reputation (user_id, pearls_validated, member_since, updated_at)
            VALUES (?, 1, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET
              pearls_validated = pearls_validated + 1,
              updated_at = excluded.updated_at
          `).bind(comment.user_id, Date.now(), Date.now()).run();

          return corsResponse(request, JSON.stringify({ success: true, message: "Comment verified as pearl" }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // GET /api/user/reputation - Get user's reputation and badges
      if (path.startsWith("/api/user/reputation") && request.method === "GET") {
        try {
          // Extract userId from path or query
          const pathUserId = path.split('/').pop();
          const queryUserId = url.searchParams.get('user_id');
          let targetUserId = (pathUserId !== 'reputation' ? pathUserId : queryUserId);

          // If no target user specified, get current user
          if (!targetUserId) {
            const sessionToken = getSessionToken(request);
            if (sessionToken) {
              const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
              if (payload?.sub) targetUserId = payload.sub as string;
            }
          }

          if (!targetUserId) {
            return corsResponse(request, JSON.stringify({ error: "Missing user_id" }), 400);
          }

          // Get reputation
          const reputation = await env.LOCKSMITH_DB.prepare(`
            SELECT * FROM user_reputation WHERE user_id = ?
          `).bind(targetUserId).first<any>();

          // Get badges
          const badges = await env.LOCKSMITH_DB.prepare(`
            SELECT badge_type, badge_name, badge_icon, badge_tier, earned_at
            FROM user_badges WHERE user_id = ?
            ORDER BY earned_at DESC
          `).bind(targetUserId).all();

          // Get user info
          const user = await env.LOCKSMITH_DB.prepare(`
            SELECT id, name, picture, created_at FROM users WHERE id = ?
          `).bind(targetUserId).first<any>();

          // Calculate rank name
          const rankNames = ['Apprentice', 'Journeyman', 'Master Tech', 'Legend'];
          const rankLevel = reputation?.rank_level || 1;

          return corsResponse(request, JSON.stringify({
            user: user || { id: targetUserId },
            reputation: reputation || { total_score: 0, pearls_validated: 0, comments_count: 0, rank_level: 1 },
            rank_name: rankNames[rankLevel - 1] || 'Apprentice',
            badges: badges.results || []
          }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // GET /api/user/mentions - Get unread mentions for current user
      if (path === "/api/user/mentions" && request.method === "GET") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const userId = payload.sub as string;
          const unreadOnly = url.searchParams.get('unread_only') !== 'false';

          const whereClause = unreadOnly ? 'AND cm.is_read = 0' : '';

          const result = await env.LOCKSMITH_DB.prepare(`
            SELECT 
              cm.id, cm.comment_id, cm.is_read, cm.created_at,
              vc.content, vc.vehicle_key,
              u.name as mentioner_name, u.picture as mentioner_picture
            FROM comment_mentions cm
            JOIN vehicle_comments vc ON cm.comment_id = vc.id
            LEFT JOIN users u ON cm.mentioner_id = u.id
            WHERE cm.mentioned_user_id = ? ${whereClause}
            ORDER BY cm.created_at DESC
            LIMIT 50
          `).bind(userId).all();

          const unreadCount = await env.LOCKSMITH_DB.prepare(`
            SELECT COUNT(*) as count FROM comment_mentions WHERE mentioned_user_id = ? AND is_read = 0
          `).bind(userId).first<any>();

          return corsResponse(request, JSON.stringify({
            mentions: result.results || [],
            unread_count: unreadCount?.count || 0
          }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // POST /api/user/mentions/read - Mark mentions as read
      if (path === "/api/user/mentions/read" && request.method === "POST") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const userId = payload.sub as string;
          const body: any = await request.json();
          const { mention_ids } = body; // Optional: specific IDs, or mark all if not provided

          if (mention_ids && Array.isArray(mention_ids) && mention_ids.length > 0) {
            // Mark specific mentions as read
            const placeholders = mention_ids.map(() => '?').join(',');
            await env.LOCKSMITH_DB.prepare(`
              UPDATE comment_mentions SET is_read = 1 
              WHERE mentioned_user_id = ? AND id IN (${placeholders})
            `).bind(userId, ...mention_ids).run();
          } else {
            // Mark all as read
            await env.LOCKSMITH_DB.prepare(`
              UPDATE comment_mentions SET is_read = 1 WHERE mentioned_user_id = ?
            `).bind(userId).run();
          }

          return corsResponse(request, JSON.stringify({ success: true }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // ==============================================
      // COMMUNITY HUB ENDPOINTS
      // ==============================================

      // GET /api/community/recent - Get recent comments across all vehicles
      if (path === "/api/community/recent" && request.method === "GET") {
        try {
          const limit = parseInt(url.searchParams.get('limit') || '50');

          const result = await env.LOCKSMITH_DB.prepare(`
            SELECT 
              vc.id, vc.vehicle_key, vc.user_id, vc.user_name, vc.user_picture,
              vc.content, vc.upvotes, vc.job_type, vc.tool_used, vc.created_at,
              ur.rank_level,
              COALESCE(u.nastf_verified, 0) as nastf_verified
            FROM vehicle_comments vc
            LEFT JOIN user_reputation ur ON vc.user_id = ur.user_id
            LEFT JOIN users u ON vc.user_id = u.id
            WHERE COALESCE(vc.is_deleted, 0) = 0 AND vc.parent_id IS NULL
            ORDER BY vc.created_at DESC
            LIMIT ?
          `).bind(Math.min(limit, 100)).all();

          return corsResponse(request, JSON.stringify({
            comments: result.results || []
          }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // GET /api/community/leaderboard - Get top contributors
      if (path === "/api/community/leaderboard" && request.method === "GET") {
        try {
          const limit = parseInt(url.searchParams.get('limit') || '20');

          // Get top users by reputation score
          const result = await env.LOCKSMITH_DB.prepare(`
            SELECT 
              ur.user_id, ur.reputation_score, ur.pearls_validated, ur.rank_level,
              u.name as user_name, u.picture as user_picture
            FROM user_reputation ur
            LEFT JOIN users u ON ur.user_id = u.id
            WHERE ur.reputation_score > 0
            ORDER BY ur.reputation_score DESC, ur.pearls_validated DESC
            LIMIT ?
          `).bind(Math.min(limit, 50)).all();

          // Calculate rank names
          const rankNames = ['Apprentice', 'Journeyman', 'Master Tech', 'Legend'];
          const leaderboard = (result.results || []).map((entry: any) => ({
            ...entry,
            rank_name: rankNames[(entry.rank_level || 1) - 1] || 'Apprentice'
          }));

          return corsResponse(request, JSON.stringify({
            leaderboard
          }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // GET /api/community/trending - Get trending content (highest score in last 7 days)
      if (path === "/api/community/trending" && request.method === "GET") {
        try {
          const limit = parseInt(url.searchParams.get('limit') || '20');
          const daysAgo = Math.min(parseInt(url.searchParams.get('days') || '7'), 30); // Cap at 30 days
          const cutoffTime = Date.now() - (daysAgo * 24 * 60 * 60 * 1000);

          const result = await env.LOCKSMITH_DB.prepare(`
            SELECT 
              vc.id, vc.vehicle_key, vc.user_id, vc.user_name, vc.user_picture,
              vc.content, vc.upvotes, COALESCE(vc.downvotes, 0) as downvotes,
              (vc.upvotes - COALESCE(vc.downvotes, 0)) as score,
              vc.job_type, vc.tool_used, vc.created_at,
              COALESCE(vc.is_verified, 0) as is_verified, vc.verified_type,
              ur.rank_level
            FROM vehicle_comments vc
            LEFT JOIN user_reputation ur ON vc.user_id = ur.user_id
            WHERE COALESCE(vc.is_deleted, 0) = 0 
              AND vc.parent_id IS NULL
              AND vc.created_at > ?
            ORDER BY score DESC, vc.upvotes DESC, vc.created_at DESC
            LIMIT ?
          `).bind(cutoffTime, Math.min(limit, 50)).all();

          return corsResponse(request, JSON.stringify({
            trending: result.results || [],
            period_days: daysAgo
          }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // GET /api/community/insights - Get community stats for AI integration
      if (path === "/api/community/insights" && request.method === "GET") {
        try {
          const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

          // Get total comments and active this week
          const commentStats = await env.LOCKSMITH_DB.prepare(`
            SELECT 
              COUNT(*) as total_comments,
              SUM(CASE WHEN created_at > ? THEN 1 ELSE 0 END) as comments_this_week
            FROM vehicle_comments
            WHERE COALESCE(is_deleted, 0) = 0
          `).bind(weekAgo).first<any>();

          // Get total and new verified pearls
          const pearlStats = await env.LOCKSMITH_DB.prepare(`
            SELECT 
              COUNT(*) as total_verified,
              SUM(CASE WHEN created_at > ? THEN 1 ELSE 0 END) as pearls_this_week
            FROM verified_pearls
          `).bind(weekAgo).first<any>();

          // Get top contributors this week
          const topContributors = await env.LOCKSMITH_DB.prepare(`
            SELECT 
              vc.user_name, COUNT(*) as contributions,
              SUM(vc.upvotes) as total_upvotes
            FROM vehicle_comments vc
            WHERE vc.created_at > ? AND COALESCE(vc.is_deleted, 0) = 0
            GROUP BY vc.user_id, vc.user_name
            ORDER BY contributions DESC, total_upvotes DESC
            LIMIT 5
          `).bind(weekAgo).all();

          // Get most discussed vehicles this week
          const hotVehicles = await env.LOCKSMITH_DB.prepare(`
            SELECT 
              vehicle_key, COUNT(*) as comment_count,
              SUM(upvotes) as total_upvotes
            FROM vehicle_comments
            WHERE created_at > ? AND COALESCE(is_deleted, 0) = 0
            GROUP BY vehicle_key
            ORDER BY comment_count DESC, total_upvotes DESC
            LIMIT 5
          `).bind(weekAgo).all();

          // Get trending topics by analyzing content (simple keyword extraction)
          const recentContent = await env.LOCKSMITH_DB.prepare(`
            SELECT content FROM vehicle_comments
            WHERE created_at > ? AND COALESCE(is_deleted, 0) = 0 AND upvotes > 0
            LIMIT 50
          `).bind(weekAgo).all();

          return corsResponse(request, JSON.stringify({
            stats: {
              total_comments: commentStats?.total_comments || 0,
              comments_this_week: commentStats?.comments_this_week || 0,
              total_verified_pearls: pearlStats?.total_verified || 0,
              new_pearls_this_week: pearlStats?.pearls_this_week || 0
            },
            top_contributors: topContributors.results || [],
            hot_vehicles: hotVehicles.results || [],
            sample_content: (recentContent.results || []).slice(0, 10)
          }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // ==============================================
      // NASTF VSP VERIFICATION ENDPOINTS
      // ==============================================

      // POST /api/nastf/submit-verification - User submits proof image
      if (path === "/api/nastf/submit-verification" && request.method === "POST") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Please sign in" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const userId = payload.sub as string;
          const body: any = await request.json();
          const { proof_image_url } = body;

          if (!proof_image_url) {
            return corsResponse(request, JSON.stringify({ error: "Missing proof image URL" }), 400);
          }

          // Check if user already has a pending or approved verification
          const existing = await env.LOCKSMITH_DB.prepare(
            `SELECT id, status FROM nastf_verifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`
          ).bind(userId).first<any>();

          if (existing?.status === 'approved') {
            return corsResponse(request, JSON.stringify({ error: "Already verified" }), 400);
          }
          if (existing?.status === 'pending') {
            return corsResponse(request, JSON.stringify({ error: "Verification already pending" }), 400);
          }

          const verificationId = `nv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          await env.LOCKSMITH_DB.prepare(`
            INSERT INTO nastf_verifications (id, user_id, proof_image_url, status, created_at)
            VALUES (?, ?, ?, 'pending', ?)
          `).bind(verificationId, userId, proof_image_url, Date.now()).run();

          return corsResponse(request, JSON.stringify({ success: true, verification_id: verificationId }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // GET /api/nastf/status - User checks their verification status
      if (path === "/api/nastf/status" && request.method === "GET") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Please sign in" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const userId = payload.sub as string;

          // Get user's NASTF status
          const user = await env.LOCKSMITH_DB.prepare(
            `SELECT nastf_verified, nastf_verified_at FROM users WHERE id = ?`
          ).bind(userId).first<any>();

          // Get latest verification request
          const verification = await env.LOCKSMITH_DB.prepare(
            `SELECT id, status, rejection_reason, created_at FROM nastf_verifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`
          ).bind(userId).first<any>();

          return corsResponse(request, JSON.stringify({
            nastf_verified: user?.nastf_verified === 1,
            nastf_verified_at: user?.nastf_verified_at,
            pending_verification: verification?.status === 'pending' ? verification : null,
            last_rejection: verification?.status === 'rejected' ? { reason: verification.rejection_reason, created_at: verification.created_at } : null
          }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // GET /api/nastf/pending - Admin gets pending verifications
      if (path === "/api/nastf/pending" && request.method === "GET") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const userIsDev = payload.is_developer || isDeveloper(payload.email as string, env.DEV_EMAILS);
          if (!userIsDev) return corsResponse(request, JSON.stringify({ error: "Admin access required" }), 403);

          const result = await env.LOCKSMITH_DB.prepare(`
            SELECT nv.id, nv.user_id, nv.proof_image_url, nv.created_at,
                   u.name as user_name, u.email as user_email, u.picture as user_picture
            FROM nastf_verifications nv
            LEFT JOIN users u ON nv.user_id = u.id
            WHERE nv.status = 'pending'
            ORDER BY nv.created_at ASC
          `).all();

          return corsResponse(request, JSON.stringify({ verifications: result.results || [] }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // POST /api/nastf/approve - Admin approves or rejects verification
      if (path === "/api/nastf/approve" && request.method === "POST") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const adminId = payload.sub as string;
          const userIsDev = payload.is_developer || isDeveloper(payload.email as string, env.DEV_EMAILS);
          if (!userIsDev) return corsResponse(request, JSON.stringify({ error: "Admin access required" }), 403);

          const body: any = await request.json();
          const { verification_id, action, rejection_reason } = body;

          if (!verification_id || !['approve', 'reject'].includes(action)) {
            return corsResponse(request, JSON.stringify({ error: "Invalid verification_id or action" }), 400);
          }

          // Get verification
          const verification = await env.LOCKSMITH_DB.prepare(
            `SELECT user_id, status FROM nastf_verifications WHERE id = ?`
          ).bind(verification_id).first<any>();

          if (!verification) {
            return corsResponse(request, JSON.stringify({ error: "Verification not found" }), 404);
          }
          if (verification.status !== 'pending') {
            return corsResponse(request, JSON.stringify({ error: "Verification already processed" }), 400);
          }

          const now = Date.now();
          const newStatus = action === 'approve' ? 'approved' : 'rejected';

          // Update verification record
          await env.LOCKSMITH_DB.prepare(`
            UPDATE nastf_verifications 
            SET status = ?, reviewed_by = ?, reviewed_at = ?, rejection_reason = ?
            WHERE id = ?
          `).bind(newStatus, adminId, now, rejection_reason || null, verification_id).run();

          if (action === 'approve') {
            // Update user's NASTF status
            await env.LOCKSMITH_DB.prepare(`
              UPDATE users SET nastf_verified = 1, nastf_verified_at = ? WHERE id = ?
            `).bind(now, verification.user_id).run();

            // Award NASTF badge
            const badgeId = `badge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            await env.LOCKSMITH_DB.prepare(`
              INSERT INTO user_badges (id, user_id, badge_type, badge_name, badge_icon, badge_tier, earned_at)
              VALUES (?, ?, 'licensure', 'NASTF Verified', '🛡️', 1, ?)
              ON CONFLICT DO NOTHING
            `).bind(badgeId, verification.user_id, now).run();

            // Award initial 100 points for current month
            const yearMonth = new Date().toISOString().slice(0, 7);
            await env.LOCKSMITH_DB.prepare(`
              INSERT INTO nastf_monthly_points (user_id, year_month, points_awarded, awarded_at)
              VALUES (?, ?, 100, ?)
              ON CONFLICT DO NOTHING
            `).bind(verification.user_id, yearMonth, now).run();

            // Update user reputation
            await env.LOCKSMITH_DB.prepare(`
              INSERT INTO user_reputation (user_id, total_score, member_since, updated_at)
              VALUES (?, 100, ?, ?)
              ON CONFLICT(user_id) DO UPDATE SET
                total_score = total_score + 100,
                updated_at = excluded.updated_at
            `).bind(verification.user_id, now, now).run();
          }

          return corsResponse(request, JSON.stringify({ success: true, status: newStatus }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // POST /api/nastf/award-monthly - Award monthly points (called by cron or admin)
      if (path === "/api/nastf/award-monthly" && request.method === "POST") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const userIsDev = payload.is_developer || isDeveloper(payload.email as string, env.DEV_EMAILS);
          if (!userIsDev) return corsResponse(request, JSON.stringify({ error: "Admin access required" }), 403);

          const yearMonth = new Date().toISOString().slice(0, 7);
          const now = Date.now();

          // Get all NASTF verified users who haven't received points this month
          const verifiedUsers = await env.LOCKSMITH_DB.prepare(`
            SELECT u.id FROM users u
            WHERE u.nastf_verified = 1
            AND u.id NOT IN (
              SELECT user_id FROM nastf_monthly_points WHERE year_month = ?
            )
          `).bind(yearMonth).all();

          let awarded = 0;
          for (const user of (verifiedUsers.results || []) as any[]) {
            await env.LOCKSMITH_DB.prepare(`
              INSERT INTO nastf_monthly_points (user_id, year_month, points_awarded, awarded_at)
              VALUES (?, ?, 100, ?)
            `).bind(user.id, yearMonth, now).run();

            await env.LOCKSMITH_DB.prepare(`
              UPDATE user_reputation SET total_score = total_score + 100, updated_at = ?
              WHERE user_id = ?
            `).bind(now, user.id).run();

            awarded++;
          }

          return corsResponse(request, JSON.stringify({ success: true, users_awarded: awarded, year_month: yearMonth }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // ==============================================
      // EXPANDED LOCKSMITH VERIFICATION ENDPOINTS
      // ==============================================

      // GET /api/verification/status - Get user's verification status across all proof types
      if (path === "/api/verification/status" && request.method === "GET") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Please sign in" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const userId = payload.sub as string;

          // Get user's verification status
          const user = await env.LOCKSMITH_DB.prepare(
            `SELECT locksmith_verified, locksmith_verified_at, verification_level, nastf_verified FROM users WHERE id = ?`
          ).bind(userId).first<any>();

          // Get all proofs
          const proofs = await env.LOCKSMITH_DB.prepare(
            `SELECT proof_type, status, rejection_reason, created_at FROM locksmith_proofs WHERE user_id = ? ORDER BY created_at DESC`
          ).bind(userId).all();

          const allProofs = (proofs.results || []) as any[];

          return corsResponse(request, JSON.stringify({
            locksmith_verified: user?.locksmith_verified === 1 || user?.nastf_verified === 1,
            verification_level: user?.verification_level || 'none',
            nastf_verified: user?.nastf_verified === 1,
            approved_proofs: allProofs.filter(p => p.status === 'approved'),
            pending_proofs: allProofs.filter(p => p.status === 'pending'),
            rejected_proofs: allProofs.filter(p => p.status === 'rejected')
          }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // POST /api/verification/upload-proof - Upload proof image and create verification request
      if (path === "/api/verification/upload-proof" && request.method === "POST") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Please sign in" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const userId = payload.sub as string;
          const formData = await request.formData();
          const fileEntry = formData.get('file');
          const proofType = formData.get('proof_type') as string;

          if (!fileEntry || typeof fileEntry === 'string') {
            return corsResponse(request, JSON.stringify({ error: "Missing file" }), 400);
          }
          const file = fileEntry as unknown as File;

          const validProofTypes = ['nastf_vsp', 'business_license', 'aloa_card', 'state_license', 'tool_photo', 'insurance_cert', 'work_van'];
          if (!proofType || !validProofTypes.includes(proofType)) {
            return corsResponse(request, JSON.stringify({ error: "Invalid proof type" }), 400);
          }

          // Check for existing pending proof of same type
          const existing = await env.LOCKSMITH_DB.prepare(
            `SELECT id FROM locksmith_proofs WHERE user_id = ? AND proof_type = ? AND status = 'pending'`
          ).bind(userId, proofType).first();

          if (existing) {
            return corsResponse(request, JSON.stringify({ error: "You already have a pending submission for this proof type" }), 400);
          }

          // Upload to R2
          const fileBuffer = await file.arrayBuffer();
          const fileName = `verification/${userId}/${proofType}_${Date.now()}.${file.name.split('.').pop()}`;

          await env.ASSETS_BUCKET.put(fileName, fileBuffer, {
            httpMetadata: { contentType: file.type }
          });

          const imageUrl = `https://pub-6f55decd53fc486a97f4a7c74e53f6c4.r2.dev/${fileName}`;

          // Create verification record
          const proofId = `proof_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          await env.LOCKSMITH_DB.prepare(`
            INSERT INTO locksmith_proofs (id, user_id, proof_type, proof_image_url, status, created_at)
            VALUES (?, ?, ?, ?, 'pending', ?)
          `).bind(proofId, userId, proofType, imageUrl, Date.now()).run();

          // Also add to nastf_verifications if it's NASTF VSP
          if (proofType === 'nastf_vsp') {
            const nvId = `nv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            await env.LOCKSMITH_DB.prepare(`
              INSERT INTO nastf_verifications (id, user_id, proof_image_url, proof_type, status, created_at)
              VALUES (?, ?, ?, ?, 'pending', ?)
            `).bind(nvId, userId, imageUrl, proofType, Date.now()).run();
          }

          return corsResponse(request, JSON.stringify({ success: true, proof_id: proofId, image_url: imageUrl }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // GET /api/verification/pending - Admin gets all pending verifications
      if (path === "/api/verification/pending" && request.method === "GET") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const userIsDev = payload.is_developer || isDeveloper(payload.email as string, env.DEV_EMAILS);
          if (!userIsDev) return corsResponse(request, JSON.stringify({ error: "Admin access required" }), 403);

          const result = await env.LOCKSMITH_DB.prepare(`
            SELECT lp.id, lp.user_id, lp.proof_type, lp.proof_image_url, lp.created_at,
                   u.name as user_name, u.email as user_email, u.picture as user_picture
            FROM locksmith_proofs lp
            LEFT JOIN users u ON lp.user_id = u.id
            WHERE lp.status = 'pending'
            ORDER BY lp.created_at ASC
          `).all();

          return corsResponse(request, JSON.stringify({ verifications: result.results || [] }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // POST /api/verification/review - Admin approves or rejects a proof
      if (path === "/api/verification/review" && request.method === "POST") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const adminId = payload.sub as string;
          const userIsDev = payload.is_developer || isDeveloper(payload.email as string, env.DEV_EMAILS);
          if (!userIsDev) return corsResponse(request, JSON.stringify({ error: "Admin access required" }), 403);

          const body: any = await request.json();
          const { proof_id, action, rejection_reason, admin_notes } = body;

          if (!proof_id || !['approve', 'reject'].includes(action)) {
            return corsResponse(request, JSON.stringify({ error: "Invalid proof_id or action" }), 400);
          }

          // Get proof
          const proof = await env.LOCKSMITH_DB.prepare(
            `SELECT user_id, proof_type, status FROM locksmith_proofs WHERE id = ?`
          ).bind(proof_id).first<any>();

          if (!proof) {
            return corsResponse(request, JSON.stringify({ error: "Proof not found" }), 404);
          }
          if (proof.status !== 'pending') {
            return corsResponse(request, JSON.stringify({ error: "Proof already processed" }), 400);
          }

          const now = Date.now();
          const newStatus = action === 'approve' ? 'approved' : 'rejected';

          // Update proof record
          await env.LOCKSMITH_DB.prepare(`
            UPDATE locksmith_proofs 
            SET status = ?, reviewed_by = ?, reviewed_at = ?, rejection_reason = ?, admin_notes = ?
            WHERE id = ?
          `).bind(newStatus, adminId, now, rejection_reason || null, admin_notes || null, proof_id).run();

          if (action === 'approve') {
            // Check how many approved proofs user now has
            const approvedCount = await env.LOCKSMITH_DB.prepare(
              `SELECT COUNT(*) as count FROM locksmith_proofs WHERE user_id = ? AND status = 'approved'`
            ).bind(proof.user_id).first<any>();

            const hasNASTF = proof.proof_type === 'nastf_vsp' || (await env.LOCKSMITH_DB.prepare(
              `SELECT id FROM locksmith_proofs WHERE user_id = ? AND proof_type = 'nastf_vsp' AND status = 'approved'`
            ).bind(proof.user_id).first());

            // Determine verification level
            let verificationLevel = 'none';
            if (hasNASTF) {
              verificationLevel = 'nastf';
            } else if (approvedCount?.count >= 2) {
              verificationLevel = 'professional';
            } else if (approvedCount?.count >= 1) {
              verificationLevel = 'basic';
            }

            // Update user if verified (2+ proofs or NASTF)
            if (approvedCount?.count >= 2 || hasNASTF) {
              await env.LOCKSMITH_DB.prepare(`
                UPDATE users SET locksmith_verified = 1, locksmith_verified_at = ?, verification_level = ? WHERE id = ?
              `).bind(now, verificationLevel, proof.user_id).run();

              // Award badge if newly verified
              const existingBadge = await env.LOCKSMITH_DB.prepare(
                `SELECT id FROM user_badges WHERE user_id = ? AND badge_type = 'licensure'`
              ).bind(proof.user_id).first();

              if (!existingBadge) {
                const badgeName = hasNASTF ? 'NASTF Verified' : 'Verified Locksmith';
                const badgeIcon = hasNASTF ? '🛡️' : '🔐';
                const badgeId = `badge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

                await env.LOCKSMITH_DB.prepare(`
                  INSERT INTO user_badges (id, user_id, badge_type, badge_name, badge_icon, badge_tier, earned_at)
                  VALUES (?, ?, 'licensure', ?, ?, 1, ?)
                `).bind(badgeId, proof.user_id, badgeName, badgeIcon, now).run();

                // Award points
                const yearMonth = new Date().toISOString().slice(0, 7);
                await env.LOCKSMITH_DB.prepare(`
                  INSERT INTO nastf_monthly_points (user_id, year_month, points_awarded, awarded_at)
                  VALUES (?, ?, 100, ?)
                  ON CONFLICT DO NOTHING
                `).bind(proof.user_id, yearMonth, now).run();

                await env.LOCKSMITH_DB.prepare(`
                  INSERT INTO user_reputation (user_id, total_score, member_since, updated_at)
                  VALUES (?, 100, ?, ?)
                  ON CONFLICT(user_id) DO UPDATE SET
                    total_score = total_score + 100,
                    updated_at = excluded.updated_at
                `).bind(proof.user_id, now, now).run();
              }

              // Update NASTF status if applicable
              if (hasNASTF && proof.proof_type === 'nastf_vsp') {
                await env.LOCKSMITH_DB.prepare(`
                  UPDATE users SET nastf_verified = 1, nastf_verified_at = ? WHERE id = ?
                `).bind(now, proof.user_id).run();
              }
            } else {
              // Just update verification level
              await env.LOCKSMITH_DB.prepare(`
                UPDATE users SET verification_level = ? WHERE id = ?
              `).bind(verificationLevel, proof.user_id).run();
            }
          }

          return corsResponse(request, JSON.stringify({ success: true, status: newStatus }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // ==============================================
      // PEARL INTERACTION ENDPOINTS
      // ==============================================

      // POST /api/pearls/vote - Vote on a pearl
      if (path === "/api/pearls/vote" && request.method === "POST") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Please sign in to vote" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const userId = payload.sub as string;
          const body: any = await request.json();
          const { pearl_id, vote } = body;

          if (!pearl_id || ![-1, 1].includes(vote)) {
            return corsResponse(request, JSON.stringify({ error: "Invalid pearl_id or vote" }), 400);
          }

          // Check existing vote
          const existingVote = await env.LOCKSMITH_DB.prepare(
            `SELECT vote FROM pearl_votes WHERE pearl_id = ? AND user_id = ?`
          ).bind(pearl_id, userId).first<{ vote: number }>();

          if (existingVote) {
            if (existingVote.vote === vote) {
              // Toggle off - remove vote
              await env.LOCKSMITH_DB.prepare(
                `DELETE FROM pearl_votes WHERE pearl_id = ? AND user_id = ?`
              ).bind(pearl_id, userId).run();
            } else {
              // Change vote
              await env.LOCKSMITH_DB.prepare(
                `UPDATE pearl_votes SET vote = ?, created_at = ? WHERE pearl_id = ? AND user_id = ?`
              ).bind(vote, Date.now(), pearl_id, userId).run();
            }
          } else {
            // New vote
            await env.LOCKSMITH_DB.prepare(
              `INSERT INTO pearl_votes (pearl_id, user_id, vote, created_at) VALUES (?, ?, ?, ?)`
            ).bind(pearl_id, userId, vote, Date.now()).run();
          }

          // Get updated vote counts
          const counts = await env.LOCKSMITH_DB.prepare(`
            SELECT 
              COALESCE(SUM(CASE WHEN vote = 1 THEN 1 ELSE 0 END), 0) as upvotes,
              COALESCE(SUM(CASE WHEN vote = -1 THEN 1 ELSE 0 END), 0) as downvotes
            FROM pearl_votes WHERE pearl_id = ?
          `).bind(pearl_id).first<{ upvotes: number; downvotes: number }>();

          // Get user's current vote
          const userVote = await env.LOCKSMITH_DB.prepare(
            `SELECT vote FROM pearl_votes WHERE pearl_id = ? AND user_id = ?`
          ).bind(pearl_id, userId).first<{ vote: number }>();

          return corsResponse(request, JSON.stringify({
            success: true,
            upvotes: counts?.upvotes || 0,
            downvotes: counts?.downvotes || 0,
            score: (counts?.upvotes || 0) - (counts?.downvotes || 0),
            user_vote: userVote?.vote || 0
          }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // GET /api/pearls/:id/votes - Get vote counts for a pearl
      if (path.match(/^\/api\/pearls\/\d+\/votes$/) && request.method === "GET") {
        try {
          const pearlId = parseInt(path.split('/')[3]);

          const counts = await env.LOCKSMITH_DB.prepare(`
            SELECT 
              COALESCE(SUM(CASE WHEN vote = 1 THEN 1 ELSE 0 END), 0) as upvotes,
              COALESCE(SUM(CASE WHEN vote = -1 THEN 1 ELSE 0 END), 0) as downvotes
            FROM pearl_votes WHERE pearl_id = ?
          `).bind(pearlId).first<{ upvotes: number; downvotes: number }>();

          // Check user vote if authenticated
          let userVote = 0;
          const sessionToken = getSessionToken(request);
          if (sessionToken) {
            const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
            if (payload?.sub) {
              const vote = await env.LOCKSMITH_DB.prepare(
                `SELECT vote FROM pearl_votes WHERE pearl_id = ? AND user_id = ?`
              ).bind(pearlId, payload.sub).first<{ vote: number }>();
              userVote = vote?.vote || 0;
            }
          }

          return corsResponse(request, JSON.stringify({
            upvotes: counts?.upvotes || 0,
            downvotes: counts?.downvotes || 0,
            score: (counts?.upvotes || 0) - (counts?.downvotes || 0),
            user_vote: userVote
          }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // POST /api/pearls/:id/reply - Reply to a pearl (creates comment linked to pearl)
      if (path.match(/^\/api\/pearls\/\d+\/reply$/) && request.method === "POST") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Please sign in to reply" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const pearlId = parseInt(path.split('/')[3]);
          const userId = payload.sub as string;
          const body: any = await request.json();
          const { content, vehicle_key } = body;

          if (!content || content.trim().length === 0) {
            return corsResponse(request, JSON.stringify({ error: "Content required" }), 400);
          }
          if (!vehicle_key) {
            return corsResponse(request, JSON.stringify({ error: "vehicle_key required" }), 400);
          }

          // Get user info
          const user = await env.LOCKSMITH_DB.prepare(
            `SELECT name, picture FROM users WHERE id = ?`
          ).bind(userId).first<{ name: string; picture: string }>();

          const commentId = crypto.randomUUID();
          await env.LOCKSMITH_DB.prepare(`
            INSERT INTO vehicle_comments (id, vehicle_key, user_id, user_name, user_picture, content, pearl_id, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            commentId,
            vehicle_key,
            userId,
            user?.name || 'Anonymous',
            user?.picture || null,
            content.trim(),
            pearlId,
            Date.now()
          ).run();

          return corsResponse(request, JSON.stringify({
            success: true,
            comment_id: commentId
          }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // POST /api/pearls/suggest-edit - Submit edit suggestion
      if (path === "/api/pearls/suggest-edit" && request.method === "POST") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Please sign in to suggest edits" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const userId = payload.sub as string;
          const body: any = await request.json();
          const { pearl_id, original_content, suggested_content, reason } = body;

          if (!pearl_id || !original_content || !suggested_content) {
            return corsResponse(request, JSON.stringify({ error: "Missing required fields" }), 400);
          }

          if (suggested_content === original_content) {
            return corsResponse(request, JSON.stringify({ error: "No changes detected" }), 400);
          }

          // Get user name
          const user = await env.LOCKSMITH_DB.prepare(
            `SELECT name FROM users WHERE id = ?`
          ).bind(userId).first<{ name: string }>();

          const suggestionId = crypto.randomUUID();
          await env.LOCKSMITH_DB.prepare(`
            INSERT INTO pearl_edit_suggestions (id, pearl_id, user_id, user_name, original_content, suggested_content, reason, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            suggestionId,
            pearl_id,
            userId,
            user?.name || 'Anonymous',
            original_content,
            suggested_content,
            reason || null,
            Date.now()
          ).run();

          return corsResponse(request, JSON.stringify({
            success: true,
            suggestion_id: suggestionId
          }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // GET /api/pearls/suggestions - Get pending suggestions (admin)
      if (path === "/api/pearls/suggestions" && request.method === "GET") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          // TODO: Add admin check here
          const status = url.searchParams.get('status') || 'pending';

          const result = await env.LOCKSMITH_DB.prepare(`
            SELECT * FROM pearl_edit_suggestions 
            WHERE status = ?
            ORDER BY created_at DESC
            LIMIT 50
          `).bind(status).all();

          return corsResponse(request, JSON.stringify({
            suggestions: result.results || []
          }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // POST /api/pearls/suggestions/:id/review - Approve/reject suggestion
      if (path.match(/^\/api\/pearls\/suggestions\/[^/]+\/review$/) && request.method === "POST") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const suggestionId = path.split('/')[4];
          const reviewerId = payload.sub as string;
          const body: any = await request.json();
          const { action } = body; // 'approve' or 'reject'

          if (!['approve', 'reject'].includes(action)) {
            return corsResponse(request, JSON.stringify({ error: "Invalid action" }), 400);
          }

          // Get suggestion
          const suggestion = await env.LOCKSMITH_DB.prepare(
            `SELECT * FROM pearl_edit_suggestions WHERE id = ?`
          ).bind(suggestionId).first<any>();

          if (!suggestion) {
            return corsResponse(request, JSON.stringify({ error: "Suggestion not found" }), 404);
          }

          const pointsAwarded = action === 'approve' ? 10 : 0;

          // Update suggestion status
          await env.LOCKSMITH_DB.prepare(`
            UPDATE pearl_edit_suggestions 
            SET status = ?, reviewed_by = ?, reviewed_at = ?, points_awarded = ?
            WHERE id = ?
          `).bind(
            action === 'approve' ? 'approved' : 'rejected',
            reviewerId,
            Date.now(),
            pointsAwarded,
            suggestionId
          ).run();

          // Award points if approved
          if (action === 'approve' && suggestion.user_id) {
            await env.LOCKSMITH_DB.prepare(`
              INSERT INTO user_reputation (user_id, reputation_score, edits_approved, updated_at)
              VALUES (?, ?, 1, ?)
              ON CONFLICT(user_id) DO UPDATE SET 
                reputation_score = reputation_score + ?,
                edits_approved = COALESCE(edits_approved, 0) + 1,
                updated_at = ?
            `).bind(suggestion.user_id, pointsAwarded, Date.now(), pointsAwarded, Date.now()).run();
          }

          return corsResponse(request, JSON.stringify({
            success: true,
            points_awarded: pointsAwarded
          }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // ==============================================
      // USER PREFERENCES ENDPOINTS
      // ==============================================


      // GET /api/user/preferences - Fetch user preferences
      if (path === "/api/user/preferences" && request.method === "GET") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const userId = payload.sub as string;
          const user = await env.LOCKSMITH_DB.prepare(`
            SELECT preferences FROM users WHERE id = ?
          `).bind(userId).first<any>();

          return corsResponse(request, JSON.stringify({
            preferences: user?.preferences ? JSON.parse(user.preferences) : {}
          }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // POST /api/user/preferences - Save user preferences
      if (path === "/api/user/preferences" && request.method === "POST") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const userId = payload.sub as string;
          const body: any = await request.json();
          const { preferences } = body;

          await env.LOCKSMITH_DB.prepare(`
            UPDATE users SET preferences = ? WHERE id = ?
          `).bind(JSON.stringify(preferences || {}), userId).run();

          return corsResponse(request, JSON.stringify({ success: true }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // ==============================================
      // DEVELOPER ANALYTICS ENDPOINT
      // ==============================================

      // GET /api/dev/analytics - Developer panel analytics
      if (path === "/api/dev/analytics" && request.method === "GET") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const userIsDev = payload.is_developer || isDeveloper(payload.email as string, env.DEV_EMAILS);
          if (!userIsDev) return corsResponse(request, JSON.stringify({ error: "Forbidden" }), 403);

          // Get total user count and growth
          const userStats = await env.LOCKSMITH_DB.prepare(`
            SELECT 
              COUNT(*) as total_users,
              COUNT(CASE WHEN created_at > ? THEN 1 END) as new_users_30d
            FROM users
          `).bind(Date.now() - 30 * 24 * 60 * 60 * 1000).first<any>();

          // Get activity stats
          const activityStats = await env.LOCKSMITH_DB.prepare(`
            SELECT 
              COUNT(CASE WHEN action = 'search' THEN 1 END) as total_searches,
              COUNT(CASE WHEN action = 'vin_lookup' THEN 1 END) as vin_lookups,
              COUNT(CASE WHEN action = 'affiliate_click' THEN 1 END) as affiliate_clicks
            FROM user_activity
            WHERE created_at > ?
          `).bind(Date.now() - 30 * 24 * 60 * 60 * 1000).first<any>();

          // Get recent users for table
          const recentUsers = await env.LOCKSMITH_DB.prepare(`
            SELECT 
              u.id, u.email, u.name, u.is_pro, u.created_at,
              MAX(a.created_at) as last_active,
              COUNT(a.id) as activity_count
            FROM users u
            LEFT JOIN user_activity a ON u.id = a.user_id
            GROUP BY u.id
            ORDER BY u.created_at DESC
            LIMIT 50
          `).all();

          // Get recent activity log with user info
          const recentActivity = await env.LOCKSMITH_DB.prepare(`
            SELECT 
              a.action as action_type, 
              a.details as metadata, 
              a.created_at, 
              a.user_id,
              COALESCE(u.name, 'Guest') as user_name,
              u.email as user_email
            FROM user_activity a
            LEFT JOIN users u ON a.user_id = u.id
            ORDER BY a.created_at DESC
            LIMIT 50
          `).all();

          // Calculate engagement (avg activities per user)
          const engagement = userStats.total_users > 0
            ? ((activityStats.total_searches || 0) + (activityStats.affiliate_clicks || 0)) / userStats.total_users
            : 0;

          // Cloudflare analytics placeholder (requires CF Analytics API token)
          const cloudflareData = {
            visitors_24h: '--',
            requests_24h: '--',
            bytes_24h: 0,
            cache_rate_24h: 0,
            visitors_7d: '--',
            requests_7d: '--',
            bytes_7d: 0,
            cache_rate_7d: 0
          };

          // Try to fetch Cloudflare analytics if token is available
          if (env.CF_ANALYTICS_TOKEN && env.CF_ZONE_ID) {
            try {
              const cfQuery = `
                query {
                  viewer {
                    zones(filter: {zoneTag: "${env.CF_ZONE_ID}"}) {
                      httpRequests1dGroups(limit: 7, filter: {date_gt: "${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}"}) {
                        sum { requests visits bytes cachedBytes }
                        dimensions { date }
                      }
                    }
                  }
                }
              `;

              const cfRes = await fetch('https://api.cloudflare.com/client/v4/graphql', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${env.CF_ANALYTICS_TOKEN}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query: cfQuery })
              });

              if (cfRes.ok) {
                const cfData: any = await cfRes.json();
                const groups = cfData.data?.viewer?.zones?.[0]?.httpRequests1dGroups || [];

                // Generate 24h and 7d summaries from the data
                if (groups.length > 0) {
                  const last24h = groups[groups.length - 1]?.sum || {};
                  cloudflareData.visitors_24h = last24h.visits || '--';
                  cloudflareData.requests_24h = last24h.requests || '--';
                  cloudflareData.bytes_24h = last24h.bytes || 0;
                  cloudflareData.cache_rate_24h = last24h.bytes > 0 ? (last24h.cachedBytes / last24h.bytes) * 100 : 0;

                  const total7d = groups.reduce((acc: any, g: any) => ({
                    visits: acc.visits + (g.sum?.visits || 0),
                    requests: acc.requests + (g.sum?.requests || 0),
                    bytes: acc.bytes + (g.sum?.bytes || 0),
                    cachedBytes: acc.cachedBytes + (g.sum?.cachedBytes || 0)
                  }), { visits: 0, requests: 0, bytes: 0, cachedBytes: 0 });

                  cloudflareData.visitors_7d = total7d.visits;
                  cloudflareData.requests_7d = total7d.requests;
                  cloudflareData.bytes_7d = total7d.bytes;
                  cloudflareData.cache_rate_7d = total7d.bytes > 0 ? (total7d.cachedBytes / total7d.bytes) * 100 : 0;
                }
              }
            } catch (cfErr) {
              console.error('Cloudflare analytics fetch failed:', cfErr);
            }
          }

          return corsResponse(request, JSON.stringify({
            total_users: userStats?.total_users || 0,
            user_growth: userStats?.new_users_30d || 0,
            total_searches: activityStats?.total_searches || 0,
            vin_lookups: activityStats?.vin_lookups || 0,
            affiliate_clicks: activityStats?.affiliate_clicks || 0,
            avg_engagement: engagement,
            users: recentUsers.results || [],
            activities: (recentActivity.results || []).map((a: any) => ({
              ...a,
              metadata: a.metadata ? JSON.parse(a.metadata) : {}
            })),
            cloudflare: cloudflareData
          }));
        } catch (err: any) {
          console.error('/api/dev/analytics error:', err);
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // GET /api/admin/users-inventory - Admin view of all users with inventory counts
      if (path === "/api/admin/users-inventory") {
        try {
          const cookieHeader = request.headers.get("Cookie");
          const sessionToken = cookieHeader?.split(';').find(c => c.trim().startsWith('session='))?.split('=')[1];
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const userIsDev = payload.is_developer || isDeveloper(payload.email as string, env.DEV_EMAILS);
          if (!userIsDev) return corsResponse(request, JSON.stringify({ error: "Forbidden" }), 403);

          const users = await env.LOCKSMITH_DB.prepare(`
          SELECT u.id, u.email, u.name, u.picture, u.created_at,
            COALESCE(SUM(CASE WHEN i.type = 'key' THEN i.qty ELSE 0 END), 0) as keys_count,
            COALESCE(SUM(CASE WHEN i.type = 'blank' THEN i.qty ELSE 0 END), 0) as blanks_count,
            MAX(i.updated_at) as last_inventory_update
          FROM users u LEFT JOIN inventory i ON u.id = i.user_id
          GROUP BY u.id ORDER BY u.created_at DESC
        `).all();

          return corsResponse(request, JSON.stringify({ users: users.results || [] }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // 6. Stripe Checkout - DEPRECATED: Use /api/create-checkout-session instead
      // This endpoint has been removed. The new endpoint uses direct HTTP calls to Stripe.


      // ==============================================
      // USER COMMENT SYSTEM ENDPOINTS
      // ==============================================

      // GET /api/comments - Fetch comments by context with visibility logic
      if (path === "/api/comments" && request.method === "GET") {
        try {
          const sessionToken = getSessionToken(request);
          let userId = null;
          let isDev = false;

          if (sessionToken) {
            const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
            if (payload && payload.sub) {
              userId = payload.sub as string;
              // Check dev status from token or email list fallback
              isDev = !!payload.is_developer || isDeveloper(payload.email as string, env.DEV_EMAILS);
            }
          }

          const contextType = url.searchParams.get('context_type');
          const contextId = url.searchParams.get('context_id');

          if (!contextType || !contextId) {
            return corsResponse(request, JSON.stringify({ error: "Missing context_type or context_id" }), 400);
          }

          // Query logic:
          // 1. 'public': Visible to everyone
          // 2. 'personal': Visible only to the author
          // 3. 'dev': Visible only if requester is a developer
          const results = await env.LOCKSMITH_DB.prepare(`
          SELECT c.*, u.name as user_name, u.picture as user_picture 
          FROM user_comments c
          LEFT JOIN users u ON c.user_id = u.id
          WHERE c.context_type = ? AND c.context_id = ?
          AND (
            c.comment_type = 'public' 
            OR (c.comment_type = 'personal' AND c.user_id = ?)
            OR (c.comment_type = 'dev' AND ?)
          )
          ORDER BY c.created_at DESC
        `).bind(contextType, contextId, userId || '', isDev ? 1 : 0).all();

          return corsResponse(request, JSON.stringify({ comments: results.results || [] }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // POST /api/comments - Create a new comment
      if (path === "/api/comments" && request.method === "POST") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const userId = payload.sub as string;
          const isDev = !!payload.is_developer || isDeveloper(payload.email as string, env.DEV_EMAILS);

          const body: any = await request.json();
          const { context_type, context_id, comment_type, content } = body;

          if (!context_type || !context_id || !content) {
            return corsResponse(request, JSON.stringify({ error: "Missing required fields" }), 400);
          }

          // Validate comment type
          const validTypes = ['personal', 'public', 'dev'];
          if (!validTypes.includes(comment_type)) {
            return corsResponse(request, JSON.stringify({ error: "Invalid comment_type" }), 400);
          }

          // Only devs can post 'dev' comments
          // 'public' comments allowed for all auth users (or restrict if needed)
          if (comment_type === 'dev' && !isDev) {
            return corsResponse(request, JSON.stringify({ error: "Forbidden: Dev access required" }), 403);
          }

          const id = crypto.randomUUID();
          const now = Date.now(); // SQLite expects timestamp usually, schema said DATETIME
          // Let's use ISO string for DATETIME or integer if schema used INTEGER. 
          // Schema used DATETIME DEFAULT CURRENT_TIMESTAMP.
          // We can pass ISO string or let DB handle it. Let's pass ISO.
          const timestamp = new Date().toISOString();

          await env.LOCKSMITH_DB.prepare(`
          INSERT INTO user_comments (id, user_id, context_type, context_id, comment_type, content, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(id, userId, context_type, context_id, comment_type, content, timestamp, timestamp).run();

          return corsResponse(request, JSON.stringify({ success: true, comment: { id, userId, content, timestamp } }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // DELETE /api/comments - Delete a comment
      if (path === "/api/comments" && request.method === "DELETE") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const userId = payload.sub as string;
          const isDev = !!payload.is_developer || isDeveloper(payload.email as string, env.DEV_EMAILS);

          const body: any = await request.json();
          const { id } = body;

          if (!id) return corsResponse(request, JSON.stringify({ error: "Missing id" }), 400);

          // Fetch comment to check ownership
          const comment = await env.LOCKSMITH_DB.prepare("SELECT user_id FROM user_comments WHERE id = ?").bind(id).first<any>();

          if (!comment) return corsResponse(request, JSON.stringify({ error: "Not found" }), 404);

          // Allow delete if owner OR developer
          if (comment.user_id !== userId && !isDev) {
            return corsResponse(request, JSON.stringify({ error: "Forbidden" }), 403);
          }

          await env.LOCKSMITH_DB.prepare("DELETE FROM user_comments WHERE id = ?").bind(id).run();

          return corsResponse(request, JSON.stringify({ success: true, id }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }


      // ==============================================
      // ACTIVITY TRACKING & ADMIN PANEL
      // ==============================================

      // Log user activity from frontend (Allows anonymous visitors)
      if (path === "/api/activity/log" && request.method === "POST") {
        try {
          const body: any = await request.json();
          const { action, details, visitorId } = body;

          if (!action) return corsResponse(request, JSON.stringify({ error: "Missing action" }), 400);

          let userId = visitorId ? `guest:${visitorId}` : "anonymous";

          // Try to get authenticated user - use getSessionToken which checks both Bearer token AND cookies
          const sessionToken = getSessionToken(request);
          if (sessionToken) {
            try {
              const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
              if (payload && payload.sub) {
                userId = payload.sub as string;
              }
            } catch (e) { /* ignore invalid token, keep visitorId */ }
          }

          await env.LOCKSMITH_DB.prepare(
            "INSERT INTO user_activity (user_id, action, details, user_agent, created_at) VALUES (?, ?, ?, ?, ?)"
          ).bind(
            userId,
            action,
            details ? JSON.stringify(details) : null,
            request.headers.get("User-Agent"),
            Date.now()
          ).run();

          return corsResponse(request, JSON.stringify({ success: true }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // Batch log user activity (performance optimization)
      if (path === "/api/activity/batch" && request.method === "POST") {
        try {
          const body: any = await request.json();
          const { logs, visitorId, user_email } = body;

          if (!Array.isArray(logs) || logs.length === 0) {
            return corsResponse(request, JSON.stringify({ success: true, count: 0 }));
          }

          let userId = visitorId ? `guest:${visitorId}` : "anonymous";

          // Try to get authenticated user - use getSessionToken which checks both Bearer token AND cookies
          const sessionToken = getSessionToken(request);
          if (sessionToken) {
            try {
              const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
              if (payload && payload.sub) {
                userId = payload.sub as string;
              }
            } catch (e) { /* ignore invalid token, keep visitorId */ }
          }

          const userAgent = request.headers.get("User-Agent");
          const stmt = env.LOCKSMITH_DB.prepare(
            "INSERT INTO user_activity (user_id, action, details, user_agent, created_at) VALUES (?, ?, ?, ?, ?)"
          );

          const batch = logs.slice(0, 50).map((log: any) => stmt.bind(
            userId,
            log.action,
            log.details ? JSON.stringify(log.details) : null,
            userAgent,
            log.timestamp || Date.now()
          ));

          if (batch.length > 0) {
            await env.LOCKSMITH_DB.batch(batch);
          }

          return corsResponse(request, JSON.stringify({ success: true, count: batch.length }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // Admin: Get all users (developer only)
      if (path === "/api/admin/users") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          // Check developer access
          const userIsDev = payload.is_developer || isDeveloper(payload.email as string, env.DEV_EMAILS);
          if (!userIsDev) return corsResponse(request, JSON.stringify({ error: "Forbidden" }), 403);

          // Get all users with activity count and last activity
          const users = await env.LOCKSMITH_DB.prepare(`
          SELECT 
            u.id,
            u.email,
            u.name,
            u.picture,
            u.is_pro,
            u.is_developer,
            u.created_at,
            COUNT(a.id) as activity_count,
            MAX(a.created_at) as last_activity
          FROM users u
          LEFT JOIN user_activity a ON u.id = a.user_id
          GROUP BY u.id
          ORDER BY u.created_at DESC
        `).all();

          return corsResponse(request, JSON.stringify({ users: users.results || [] }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // Admin: Get activity log (developer only)
      if (path === "/api/admin/activity") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          // Check developer access
          const userIsDev = payload.is_developer || isDeveloper(payload.email as string, env.DEV_EMAILS);
          if (!userIsDev) return corsResponse(request, JSON.stringify({ error: "Forbidden" }), 403);

          const limit = Math.min(parseInt(url.searchParams.get("limit") || "100", 10), 500);
          const userId = url.searchParams.get("userId"); // Optional filter

          let whereClause = "";
          const params: (string | number)[] = [];

          if (userId) {
            whereClause = "WHERE a.user_id = ?";
            params.push(userId);
          }

          const activity = await env.LOCKSMITH_DB.prepare(`
          SELECT 
            a.id,
            a.user_id,
            a.action,
            a.details,
            a.user_agent,
            a.created_at,
            u.name as user_name,
            u.email as user_email
          FROM user_activity a
          LEFT JOIN users u ON a.user_id = u.id
          ${whereClause}
          ORDER BY a.created_at DESC
          LIMIT ?
        `).bind(...params, limit).all();

          return corsResponse(request, JSON.stringify({ activity: activity.results || [] }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // Admin: Get analytics stats (developer only)
      if (path === "/api/admin/stats") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const userIsDev = payload.is_developer || isDeveloper(payload.email as string, env.DEV_EMAILS);
          if (!userIsDev) return corsResponse(request, JSON.stringify({ error: "Forbidden" }), 403);

          // 1. Top Searches (Detailed breakdown)
          const topSearches = await env.LOCKSMITH_DB.prepare(`
          SELECT json_extract(details, '$.query') as query, COUNT(*) as count
          FROM user_activity
          WHERE action = 'search' AND details LIKE '%"query"%'
          GROUP BY query
          ORDER BY count DESC
          LIMIT 10
        `).all();

          // 2. Top Clicked Links (Detailed breakdown)
          const topClicks = await env.LOCKSMITH_DB.prepare(`
          SELECT json_extract(details, '$.url') as url, COUNT(*) as count
          FROM user_activity
          WHERE action = 'click_affiliate' AND details LIKE '%"url"%'
          GROUP BY url
          ORDER BY count DESC
          LIMIT 10
        `).all();

          // 3. Global Totals (The Source of Truth)
          const globalTotals = await env.LOCKSMITH_DB.prepare(`
          SELECT 
            SUM(CASE WHEN action = 'search' THEN 1 ELSE 0 END) as searches,
            SUM(CASE WHEN action = 'click_affiliate' THEN 1 ELSE 0 END) as clicks,
            SUM(CASE WHEN action = 'vin_lookup' THEN 1 ELSE 0 END) as vin_lookups
          FROM user_activity
        `).first<any>();

          // 4. User Growth (New users in last 7 days)
          const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
          const growthStats = await env.LOCKSMITH_DB.prepare(`
          SELECT COUNT(*) as new_users
          FROM users
          WHERE created_at > ?
        `).bind(sevenDaysAgo).first<any>();

          // 5. Visitor Stats (Last 30 days)
          const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
          const visitorStats = await env.LOCKSMITH_DB.prepare(`
          SELECT 
            COUNT(DISTINCT user_id) as active_users,
            COUNT(*) as total_events
          FROM user_activity
          WHERE created_at > ?
        `).bind(thirtyDaysAgo).first<any>();

          return corsResponse(request, JSON.stringify({
            top_searches: topSearches.results || [],
            top_clicks: topClicks.results || [], // This uses 'click_affiliate', we should standardize
            global_totals: globalTotals,
            user_growth: growthStats?.new_users || 0,
            visitor_stats: visitorStats
          }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // Admin: Intelligence - Inventory Aggregation
      if (path === "/api/admin/intelligence/inventory") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const userIsDev = payload.is_developer || isDeveloper(payload.email as string, env.DEV_EMAILS);
          if (!userIsDev) return corsResponse(request, JSON.stringify({ error: "Forbidden" }), 403);

          // Get top stocked items
          const topStocked = await env.LOCKSMITH_DB.prepare(`
            SELECT 
              item_key,
              type,
              COUNT(DISTINCT user_id) as user_count,
              SUM(qty) as total_qty
            FROM inventory
            WHERE qty > 0
            GROUP BY item_key, type
            ORDER BY user_count DESC, total_qty DESC
            LIMIT 50
          `).all();

          return corsResponse(request, JSON.stringify({ items: topStocked.results || [] }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // Admin: Intelligence - Subscriptions
      if (path === "/api/admin/intelligence/subscriptions") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const userIsDev = payload.is_developer || isDeveloper(payload.email as string, env.DEV_EMAILS);
          if (!userIsDev) return corsResponse(request, JSON.stringify({ error: "Forbidden" }), 403);

          // Get top subscriptions directly from JSON data
          // Note: SQLite JSON extraction syntax
          const subscriptions = await env.LOCKSMITH_DB.prepare(`
            SELECT 
              json_extract(data, '$.name') as tool_name,
              COUNT(DISTINCT user_id) as subscriber_count
            FROM user_tool_subscriptions
            GROUP BY tool_name
            ORDER BY subscriber_count DESC
            LIMIT 20
          `).all();

          return corsResponse(request, JSON.stringify({ subscriptions: subscriptions.results || [] }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // Admin: Intelligence - Advanced Click Tracking
      if (path === "/api/admin/intelligence/clicks") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const userIsDev = payload.is_developer || isDeveloper(payload.email as string, env.DEV_EMAILS);
          if (!userIsDev) return corsResponse(request, JSON.stringify({ error: "Forbidden" }), 403);

          // Get detailed click stats
          // Aggregating both 'affiliate_click' and 'click_affiliate' to cover legacy/current mix
          const clicks = await env.LOCKSMITH_DB.prepare(`
            SELECT 
              json_extract(details, '$.term') as term,
              json_extract(details, '$.fcc_id') as fcc_id,
              json_extract(details, '$.type') as click_type,
              COUNT(*) as count,
              COUNT(DISTINCT user_id) as distinct_users
            FROM user_activity
            WHERE action IN ('affiliate_click', 'click_affiliate')
            GROUP BY term, fcc_id, click_type
            ORDER BY count DESC
            LIMIT 50
          `).all();

          return corsResponse(request, JSON.stringify({ clicks: clicks.results || [] }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }



      // Admin: Get Cloudflare Analytics (developer only)
      if (path === "/api/admin/cloudflare") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, JSON.stringify({ error: "Unauthorized" }), 401);

          const userIsDev = payload.is_developer || isDeveloper(payload.email as string, env.DEV_EMAILS);
          if (!userIsDev) return corsResponse(request, JSON.stringify({ error: "Forbidden" }), 403);

          // Check if API credentials are configured
          if (!env.CF_ANALYTICS_TOKEN || !env.CF_ZONE_ID || !env.CF_AUTH_EMAIL) {
            return corsResponse(request, JSON.stringify({
              error: "not_configured",
              message: "Cloudflare Analytics not configured. Add CF_ANALYTICS_TOKEN, CF_ZONE_ID, and CF_AUTH_EMAIL secrets."
            }), 200);
          }

          // Query Cloudflare Analytics API (GraphQL) - Expanded for multi-persona dashboard
          const now = new Date();
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          const today = now.toISOString().split('T')[0];

          // Expanded query with geo, device, browser, status codes AND adaptive groups for deep dive
          const graphqlQuery = `
          query {
            viewer {
              zones(filter: { zoneTag: "${env.CF_ZONE_ID}" }) {
                httpRequests1dGroups(
                  limit: 7
                  filter: { date_geq: "${sevenDaysAgo}", date_leq: "${today}" }
                  orderBy: [date_ASC]
                ) {
                  dimensions { date }
                  sum {
                    requests
                    bytes
                    cachedBytes
                    pageViews
                    threats
                    countryMap { clientCountryAlpha2 requests bytes }
                    browserMap { uaBrowserFamily requests pageViews }
                    clientDeviceTypeMap { clientDeviceType requests }
                    responseStatusMap { edgeResponseStatus requests }
                    contentTypeMap { edgeResponseContentTypeName requests bytes }
                  }
                  uniq { uniques }
                }
                
                topPaths: httpRequestsAdaptiveGroups(
                  limit: 15
                  filter: { date_geq: "${sevenDaysAgo}" }
                  orderBy: [count_DESC]
                ) {
                  count
                  dimensions { clientRequestPath }
                }
                
                topReferrers: httpRequestsAdaptiveGroups(
                  limit: 10
                  filter: { date_geq: "${sevenDaysAgo}", clientRefererHost_neq: "" }
                  orderBy: [count_DESC]
                ) {
                  count
                  dimensions { clientRefererHost }
                }
                
                securityEvents: firewallEventsAdaptiveGroups(
                  limit: 10
                  filter: { datetime_geq: "${sevenDaysAgo}T00:00:00Z" }
                  orderBy: [count_DESC]
                ) {
                  count
                  dimensions { action source }
                }
              }
            }
          }
        `;

          const cfResponse = await fetch("https://api.cloudflare.com/client/v4/graphql", {
            method: "POST",
            headers: {
              "X-Auth-Key": env.CF_ANALYTICS_TOKEN,
              "X-Auth-Email": env.CF_AUTH_EMAIL,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ query: graphqlQuery })
          });

          if (!cfResponse.ok) {
            const errorText = await cfResponse.text();
            console.error("Cloudflare API error:", errorText);
            return corsResponse(request, JSON.stringify({ error: "Cloudflare API error" }), 500);
          }

          const cfData: any = await cfResponse.json();
          const zones = cfData?.data?.viewer?.zones || [];
          const httpData = zones[0]?.httpRequests1dGroups || [];

          // Aggregate stats
          let last24h = { visitors: 0, requests: 0, bytes: 0, cachedBytes: 0, threats: 0 };
          let last7d = { visitors: 0, requests: 0, bytes: 0, cachedBytes: 0, threats: 0 };
          const dailyData: any[] = [];

          // Aggregated breakdown data (7-day totals)
          const countries: Record<string, { requests: number; bytes: number }> = {};
          const browsers: Record<string, { requests: number; pageViews: number }> = {};
          const devices: Record<string, number> = {};
          const statusCodes: Record<string, number> = {};
          const contentTypes: Record<string, { requests: number; bytes: number }> = {};

          httpData.forEach((day: any, index: number) => {
            const stats = {
              date: day.dimensions?.date,
              visitors: day.uniq?.uniques || 0,
              requests: day.sum?.requests || 0,
              bytes: day.sum?.bytes || 0,
              cachedBytes: day.sum?.cachedBytes || 0,
              threats: day.sum?.threats || 0
            };
            dailyData.push(stats);

            // Accumulate 7-day totals
            last7d.visitors += stats.visitors;
            last7d.requests += stats.requests;
            last7d.bytes += stats.bytes;
            last7d.cachedBytes += stats.cachedBytes;
            last7d.threats += stats.threats;

            // Last day is 24h stats
            if (index === httpData.length - 1) {
              last24h = stats;
            }

            // Aggregate country data
            (day.sum?.countryMap || []).forEach((c: any) => {
              const cc = c.clientCountryAlpha2 || 'XX';
              if (!countries[cc]) countries[cc] = { requests: 0, bytes: 0 };
              countries[cc].requests += c.requests || 0;
              countries[cc].bytes += c.bytes || 0;
            });

            // Aggregate browser data
            (day.sum?.browserMap || []).forEach((b: any) => {
              const browser = b.uaBrowserFamily || 'Unknown';
              if (!browsers[browser]) browsers[browser] = { requests: 0, pageViews: 0 };
              browsers[browser].requests += b.requests || 0;
              browsers[browser].pageViews += b.pageViews || 0;
            });

            // Aggregate device data
            (day.sum?.clientDeviceTypeMap || []).forEach((d: any) => {
              const device = d.clientDeviceType || 'unknown';
              devices[device] = (devices[device] || 0) + (d.requests || 0);
            });

            // Aggregate status codes
            (day.sum?.responseStatusMap || []).forEach((s: any) => {
              const status = String(s.edgeResponseStatus || 0);
              statusCodes[status] = (statusCodes[status] || 0) + (s.requests || 0);
            });

            // Aggregate content types
            (day.sum?.contentTypeMap || []).forEach((ct: any) => {
              const type = ct.edgeResponseContentTypeName || 'other';
              if (!contentTypes[type]) contentTypes[type] = { requests: 0, bytes: 0 };
              contentTypes[type].requests += ct.requests || 0;
              contentTypes[type].bytes += ct.bytes || 0;
            });
          });

          // Calculate cache hit rate
          const cacheRate24h = last24h.bytes > 0 ? ((last24h.cachedBytes / last24h.bytes) * 100).toFixed(1) : "0.0";
          const cacheRate7d = last7d.bytes > 0 ? ((last7d.cachedBytes / last7d.bytes) * 100).toFixed(1) : "0.0";

          // Calculate error rates (4xx + 5xx)
          let totalRequests = 0;
          let errorRequests = 0;
          Object.entries(statusCodes).forEach(([code, count]) => {
            totalRequests += count;
            if (code.startsWith('4') || code.startsWith('5')) {
              errorRequests += count;
            }
          });
          const errorRate = totalRequests > 0 ? ((errorRequests / totalRequests) * 100).toFixed(2) : "0.00";

          // Sort and limit breakdowns (top 10)
          const topCountries = Object.entries(countries)
            .sort((a, b) => b[1].requests - a[1].requests)
            .slice(0, 10)
            .map(([code, data]) => ({ country: code, ...data }));

          const topBrowsers = Object.entries(browsers)
            .sort((a, b) => b[1].requests - a[1].requests)
            .slice(0, 8)
            .map(([name, data]) => ({ browser: name, ...data }));

          const deviceBreakdown = Object.entries(devices)
            .sort((a, b) => b[1] - a[1])
            .map(([type, requests]) => ({ device: type, requests }));

          // Group status codes by category
          const statusGroups = { '2xx': 0, '3xx': 0, '4xx': 0, '5xx': 0 };
          Object.entries(statusCodes).forEach(([code, count]) => {
            if (code.startsWith('2')) statusGroups['2xx'] += count;
            else if (code.startsWith('3')) statusGroups['3xx'] += count;
            else if (code.startsWith('4')) statusGroups['4xx'] += count;
            else if (code.startsWith('5')) statusGroups['5xx'] += count;
          });

          // Process Deep Dive Data (Adaptive Groups)
          const topPaths = (zones[0]?.topPaths || []).map((p: any) => ({
            path: p.dimensions?.clientRequestPath || 'unknown',
            count: p.count
          }));

          const topReferrers = (zones[0]?.topReferrers || []).map((r: any) => ({
            referrer: r.dimensions?.clientRefererHost || 'direct/unknown',
            count: r.count
          }));

          const securityDetails = (zones[0]?.securityEvents || []).map((s: any) => ({
            action: s.dimensions?.action || 'unknown',
            source: s.dimensions?.source || 'unknown',
            count: s.count
          }));

          return corsResponse(request, JSON.stringify({
            last24h: {
              visitors: last24h.visitors,
              requests: last24h.requests,
              bytesServed: last24h.bytes,
              cacheRate: cacheRate24h,
              threats: last24h.threats
            },
            last7d: {
              visitors: last7d.visitors,
              requests: last7d.requests,
              bytesServed: last7d.bytes,
              cacheRate: cacheRate7d,
              threats: last7d.threats
            },
            daily: dailyData,
            // Tech metrics
            tech: {
              errorRate,
              cacheRate: cacheRate7d,
              statusGroups,
              statusCodes,
              securityEvents: securityDetails
            },
            // Marketing metrics
            marketing: {
              topCountries,
              topBrowsers,
              devices: deviceBreakdown,
              topPaths,
              topReferrers
            }
          }));
        } catch (err: any) {
          console.error("Cloudflare analytics error:", err);
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
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
          return corsResponse(request, JSON.stringify({ insight: latest }), 200);
        } catch (e: any) {
          return corsResponse(request, JSON.stringify({ error: e.message }), 500);
        }
      }

      // 8. Test AI (Manual Trigger)
      if (path === "/api/test-ai") {
        const result = await runAIAnalysis(env);
        return corsResponse(request, JSON.stringify(result), 200);
      }

      // 9. Subscription AI Analysis Proxy
      if (path === "/api/ai/analyze-subscriptions" && request.method === "POST") {
        try {
          // Authenticate user
          const cookieHeader = request.headers.get("Cookie");
          const sessionToken = cookieHeader?.split(';').find(c => c.trim().startsWith('session='))?.split('=')[1];
          if (!sessionToken) return corsResponse(request, "Unauthorized", 401);
          const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
          if (!payload || !payload.sub) return corsResponse(request, "Unauthorized", 401);

          const body: any = await request.json();
          const { subscriptions } = body;

          if (!subscriptions || !Array.isArray(subscriptions)) {
            return corsResponse(request, JSON.stringify({ error: "Missing or invalid subscriptions data" }), 400);
          }

          const prompt = `You are a locksmith business consultant analyzing subscription costs. Here are the current subscriptions:

${JSON.stringify(subscriptions, null, 2)}

Provide a brief analysis (3-4 paragraphs max) covering:
1. Total monthly burn rate and ROI opportunities
2. Any overlapping subscriptions that could be consolidated
3. Upcoming renewals requiring attention
4. Recommendations for optimizing the toolkit

Be specific about dollar amounts and which subscriptions to focus on.`;

          const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer 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`,
              "HTTP-Referer": "https://eurokeys.app",
              "X-Title": "Euro Keys Subscription Analyzer",
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              "model": "deepseek/deepseek-v3.2",
              "messages": [
                { "role": "system", "content": "You are a professional automotive locksmith business consultant. Your goal is to optimize costs and maximize ROI for tool subscriptions." },
                { "role": "user", "content": prompt }
              ],
              "max_tokens": 1000
            })
          });

          if (!aiResponse.ok) {
            throw new Error(`OpenRouter API error: ${aiResponse.status}`);
          }

          const aiData: any = await aiResponse.json();
          const analysis = aiData.choices?.[0]?.message?.content;

          return corsResponse(request, JSON.stringify({ analysis }), 200);

        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
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

          const fields = url.searchParams.get("fields")?.split(",").map(f => f.trim()) || [];
          const allowedFields = [
            "id", "make", "model", "year_start", "year_end", "key_type", "keyway", "fcc_id", "chip",
            "frequency", "immobilizer_system", "lishi_tool", "oem_part_number", "aftermarket_part",
            "buttons", "battery", "programming_method", "pin_required", "notes",
            "confidence_score", "source_name", "source_url", "mechanical_spec", "spaces", "depths",
            "code_series", "ignition_retainer", "service_notes_pro", "key_blank_refs",
            "key_type_display", "key_image_url", "has_image"
          ];

          // Data query with optional field filtering
          let selectClause = `
            v.id, v.make, v.model,
            v.year_start, v.year_end, v.key_type, v.keyway, v.fcc_id, v.chip,
            v.frequency, v.immobilizer_system, v.immobilizer_system_specific,
            v.mcu_mask, v.chassis_code,
            v.lishi_tool, v.oem_part_number, v.aftermarket_part,
            v.buttons, v.battery, v.programming_method,
            v.pin_required, v.notes,
            v.confidence_score, v.source_name, v.source_url,
            v.mechanical_spec, v.spaces, v.depths, v.code_series, v.ignition_retainer, v.service_notes_pro,
            v.key_blank_refs, v.key_type_display, v.key_image_url, v.has_image,
            cr.technology as chip_technology, cr.bits as chip_bits, cr.description as chip_description
        `;

          if (fields.length > 0) {
            const validFields = fields.filter(f => allowedFields.includes(f));
            if (validFields.length > 0) {
              selectClause = validFields.map(f => `v.${f}`).join(", ");
            }
          }

          const dataSql = `
          SELECT 
            ${selectClause}
          FROM vehicles v
          LEFT JOIN chip_registry cr ON LOWER(v.chip) = LOWER(cr.chip_type)
          ${whereClause}
          ORDER BY v.make, v.model, v.year_start
          LIMIT ? OFFSET ?
        `;
          const dataResult = await env.LOCKSMITH_DB.prepare(dataSql).bind(...params, limit, offset).all();

          // ---------------------------------------------------------
          // CAMARO REBUILD: Fetch Alerts & Guides if specific vehicle
          // ---------------------------------------------------------
          let alerts: any[] = [];
          let guide: any = null;
          let pearls: any[] = [];
          let vehicleTables: any[] = [];

          // Only fetch extras if we are narrowing down to a specific vehicle context
          // Check if make/model/year match a single context
          if (make && model && year) {
            const y = parseInt(year, 10);
            if (!Number.isNaN(y)) {
              // 1. Fetch Alerts
              const alertsResult = await env.LOCKSMITH_DB.prepare(`
                SELECT * FROM locksmith_alerts 
                WHERE LOWER(make) = ? AND LOWER(model) = ? 
                AND ? BETWEEN year_start AND year_end
                ORDER BY CASE alert_level 
                  WHEN 'CRITICAL' THEN 1 
                  WHEN 'WARNING' THEN 2 
                  WHEN 'INFO' THEN 3 
                  ELSE 4 END
              `).bind(make, model, y).all();
              alerts = alertsResult.results || [];

              // 2. Fetch Programming Guide
              guide = await env.LOCKSMITH_DB.prepare(`
                SELECT * FROM programming_guides
                WHERE LOWER(make) = ? AND LOWER(model) = ?
                AND ? BETWEEN year_start AND year_end
                LIMIT 1
              `).bind(make, model, y).first();

              // 3. Fetch Programming Pearls (New Research Automation)
              // Use LIKE for model matching to handle variations like "Escalade (K2XL) Forensic"
              // Include pearl_type and is_critical for frontend section distribution
              const modelPattern = `${model.toLowerCase()}%`;
              const pearlsResult = await env.LOCKSMITH_DB.prepare(`
                SELECT id, vehicle_key, make, model, year_start, year_end, 
                       pearl_title, pearl_content, pearl_type, is_critical, reference_url,
                       target_section, target_step, image_url, dev_flag,
                       display_order, source_doc, created_at,
                       COALESCE((SELECT SUM(vote) FROM pearl_votes pv WHERE pv.pearl_id = vehicle_pearls.id), 0) as score,
                       COALESCE((SELECT COUNT(*) FROM pearl_comments pc WHERE pc.pearl_id = vehicle_pearls.id), 0) as comment_count
                FROM vehicle_pearls
                WHERE LOWER(make) = ? AND LOWER(model) LIKE ?
                AND ? BETWEEN year_start AND year_end
                AND LENGTH(pearl_content) > 80
                AND pearl_title NOT LIKE 'http%'
                AND pearl_content NOT LIKE '%accessed December%'
                AND pearl_content NOT LIKE '%accessed January%'
                GROUP BY SUBSTR(pearl_content, 1, 100)
                ORDER BY 
                  CASE target_section
                    WHEN 'voltage' THEN 1
                    WHEN 'fcc' THEN 2
                    WHEN 'akl_procedure' THEN 3
                    WHEN 'add_key_procedure' THEN 4
                    WHEN 'mechanical' THEN 5
                    WHEN 'troubleshooting' THEN 6
                    ELSE 10 
                  END,
                  is_critical DESC,
                  target_step ASC,
                  display_order ASC
              `).bind(make.toLowerCase(), modelPattern, y).all();
              pearls = pearlsResult.results || [];

              // 4. Fetch Reference Tables from vehicle_tables
              const tablesResult = await env.LOCKSMITH_DB.prepare(`
                SELECT id, table_key, make, model, year_start, year_end, 
                       table_title, site_section, headers, rows, row_count, source_doc
                FROM vehicle_tables
                WHERE (LOWER(make) = ? OR make = 'General')
                AND (LOWER(model) LIKE ? OR model = 'All Models' OR model = 'General')
                AND (year_start IS NULL OR (year_start <= ? AND year_end >= ?))
                ORDER BY table_title
                LIMIT 20
              `).bind(make.toLowerCase(), modelPattern, y, y).all();

              // Parse JSON columns for tables
              vehicleTables = (tablesResult.results || []).map((t: any) => ({
                ...t,
                headers: JSON.parse(t.headers || '[]'),
                rows: JSON.parse(t.rows || '[]')
              }));
            }
          }

          return new Response(JSON.stringify({
            count: dataResult.results?.length || 0,
            total,
            rows: dataResult.results || [],
            alerts,
            guide,
            pearls: pearls || [],
            tables: vehicleTables // Include tables in the response
          }), {
            headers: {
              "content-type": "application/json",
              "Cache-Control": "public, max-age=300, stale-while-revalidate=60",
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "GET, OPTIONS",
              "Access-Control-Allow-Headers": "*",
            },
          });
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message || "failed to load data" }), 500);
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

          // ---------------------------------------------------------
          // CAMARO REBUILD: Fetch Alerts & Guides if specific vehicle
          // ---------------------------------------------------------
          let alerts: any[] = [];
          let guide: any = null;

          if (make && model && year) {
            const y = parseInt(year, 10);
            if (!Number.isNaN(y)) {
              // 1. Fetch Alerts
              const alertsResult = await env.LOCKSMITH_DB.prepare(`
                SELECT * FROM locksmith_alerts 
                WHERE LOWER(make) = ? AND LOWER(model) = ? 
                AND ? BETWEEN year_start AND year_end
                ORDER BY CASE alert_level 
                  WHEN 'CRITICAL' THEN 1 
                  WHEN 'WARNING' THEN 2 
                  WHEN 'INFO' THEN 3 
                  ELSE 4 END
              `).bind(make, model, y).all();
              alerts = alertsResult.results || [];

              // 2. Fetch Programming Guide
              guide = await env.LOCKSMITH_DB.prepare(`
                SELECT * FROM programming_guides
                WHERE LOWER(make) = ? AND LOWER(model) = ?
                AND ? BETWEEN year_start AND year_end
                ORDER BY created_at DESC LIMIT 1
              `).bind(make, model, y).first();
            }
          }

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
          return corsResponse(request,
            JSON.stringify({ error: err.message || "failed to load immobilizers" }),
            500
          );
        }
      }

      // ==============================================
      // VEHICLE COMMENTS API (LEGACY - DEPRECATED)
      // NOTE: These endpoints use the old schema with is_approved column.
      // The primary comment system uses /api/vehicle-comments endpoints (line ~1509).
      // Keeping for backwards compatibility but should not be used for new development.
      // ==============================================

      // GET comments for a vehicle (LEGACY)
      if (path === "/api/comments" && request.method === "GET") {
        try {
          const vehicleKey = url.searchParams.get("vehicle_key");
          if (!vehicleKey) {
            return corsResponse(request, JSON.stringify({ error: "vehicle_key required" }), 400);
          }

          const comments = await env.LOCKSMITH_DB.prepare(`
            SELECT id, vehicle_key, user_id, user_name, content, upvotes, downvotes, created_at
            FROM vehicle_comments 
            WHERE vehicle_key = ? AND is_approved = 1
            ORDER BY (upvotes - downvotes) DESC, created_at DESC
            LIMIT 50
          `).bind(vehicleKey).all();

          return corsResponse(request, JSON.stringify({
            vehicle_key: vehicleKey,
            comments: comments.results || []
          }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // POST new comment
      if (path === "/api/comments" && request.method === "POST") {
        try {
          const body: any = await request.json();
          const { vehicle_key, content, user_name } = body;

          if (!vehicle_key || !content) {
            return corsResponse(request, JSON.stringify({ error: "vehicle_key and content required" }), 400);
          }

          if (content.length > 500) {
            return corsResponse(request, JSON.stringify({ error: "Comment too long (max 500 chars)" }), 400);
          }

          // Get user from session if logged in
          let userId = null;
          let displayName = user_name || "Anonymous";
          const token = getSessionToken(request);
          if (token) {
            try {
              const payload = await verifyInternalToken(token, env.JWT_SECRET);
              userId = payload.sub;
              displayName = payload.name || displayName;
            } catch (_) { }
          }

          const result = await env.LOCKSMITH_DB.prepare(`
            INSERT INTO vehicle_comments (vehicle_key, user_id, user_name, content)
            VALUES (?, ?, ?, ?)
          `).bind(vehicle_key, userId, displayName, content).run();

          return corsResponse(request, JSON.stringify({
            success: true,
            comment_id: result.meta.last_row_id,
            message: "Comment added"
          }), 201);
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // POST vote on comment
      if (path.match(/^\/api\/comments\/\d+\/vote$/) && request.method === "POST") {
        try {
          const commentId = parseInt(path.split("/")[3]);
          const body: any = await request.json();
          const voteType = body.vote_type; // 'up' or 'down'

          if (!['up', 'down'].includes(voteType)) {
            return corsResponse(request, JSON.stringify({ error: "vote_type must be 'up' or 'down'" }), 400);
          }

          // Require login to vote
          const token = getSessionToken(request);
          if (!token) {
            return corsResponse(request, JSON.stringify({ error: "Login required to vote" }), 401);
          }

          let userId;
          try {
            const payload = await verifyInternalToken(token, env.JWT_SECRET);
            userId = payload.sub;
          } catch (_) {
            return corsResponse(request, JSON.stringify({ error: "Invalid session" }), 401);
          }

          // Check if already voted
          const existingVote = await env.LOCKSMITH_DB.prepare(`
            SELECT vote_type FROM comment_votes WHERE comment_id = ? AND user_id = ?
          `).bind(commentId, userId).first<any>();

          if (existingVote) {
            if (existingVote.vote_type === voteType) {
              // Remove vote (toggle off)
              await env.LOCKSMITH_DB.prepare(`
                DELETE FROM comment_votes WHERE comment_id = ? AND user_id = ?
              `).bind(commentId, userId).run();

              // Update count
              const column = voteType === 'up' ? 'upvotes' : 'downvotes';
              await env.LOCKSMITH_DB.prepare(`
                UPDATE vehicle_comments SET ${column} = ${column} - 1 WHERE id = ?
              `).bind(commentId).run();

              return corsResponse(request, JSON.stringify({ success: true, action: "removed" }));
            } else {
              // Change vote
              const oldColumn = existingVote.vote_type === 'up' ? 'upvotes' : 'downvotes';
              const newColumn = voteType === 'up' ? 'upvotes' : 'downvotes';

              await env.LOCKSMITH_DB.prepare(`
                UPDATE comment_votes SET vote_type = ? WHERE comment_id = ? AND user_id = ?
              `).bind(voteType, commentId, userId).run();

              await env.LOCKSMITH_DB.prepare(`
                UPDATE vehicle_comments SET ${oldColumn} = ${oldColumn} - 1, ${newColumn} = ${newColumn} + 1 WHERE id = ?
              `).bind(commentId).run();

              return corsResponse(request, JSON.stringify({ success: true, action: "changed" }));
            }
          }

          // New vote
          await env.LOCKSMITH_DB.prepare(`
            INSERT INTO comment_votes (comment_id, user_id, vote_type) VALUES (?, ?, ?)
          `).bind(commentId, userId, voteType).run();

          const column = voteType === 'up' ? 'upvotes' : 'downvotes';
          await env.LOCKSMITH_DB.prepare(`
            UPDATE vehicle_comments SET ${column} = ${column} + 1 WHERE id = ?
          `).bind(commentId).run();

          return corsResponse(request, JSON.stringify({ success: true, action: "voted" }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // DELETE comment (owner or admin only)
      if (path.match(/^\/api\/comments\/\d+$/) && request.method === "DELETE") {
        try {
          const commentId = parseInt(path.split("/")[3]);

          const token = getSessionToken(request);
          if (!token) {
            return corsResponse(request, JSON.stringify({ error: "Login required" }), 401);
          }

          let userId, userEmail;
          try {
            const payload = await verifyInternalToken(token, env.JWT_SECRET);
            userId = payload.sub;
            userEmail = payload.email;
          } catch (_) {
            return corsResponse(request, JSON.stringify({ error: "Invalid session" }), 401);
          }

          // Check ownership or admin
          const comment = await env.LOCKSMITH_DB.prepare(`
            SELECT user_id FROM vehicle_comments WHERE id = ?
          `).bind(commentId).first<any>();

          if (!comment) {
            return corsResponse(request, JSON.stringify({ error: "Comment not found" }), 404);
          }

          const isOwner = comment.user_id === userId;
          const isAdmin = isDeveloper(userEmail || "", env.DEV_EMAILS);

          if (!isOwner && !isAdmin) {
            return corsResponse(request, JSON.stringify({ error: "Not authorized" }), 403);
          }

          await env.LOCKSMITH_DB.prepare(`DELETE FROM vehicle_comments WHERE id = ?`).bind(commentId).run();

          return corsResponse(request, JSON.stringify({ success: true, deleted: commentId }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // ==============================================
      // PEARL VOTING & COMMENTS API
      // ==============================================

      // POST vote on pearl
      if (path.match(/^\/api\/pearls\/\d+\/vote$/) && request.method === "POST") {
        try {
          const pearlId = parseInt(path.split("/")[3]);
          const body: any = await request.json();
          const vote = body.vote; // 1 = upvote, -1 = downvote

          if (![1, -1].includes(vote)) {
            return corsResponse(request, JSON.stringify({ error: "vote must be 1 or -1" }), 400);
          }

          // Require login to vote
          const token = getSessionToken(request);
          if (!token) {
            return corsResponse(request, JSON.stringify({ error: "Login required to vote" }), 401);
          }

          let userId: string;
          try {
            const payload = await verifyInternalToken(token, env.JWT_SECRET);
            if (!payload || !payload.sub) throw new Error("Invalid session");
            userId = payload.sub as string;
          } catch (_) {
            return corsResponse(request, JSON.stringify({ error: "Invalid session" }), 401);
          }

          // Check existing vote
          const existingVote = await env.LOCKSMITH_DB.prepare(`
            SELECT vote FROM pearl_votes WHERE pearl_id = ? AND user_id = ?
          `).bind(pearlId, userId).first<any>();

          if (existingVote) {
            if (existingVote.vote === vote) {
              // Remove vote (toggle off)
              await env.LOCKSMITH_DB.prepare(`
                DELETE FROM pearl_votes WHERE pearl_id = ? AND user_id = ?
              `).bind(pearlId, userId).run();
              return corsResponse(request, JSON.stringify({ success: true, action: "removed", userVote: 0 }));
            } else {
              // Change vote
              await env.LOCKSMITH_DB.prepare(`
                UPDATE pearl_votes SET vote = ? WHERE pearl_id = ? AND user_id = ?
              `).bind(vote, pearlId, userId).run();
              return corsResponse(request, JSON.stringify({ success: true, action: "changed", userVote: vote }));
            }
          }

          // New vote
          await env.LOCKSMITH_DB.prepare(`
            INSERT INTO pearl_votes (pearl_id, user_id, vote) VALUES (?, ?, ?)
          `).bind(pearlId, userId, vote).run();

          return corsResponse(request, JSON.stringify({ success: true, action: "voted", userVote: vote }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // GET pearl comments
      if (path.match(/^\/api\/pearls\/\d+\/comments$/) && request.method === "GET") {
        try {
          const pearlId = parseInt(path.split("/")[3]);
          const comments = await env.LOCKSMITH_DB.prepare(`
            SELECT id, pearl_id, user_id, username, content, created_at
            FROM pearl_comments 
            WHERE pearl_id = ?
            ORDER BY created_at DESC
            LIMIT 50
          `).bind(pearlId).all();

          return corsResponse(request, JSON.stringify({
            pearl_id: pearlId,
            comments: comments.results || []
          }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // POST pearl comment
      if (path.match(/^\/api\/pearls\/\d+\/comments$/) && request.method === "POST") {
        try {
          const pearlId = parseInt(path.split("/")[3]);
          const body: any = await request.json();
          const { content } = body;

          if (!content || content.length > 500) {
            return corsResponse(request, JSON.stringify({ error: "Content required (max 500 chars)" }), 400);
          }

          // Get user from session
          let userId = "anonymous";
          let username = "Anonymous";
          const token = getSessionToken(request);
          if (token) {
            try {
              const payload = await verifyInternalToken(token, env.JWT_SECRET);
              if (payload && payload.sub) {
                userId = payload.sub as string;
                username = (payload.name as string) || "User";
              }
            } catch (_) { }
          }

          const result = await env.LOCKSMITH_DB.prepare(`
            INSERT INTO pearl_comments (pearl_id, user_id, username, content) VALUES (?, ?, ?, ?)
          `).bind(pearlId, userId, username, content).run();

          return corsResponse(request, JSON.stringify({
            success: true,
            comment_id: result.meta.last_row_id,
            message: "Comment added"
          }), 201);
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // ==============================================
      // VEHICLE TABLES API - Reference tables extracted from dossiers
      // ==============================================
      if (path === "/api/tables" && request.method === "GET") {
        try {
          const make = url.searchParams.get("make")?.toLowerCase();
          const model = url.searchParams.get("model")?.toLowerCase();
          const year = url.searchParams.get("year");
          const section = url.searchParams.get("section");
          const limit = Math.min(parseInt(url.searchParams.get("limit") || "20", 10) || 20, 100);

          const conditions: string[] = [];
          const params: (string | number)[] = [];

          if (make) {
            conditions.push("(LOWER(make) = ? OR make = 'General' OR make = 'Stellantis')");
            params.push(make);
          }
          if (model) {
            conditions.push("(LOWER(model) LIKE ? OR model = 'All Models' OR model = 'General')");
            params.push(`%${model}%`);
          }
          if (year) {
            const y = parseInt(year, 10);
            if (!Number.isNaN(y)) {
              conditions.push("(year_start IS NULL OR (year_start <= ? AND year_end >= ?))");
              params.push(y, y);
            }
          }
          if (section) {
            conditions.push("site_section = ?");
            params.push(section);
          }

          const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

          const result = await env.LOCKSMITH_DB.prepare(`
            SELECT id, table_key, make, model, year_start, year_end, 
                   table_title, site_section, headers, rows, row_count, source_doc
            FROM vehicle_tables
            ${whereClause}
            ORDER BY table_title
            LIMIT ?
          `).bind(...params, limit).all();

          // Parse JSON columns
          const tables = (result.results || []).map((t: any) => ({
            ...t,
            headers: JSON.parse(t.headers || '[]'),
            rows: JSON.parse(t.rows || '[]')
          }));

          return corsResponse(request, JSON.stringify({
            count: tables.length,
            tables
          }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // ==============================================
      // VEHICLE YEAR PRODUCTS (AKS Aggregation)
      // ==============================================
      // Query the vehicle_year_products table which has pre-aggregated
      // FCC IDs, OEM parts, chips, etc. from American Key Supply data
      if (path === "/api/vyp") {
        try {
          const year = url.searchParams.get("year");
          const make = url.searchParams.get("make")?.toLowerCase() || "";
          const model = url.searchParams.get("model")?.toLowerCase() || "";
          const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10) || 50, 200);

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
            const y = parseInt(year, 10);
            if (!Number.isNaN(y)) {
              conditions.push("year = ?");
              params.push(y);
            }
          }

          const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

          const sql = `
            SELECT 
              make, model, year, product_count,
              item_numbers, fcc_ids, oem_parts, chips, product_types, driver_memories
            FROM vehicle_year_products
            ${whereClause}
            ORDER BY make, model, year
            LIMIT ?
          `;

          const result = await env.LOCKSMITH_DB.prepare(sql).bind(...params, limit).all();

          return corsResponse(request, JSON.stringify({
            source: "vehicle_year_products",
            count: result.results?.length || 0,
            results: result.results || []
          }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // ==============================================
      // VYP SUB-ROUTES - Makes/Models/Years from browse_catalog
      // ==============================================
      // Uses browse_catalog for clean, normalized makes/models/years
      // Extracted from aks_products_detail compatible_vehicles

      // GET /api/vyp/makes - Returns makes sorted by popularity (model count)
      // ?popular=true returns only top 27, otherwise returns all
      if (path === "/api/vyp/makes") {
        try {
          const popularOnly = url.searchParams.get("popular") === "true";

          // Get makes with model count for popularity sorting
          const sql = `
            SELECT make, COUNT(DISTINCT model) as model_count
            FROM aks_vehicles_by_year
            WHERE make IS NOT NULL
            GROUP BY make
            HAVING model_count >= 2
            ORDER BY model_count DESC, make ASC
          `;
          const result = await env.LOCKSMITH_DB.prepare(sql).all();

          // Filter out motorcycle-only makes (keeps automotive focus)
          const motorcycleOnlyMakes = new Set([
            'Aprilia', 'Beta', 'Buell', 'CAN-AM', 'Cagiva', 'Cimatti', 'Derbi',
            'Ducati', 'Fantic', 'Garelli', 'Gilera', 'Harley-Davidson', 'Husqvarna',
            'Indian', 'Italjet', 'KTM', 'Kawasaki', 'Kymco', 'MBK', 'MZ', 'MV Agusta',
            'Malaguti', 'Moto Guzzi', 'Norton', 'Piaggio', 'Polaris', 'Vespa',
            'Victory', 'Yamaha', 'Atala', 'Evinrude', 'Sea', 'Arctic Cat', 'Bombardier'
          ]);

          // Also filter obscure/non-consumer makes
          const obscureMakes = new Set([
            'American', 'Brockway', 'Golf', 'Vehicle', 'Misc Models',
            'Hino', 'IVECO', 'Navistar', 'Sterling', 'Studebaker'
          ]);

          let filteredResults = (result.results || []).filter((r: any) =>
            !motorcycleOnlyMakes.has(r.make) && !obscureMakes.has(r.make)
          );

          // Curated list of major automotive brands (priority order for locksmiths)
          const priorityMakes = [
            'Acura', 'Audi', 'BMW', 'Buick', 'Cadillac', 'Chevrolet', 'Chrysler',
            'Dodge', 'Fiat', 'Ford', 'GMC', 'Honda', 'Hyundai', 'Infiniti',
            'Jaguar', 'Jeep', 'Kia', 'Land Rover', 'Lexus', 'Lincoln', 'Mazda',
            'Mercedes', 'Mini', 'Mitsubishi', 'Nissan', 'Porsche', 'RAM', 'Subaru',
            'Tesla', 'Toyota', 'Volkswagen', 'Volvo'
          ];

          const allMakes = filteredResults.map((r: any) => r.make);

          // Popular = intersection of priority makes with available makes
          const popularMakes = priorityMakes.filter(m => allMakes.includes(m));

          // Sort alphabetically for display
          popularMakes.sort((a: string, b: string) => a.localeCompare(b));
          allMakes.sort((a: string, b: string) => a.localeCompare(b));

          return corsResponse(request, JSON.stringify({
            source: "aks_vehicles_by_year",
            popularCount: popularMakes.length,
            totalCount: allMakes.length,
            makes: popularOnly ? popularMakes : allMakes,
            popularMakes,  // Always include for client-side filtering
            hasMore: allMakes.length > popularMakes.length
          }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // GET /api/vyp/models?make=X - Returns models for a make from aks_vehicles_by_year (cleaner data)
      if (path === "/api/vyp/models") {
        try {
          const make = url.searchParams.get("make") || "";
          if (!make) {
            return corsResponse(request, JSON.stringify({ error: "make parameter required" }), 400);
          }

          // Get all models for this make from AKS data (already clean)
          const sql = `
            SELECT DISTINCT model, COUNT(DISTINCT year) as year_count
            FROM aks_vehicles_by_year
            WHERE LOWER(make) = LOWER(?)
            GROUP BY model
            ORDER BY model
          `;
          const result = await env.LOCKSMITH_DB.prepare(sql).bind(make).all();
          let models = (result.results || []).map((r: any) => r.model);

          // Query to get models with at least one year >= 2000 (modern models)
          const modernSql = `
            SELECT DISTINCT model
            FROM aks_vehicles_by_year
            WHERE LOWER(make) = LOWER(?)
            AND year >= 2000
          `;
          const modernResult = await env.LOCKSMITH_DB.prepare(modernSql).bind(make).all();
          const modernModelSet = new Set((modernResult.results || []).map((r: any) => r.model));

          // Universal filter: Remove motorcycle/watercraft models for all makes
          models = models.filter((model: string) =>
            !model.startsWith('(Motorcycle/Watercraft)')
          );

          // Filter out motorcycle models for BMW (clutters automotive locksmith browse)
          if (make.toLowerCase() === 'bmw') {
            const motorcyclePatterns = [
              /^F\d{3}/i,     // F650, F900, etc.
              /^G\d{3}/i,     // G650, etc.
              /^K\d{2,4}/i,   // K75, K100, K1100, K1200, etc.
              /^R\d{2,4}/i,   // R45, R65, R80, R90, R100, R1100, R1200, etc.
              /^S\d{4}/i,     // S1000RR, etc.
              /^C\d{3}/i,     // C650, etc.
            ];
            models = models.filter((model: string) =>
              !motorcyclePatterns.some(pattern => pattern.test(model))
            );
          }

          // EV model detection patterns
          const isEVModel = (make: string, model: string): boolean => {
            const makeLower = make.toLowerCase();
            const modelLower = model.toLowerCase();

            // Tesla is all EV
            if (makeLower === 'tesla') return true;

            // Polestar is all EV
            if (makeLower === 'polestar') return true;

            // Known EV model patterns
            const evPatterns = [
              /\bev\b/i,           // Contains "EV" as word (Bolt EV, Blazer EV)
              /\beuv\b/i,          // EUV (Bolt EUV)
              /\belectric/i,       // Contains "Electric"
              /\blightning\b/i,    // F-150 Lightning
              /\bmach-e\b/i,       // Mustang Mach-E
              /^i\d$/i,            // BMW i3, i4, i7, i8
              /^ix/i,              // BMW iX
              /\bvolt\b/i,         // Chevy Volt (PHEV but EV-ish)
              /\bioniq/i,          // Hyundai Ioniq
              /\bkona ev/i,        // Hyundai Kona EV
              /\bniro ev/i,        // Kia Niro EV
              /\bev6\b/i,          // Kia EV6
              /\be-tron/i,         // Audi e-tron
              /\bq4 e-tron/i,      // Audi Q4 e-tron
              /\bid\./i,           // VW ID.4, ID.Buzz
              /\bleaf\b/i,         // Nissan Leaf
              /\bariya\b/i,        // Nissan Ariya
              /\btaycan\b/i,       // Porsche Taycan
              /\beqs\b/i,          // Mercedes EQS
              /\beqe\b/i,          // Mercedes EQE
              /\beqb\b/i,          // Mercedes EQB
              /\blyriq\b/i,        // Cadillac Lyriq
              /\bhummer ev/i,      // GMC Hummer EV
              /\bsolterra\b/i,     // Subaru Solterra
              /\bbz4x\b/i,         // Toyota bZ4X
            ];

            return evPatterns.some(pattern => pattern.test(model));
          };

          // Merge model variants (G35 + G35 Coupe → G35 with variants indicator)
          // These are suffixes where the key system is typically identical to the base model
          const variantSuffixes = [
            // Body styles
            'Coupe', 'Sedan', 'Convertible', 'Wagon', 'Hatchback', 'Cab',
            // Trim levels
            'Sport', 'Sports', 'Touring', 'Limited', 'Premium', 'Base', 'SE', 'LE', 'XLE', 'XSE',
            // Drivetrain (same key system)
            'AWD', '4WD', '2WD', 'FWD', 'RWD', 'Quattro', 'xDrive', '4Matic',
            // Powertrain variants (same key system)
            'Hybrid', 'PHEV', 'Plug-In', 'EV', 'Diesel', 'Turbo', 'V6', 'V8',
            // Performance trims (Jeep/Dodge especially - same key system)
            'SRT', 'SRT8', 'Trackhawk', 'Hellcat', 'Demon', 'Scat Pack', 'R/T', 'GT',
            // Extended/size variants (same key system)  
            'L', 'XL', 'Long', 'Short',
            // Generation/platform suffixes (same key system within generation)
            'WK', 'WK2', 'WL', 'JK', 'JL', 'JT', 'KL', 'MK',
            // Luxury package variants
            'Sport Sedan', 'Gran Coupe', 'Gran Turismo',
            'Cross Country', 'Sportback', 'Avant', 'Allroad', 'Cabriolet', 'Convertible', 'Roadster', 'Coupe', 'Sedan', 'Wagon',
            // Common trim packages
            'Laredo', 'Overland', 'Summit', 'Trailhawk', 'High Altitude', 'Limited X',
            // Toyota performance/package variants (same key system)
            'TRD', 'TRD Pro', 'TRD Off-Road', 'TRD Sport', 'Trail', 'Nightshade',
            // Honda performance variants
            'Type R', 'Type-R', 'Si', 'Type S', 'Type-S',
            // Acura performance variants
            'A-Spec', 'Advance', 'Technology',
            // Volkswagen/Audi performance
            'R', 'GTI', 'GLI', 'R-Line', 'S-Line',
            // Hyundai/Kia performance
            'N', 'N Line', 'GT-Line',
            // Subaru performance
            'STI', 'WRX', 'XT',
            // Nissan performance
            'NISMO', 'SR', 'SV', 'SL', 'Platinum',
            // Mazda trims
            'Signature', 'Grand Touring', 'Carbon Edition',
            // Fleet/Police variants (same key system as civilian)
            'PPV', 'Police', 'Taxi', 'Fleet'
          ];

          // Hyphenated suffixes (like CTS-V, ATS-V) - checked separately
          const hyphenatedSuffixes = [
            '-V',     // Cadillac (CTS-V, ATS-V, CT5-V)
            '-S',     // Jaguar (F-Type S, XE-S)
            '-F',     // Lexus (IS-F, RC-F, GS-F)
          ];

          // Build a map of base model → variants
          const modelVariantMap = new Map<string, Set<string>>();
          const processedModels = new Set<string>();

          for (const model of models) {
            let baseModel = model;
            let foundVariant: string | null = null;

            // Check if this model ends with a variant suffix (space-separated)
            for (const suffix of variantSuffixes) {
              const pattern = new RegExp(`\\s+${suffix}$`, 'i');
              if (pattern.test(model)) {
                baseModel = model.replace(pattern, '').trim();
                foundVariant = suffix;
                break;
              }
            }

            // Also check hyphenated suffixes (like CTS-V → CTS)
            if (!foundVariant) {
              for (const suffix of hyphenatedSuffixes) {
                if (model.endsWith(suffix)) {
                  baseModel = model.slice(0, -suffix.length);
                  foundVariant = suffix;
                  break;
                }
              }
            }

            // Only merge if the base model also exists independently
            if (foundVariant && models.includes(baseModel)) {
              if (!modelVariantMap.has(baseModel)) {
                modelVariantMap.set(baseModel, new Set());
              }
              modelVariantMap.get(baseModel)!.add(foundVariant);
            } else if (!foundVariant) {
              // This is a base model or standalone model
              if (!modelVariantMap.has(model)) {
                modelVariantMap.set(model, new Set());
              }
            } else {
              // Variant without base model - keep as-is
              processedModels.add(model);
            }
          }

          // Build merged models list with indicators
          interface MergedModel {
            name: string;
            display: string;
            baseModel: string;
            variants: string[];
          }

          const mergedModels: MergedModel[] = [];

          for (const [baseModel, variants] of modelVariantMap) {
            const variantArray = Array.from(variants).sort();
            let display = baseModel;

            if (variantArray.length > 0) {
              if (variantArray.length === 1) {
                display = `${baseModel} (incl. ${variantArray[0]})`;
              } else if (variantArray.length <= 3) {
                display = `${baseModel} (incl. ${variantArray.join(', ')})`;
              } else {
                display = `${baseModel} (+${variantArray.length} variants)`;
              }
            }

            mergedModels.push({
              name: baseModel,
              display,
              baseModel,
              variants: variantArray
            });
          }

          // Add standalone models (variants without base)
          for (const model of processedModels) {
            mergedModels.push({
              name: model,
              display: model,
              baseModel: model,
              variants: []
            });
          }

          // Sort merged models alphabetically
          mergedModels.sort((a, b) => a.name.localeCompare(b.name));

          // Categorize models (using original list for EV detection)
          const evModels = models.filter((m: string) => isEVModel(make, m));
          const mainModels = models.filter((m: string) => !isEVModel(make, m));

          // Categorize by era (models that have at least one year >= 2000)
          const modernModels = models.filter((m: string) => modernModelSet.has(m));
          const classicOnlyModels = models.filter((m: string) => !modernModelSet.has(m));

          return corsResponse(request, JSON.stringify({
            source: "aks_vehicles_by_year",
            make,
            count: models.length,
            models,              // Original full list (for search/validation)
            mergedModels,        // Consolidated list with variant indicators (for browse display)
            evModels,
            mainModels,
            hasEV: evModels.length > 0,
            modernModels,        // Models with at least one year >= 2000
            classicOnlyModels,   // Models with only pre-2000 years
            hasClassicOnly: classicOnlyModels.length > 0
          }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // GET /api/vyp/years?make=X&model=Y - Returns years for a make/model from aks_vehicles_by_year
      if (path === "/api/vyp/years") {
        try {
          const make = url.searchParams.get("make") || "";
          const model = url.searchParams.get("model") || "";
          if (!make || !model) {
            return corsResponse(request, JSON.stringify({ error: "make and model parameters required" }), 400);
          }

          const sql = `
            SELECT DISTINCT year
            FROM aks_vehicles_by_year
            WHERE LOWER(make) = LOWER(?)
            AND LOWER(model) = LOWER(?)
            ORDER BY year DESC
          `;
          const result = await env.LOCKSMITH_DB.prepare(sql).bind(make, model).all();
          const years = (result.results || []).map((r: any) => r.year);

          return corsResponse(request, JSON.stringify({
            source: "aks_vehicles_by_year",
            make,
            model,
            count: years.length,
            years
          }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // ==============================================
      // GLOBAL MODEL SEARCH - Search models by name across all makes
      // ==============================================
      // GET /api/search/models?q=speed - Searches model names with canonical consolidation
      if (path === "/api/search/models") {
        try {
          const query = url.searchParams.get("q") || "";
          if (!query || query.length < 2) {
            return corsResponse(request, JSON.stringify({ error: "q parameter required (min 2 chars)" }), 400);
          }

          const searchPattern = `%${query.toLowerCase()}%`;

          // First: Find all matching models in browse_catalog
          const browseSQL = `
            SELECT 
              make,
              model,
              MIN(year) as year_start,
              MAX(year) as year_end,
              COUNT(*) as year_count
            FROM browse_catalog
            WHERE LOWER(model) LIKE ? 
            GROUP BY make, model
            ORDER BY model, make
            LIMIT 30
          `;
          const browseResult = await env.LOCKSMITH_DB.prepare(browseSQL).bind(searchPattern).all();
          const rawResults = (browseResult.results || []) as any[];

          // Second: Get canonical mappings
          const canonicalSQL = `
            SELECT make, canonical_model, aliases, year_start, year_end 
            FROM canonical_models 
            WHERE canonical_model != '_MAKE_'
          `;
          const canonicalResult = await env.LOCKSMITH_DB.prepare(canonicalSQL).all();
          const canonicals = (canonicalResult.results || []) as any[];

          // Build a lookup: variant -> canonical mapping
          const variantToCanonical = new Map<string, { make: string; canonical: string }>();
          for (const c of canonicals) {
            const key = `${c.make}|${c.canonical_model}`.toLowerCase();
            variantToCanonical.set(key, { make: c.make, canonical: c.canonical_model });

            // Parse aliases JSON
            try {
              const aliases = JSON.parse(c.aliases || '[]');
              for (const alias of aliases) {
                const aliasKey = `${c.make}|${alias}`.toLowerCase();
                variantToCanonical.set(aliasKey, { make: c.make, canonical: c.canonical_model });
              }
            } catch (e) { }
          }

          // Consolidate results by canonical name
          const consolidated = new Map<string, {
            make: string;
            model: string;
            year_start: number;
            year_end: number;
            year_count: number;
            variants: string[];
          }>();

          for (const r of rawResults) {
            const lookupKey = `${r.make}|${r.model}`.toLowerCase();
            const canonical = variantToCanonical.get(lookupKey);

            const displayModel = canonical ? canonical.canonical : r.model;
            const displayMake = canonical ? canonical.make : r.make;
            const consolidatedKey = `${displayMake}|${displayModel}`;

            if (consolidated.has(consolidatedKey)) {
              const existing = consolidated.get(consolidatedKey)!;
              existing.year_start = Math.min(existing.year_start, r.year_start);
              existing.year_end = Math.max(existing.year_end, r.year_end);
              existing.year_count += r.year_count;
              if (r.model !== displayModel && !existing.variants.includes(r.model)) {
                existing.variants.push(r.model);
              }
            } else {
              consolidated.set(consolidatedKey, {
                make: displayMake,
                model: displayModel,
                year_start: r.year_start,
                year_end: r.year_end,
                year_count: r.year_count,
                variants: r.model !== displayModel ? [r.model] : []
              });
            }
          }

          const results = Array.from(consolidated.values()).map(r => ({
            make: r.make,
            model: r.model,
            years: r.year_start === r.year_end
              ? `${r.year_start}`
              : `${r.year_start}-${r.year_end}`,
            year_count: r.year_count,
            variants: r.variants.length > 0 ? r.variants : undefined
          }));

          return corsResponse(request, JSON.stringify({
            query,
            count: results.length,
            consolidated: true,
            results
          }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // ==============================================
      // AKS PRODUCT DETAIL (battery, chips, etc)
      // ==============================================
      // Query individual products from aks_products_detail by item_number
      // Supports year filtering and consensus computation
      if (path === "/api/aks-product") {
        try {
          const itemNumbers = url.searchParams.get("items")?.split(",") || [];
          const yearParam = url.searchParams.get("year");
          const year = yearParam ? parseInt(yearParam, 10) : null;

          if (itemNumbers.length === 0) {
            return corsResponse(request, JSON.stringify({ error: "items parameter required (comma-separated)" }), 400);
          }

          const placeholders = itemNumbers.map(() => "?").join(",");

          // Build query with optional year filtering
          let sql = `
            SELECT 
              item_number, title, ez_number, model_num,
              fcc_id, ic, chip, frequency, battery, keyway,
              buttons, oem_part_numbers, condition, price, url,
              year_start, year_end
            FROM aks_products_detail
            WHERE item_number IN (${placeholders})
          `;

          // Add year filter if specified
          if (year && !Number.isNaN(year)) {
            sql += ` AND (year_start IS NULL OR year_start <= ${year}) AND (year_end IS NULL OR year_end >= ${year})`;
          }

          const result = await env.LOCKSMITH_DB.prepare(sql).bind(...itemNumbers).all();
          const products = (result.results || []) as any[];

          // Compute consensus for key fields
          const computeConsensus = (field: string) => {
            const values: { [key: string]: { count: number; items: string[] } } = {};
            for (const p of products) {
              const val = p[field];
              if (val && val !== "null" && val !== "N/A") {
                if (!values[val]) values[val] = { count: 0, items: [] };
                values[val].count++;
                values[val].items.push(p.item_number);
              }
            }

            // Find mode (most common value)
            let mode = null;
            let maxCount = 0;
            const outliers: { value: string; items: string[] }[] = [];

            for (const [val, data] of Object.entries(values)) {
              if (data.count > maxCount) {
                // Previous mode becomes outlier
                if (mode !== null) {
                  outliers.push({ value: mode, items: values[mode].items });
                }
                mode = val;
                maxCount = data.count;
              } else {
                // This value is an outlier
                outliers.push({ value: val, items: data.items });
              }
            }

            return { value: mode, count: maxCount, outliers };
          };

          const consensus = {
            battery: computeConsensus("battery"),
            keyway: computeConsensus("keyway"),
            chip: computeConsensus("chip"),
            frequency: computeConsensus("frequency")
          };

          return corsResponse(request, JSON.stringify({
            source: "aks_products_detail",
            year_filter: year,
            count: products.length,
            consensus,
            products
          }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // ==============================================
      // AKS VEHICLE PAGES (lishi, mechanical specs)
      // ==============================================
      // Query aks_vehicle_pages for lishi, code_series, etc.
      if (path === "/api/aks-vp") {
        try {
          const year = url.searchParams.get("year");
          const make = url.searchParams.get("make")?.toLowerCase() || "";
          const model = url.searchParams.get("model")?.toLowerCase() || "";

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
            const y = parseInt(year, 10);
            if (!Number.isNaN(y)) {
              conditions.push("year_start <= ? AND year_end >= ?");
              params.push(y, y);
            }
          }

          const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

          const sql = `
            SELECT 
              id, make, model, year_start, year_end,
              code_series, mechanical_key, transponder_key, lishi,
              spaces, depths, macs, image_url
            FROM aks_vehicle_pages
            ${whereClause}
            ORDER BY make, model, year_start
            LIMIT 50
          `;

          const result = await env.LOCKSMITH_DB.prepare(sql).bind(...params).all();

          return corsResponse(request, JSON.stringify({
            source: "aks_vehicle_pages",
            count: result.results?.length || 0,
            results: result.results || []
          }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // ==============================================
      // R2 IMAGE PROXY - Serve images from R2 bucket
      // ==============================================
      // Proxies requests to /api/r2/{key} to the R2 bucket
      if (path.startsWith("/api/r2/")) {
        try {
          const r2Key = decodeURIComponent(path.slice(8)); // Remove "/api/r2/"
          if (!r2Key) {
            return corsResponse(request, JSON.stringify({ error: "Missing image key" }), 400);
          }

          const object = await env.ASSETS_BUCKET.get(r2Key);
          if (!object) {
            return corsResponse(request, JSON.stringify({ error: "Image not found", key: r2Key }), 404);
          }

          // Determine content type from extension
          const ext = r2Key.split('.').pop()?.toLowerCase() || 'png';
          const contentTypes: Record<string, string> = {
            'png': 'image/png',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'gif': 'image/gif',
            'webp': 'image/webp',
            'svg': 'image/svg+xml'
          };
          const contentType = contentTypes[ext] || 'application/octet-stream';

          // Return image with caching headers
          const headers = new Headers();
          headers.set("Content-Type", contentType);
          headers.set("Cache-Control", "public, max-age=31536000"); // 1 year
          headers.set("Access-Control-Allow-Origin", "*");

          return new Response(object.body, { status: 200, headers });
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: "R2 proxy error", message: err?.message }), 500);
        }
      }

      // ==============================================
      // IMAGE METADATA (infographics, references)
      // ==============================================
      // Query image_metadata for infographics by vehicle/section/tags
      // Supports cross-pollinated queries (global-b applies to all GM vehicles)
      if (path === "/api/images") {
        try {
          const make = url.searchParams.get("make")?.toLowerCase() || "";
          const model = url.searchParams.get("model")?.toLowerCase() || "";
          const section = url.searchParams.get("section") || "";
          const tag = url.searchParams.get("tag") || "";
          const imageType = url.searchParams.get("type") || "";
          const crossPollinate = url.searchParams.get("cross") !== "false"; // default true

          const conditions: string[] = [];
          const params: string[] = [];

          // Cross-pollination: for GM makes, also include 'gm', 'global-b', 'hu100'
          const gmMakes = ['chevrolet', 'gmc', 'cadillac', 'buick'];
          const isGM = gmMakes.includes(make);

          if (make && crossPollinate && isGM) {
            // For GM vehicles, search by make OR related tags
            conditions.push("(LOWER(make) = ? OR LOWER(make) = 'gm' OR tags LIKE '%global-b%' OR tags LIKE '%hu100%' OR tags LIKE '%can-fd%')");
            params.push(make);
          } else if (make) {
            conditions.push("LOWER(make) = ?");
            params.push(make);
          }
          if (model) {
            conditions.push("LOWER(model) LIKE ?");
            params.push(`%${model}%`);
          }
          if (section) {
            conditions.push("section = ?");
            params.push(section);
          }
          if (tag) {
            conditions.push("tags LIKE ?");
            params.push(`%${tag}%`);
          }
          if (imageType) {
            conditions.push("image_type = ?");
            params.push(imageType);
          }

          const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

          const sql = `
            SELECT 
              id, filename, r2_key, image_type,
              make, model, year_start, year_end,
              section, tags, pearl_id,
              description, alt_text
            FROM image_metadata
            ${whereClause}
            ORDER BY 
              CASE WHEN LOWER(make) = '${make}' THEN 0 ELSE 1 END,
              make, model, section
            LIMIT 50
          `;

          const result = await env.LOCKSMITH_DB.prepare(sql).bind(...params).all();

          // Build full URLs for images using Worker proxy
          const WORKER_BASE = url.origin; // e.g. https://euro-keys.jeremy-samuels17.workers.dev
          const images = (result.results || []).map((img: any) => ({
            ...img,
            tags: img.tags ? JSON.parse(img.tags) : [],
            // Use Worker proxy for R2 images
            url: img.r2_key
              ? `${WORKER_BASE}/api/r2/${encodeURIComponent(img.r2_key)}`
              : `/assets/key_reference/${img.filename}`
          }));

          return corsResponse(request, JSON.stringify({
            source: "image_metadata",
            count: images.length,
            crossPollinated: crossPollinate && isGM,
            images
          }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // ==============================================
      // REFINED PEARLS (Technical Intelligence)
      // ==============================================
      // Query vehicle_pearls for technical insights by vehicle
      // These are the LLM-extracted pearls from dossier research
      if (path === "/api/pearls") {
        try {
          const make = url.searchParams.get("make")?.toLowerCase() || "";
          const model = url.searchParams.get("model")?.toLowerCase() || "";
          const year = url.searchParams.get("year") || "";
          const category = url.searchParams.get("category") || "";
          const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 100);

          const conditions: string[] = [];
          const params: (string | number)[] = [];

          if (make) {
            conditions.push("LOWER(make) = ?");
            params.push(make);
          }
          if (model) {
            // Exact model match only - General is handled by make filter
            // Exclude garbage titles in model field
            conditions.push("(LOWER(model) = ? OR model = 'General') AND model NOT LIKE '%Analysis%' AND model NOT LIKE '%Architecture%' AND model NOT LIKE '%Evolution%' AND model NOT LIKE '%Technical%'");
            params.push(model.toLowerCase());
          } else {
            // No model specified - still exclude garbage
            conditions.push("model NOT LIKE '%Analysis%' AND model NOT LIKE '%Architecture%' AND model NOT LIKE '%Evolution%' AND model NOT LIKE '%Technical%'");
          }


          if (year) {
            const y = parseInt(year, 10);
            if (!Number.isNaN(y)) {
              conditions.push("? BETWEEN year_start AND year_end");
              params.push(y);
            }
          }
          if (category) {
            conditions.push("pearl_type = ?");
            params.push(category);
          }

          // Quality filters - exclude garbage
          conditions.push("LENGTH(pearl_content) > 80");
          conditions.push("pearl_title NOT LIKE 'http%'");
          conditions.push("pearl_content NOT LIKE '%accessed December%'");
          conditions.push("pearl_content NOT LIKE '%accessed January%'");
          // Exclude garbage titles - short FCC fragments, generic fragments
          conditions.push("LENGTH(pearl_title) > 20");
          conditions.push("(pearl_title NOT LIKE 'FCC ID: %' OR LENGTH(pearl_title) > 25)");

          const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

          const sql = `
            SELECT 
              id, vehicle_key, pearl_title as title, pearl_content as content, 
              pearl_type as category, make, model,
              year_start, year_end, is_critical, target_section, target_step,
              reference_url, image_url, dev_flag, display_order, source_doc,
              created_at,
              CASE is_critical WHEN 1 THEN 'critical' ELSE 'info' END as risk,
              COALESCE((SELECT SUM(vote) FROM pearl_votes pv WHERE pv.pearl_id = vehicle_pearls.id), 0) as score,
              COALESCE((SELECT COUNT(*) FROM pearl_comments pc WHERE pc.pearl_id = vehicle_pearls.id), 0) as comment_count
            FROM vehicle_pearls
            ${whereClause}
            GROUP BY make, model, SUBSTR(pearl_content, 1, 100)
            ORDER BY 
              is_critical DESC,
              CASE target_section
                WHEN 'voltage' THEN 1
                WHEN 'fcc' THEN 2
                WHEN 'akl_procedure' THEN 3
                WHEN 'add_key_procedure' THEN 4
                WHEN 'mechanical' THEN 5
                WHEN 'troubleshooting' THEN 6
                ELSE 10 
              END,
              display_order ASC
            LIMIT ?
          `;

          const result = await env.LOCKSMITH_DB.prepare(sql).bind(...params, limit).all();

          // Map to expected frontend format
          const pearls = (result.results || []).map((p: any) => ({
            ...p,
            tags: p.target_section ? [p.target_section] : [],
            display_tags: p.target_section ? JSON.stringify([p.target_section]) : '[]'
          }));

          return corsResponse(request, JSON.stringify({
            source: "vehicle_pearls",
            count: pearls.length,
            pearls
          }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // ==============================================
      // PEARL ADMIN: Update Pearl (PUT /api/pearls/:id)
      // ==============================================
      // Dev: instant update with version history
      // Community: creates pending edit for approval
      if (path.match(/^\/api\/pearls\/[^/]+$/) && request.method === "PUT") {
        try {
          const pearlId = path.split('/').pop();
          if (!pearlId) {
            return corsResponse(request, JSON.stringify({ error: "Pearl ID required" }), 400);
          }

          // Auth required
          const sessionToken = getSessionToken(request);
          if (!sessionToken) {
            return corsResponse(request, JSON.stringify({ error: "Authentication required" }), 401);
          }

          const payload = await verifySession(sessionToken, env.SESSION_SECRET);
          if (!payload?.email) {
            return corsResponse(request, JSON.stringify({ error: "Invalid session" }), 401);
          }

          const userEmail = payload.email as string;
          const userIsDev = payload.is_developer || isDeveloper(userEmail, env.DEV_EMAILS);

          const body = await request.json() as any;
          const { content, category, make, model, year_start, year_end, risk, tags, display_tags, section, subsection, display_order, edit_reason } = body;

          // Fetch current pearl state for version history
          const currentPearl = await env.LOCKSMITH_DB.prepare(
            "SELECT * FROM refined_pearls WHERE id = ?"
          ).bind(pearlId).first();

          if (!currentPearl) {
            return corsResponse(request, JSON.stringify({ error: "Pearl not found" }), 404);
          }

          if (userIsDev) {
            // DEV: Instant update with version tracking
            // 1. Get next version number
            const versionResult = await env.LOCKSMITH_DB.prepare(
              "SELECT COALESCE(MAX(version_number), 0) + 1 as next_version FROM pearl_versions WHERE pearl_id = ?"
            ).bind(pearlId).first<{ next_version: number }>();
            const nextVersion = versionResult?.next_version || 1;

            // 2. Save current state to version history
            await env.LOCKSMITH_DB.prepare(`
              INSERT INTO pearl_versions (pearl_id, version_number, content, action, category, make, model, year_start, year_end, risk, tags, display_tags, section, subsection, display_order, edited_by, edit_reason, edit_type)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'update')
            `).bind(
              pearlId, nextVersion,
              currentPearl.content, currentPearl.action, currentPearl.category,
              currentPearl.make, currentPearl.model, currentPearl.year_start, currentPearl.year_end,
              currentPearl.risk, currentPearl.tags, currentPearl.display_tags,
              currentPearl.section || 'general', currentPearl.subsection, currentPearl.display_order || 0,
              userEmail, edit_reason || 'Direct edit'
            ).run();

            // 3. Update pearl with new values (only provided fields)
            const updates: string[] = [];
            const updateParams: any[] = [];

            if (content !== undefined) { updates.push("content = ?"); updateParams.push(content); }
            if (category !== undefined) { updates.push("category = ?"); updateParams.push(category); }
            if (make !== undefined) { updates.push("make = ?"); updateParams.push(make); }
            if (model !== undefined) { updates.push("model = ?"); updateParams.push(model); }
            if (year_start !== undefined) { updates.push("year_start = ?"); updateParams.push(year_start); }
            if (year_end !== undefined) { updates.push("year_end = ?"); updateParams.push(year_end); }
            if (risk !== undefined) { updates.push("risk = ?"); updateParams.push(risk); }
            if (tags !== undefined) { updates.push("tags = ?"); updateParams.push(typeof tags === 'string' ? tags : JSON.stringify(tags)); }
            if (display_tags !== undefined) { updates.push("display_tags = ?"); updateParams.push(typeof display_tags === 'string' ? display_tags : JSON.stringify(display_tags)); }
            if (section !== undefined) { updates.push("section = ?"); updateParams.push(section); }
            if (subsection !== undefined) { updates.push("subsection = ?"); updateParams.push(subsection); }
            if (display_order !== undefined) { updates.push("display_order = ?"); updateParams.push(display_order); }

            updates.push("last_edited_by = ?"); updateParams.push(userEmail);
            updates.push("last_edited_at = ?"); updateParams.push(new Date().toISOString());

            if (updates.length > 2) { // More than just the edited_by/at fields
              updateParams.push(pearlId);
              await env.LOCKSMITH_DB.prepare(
                `UPDATE refined_pearls SET ${updates.join(", ")} WHERE id = ?`
              ).bind(...updateParams).run();
            }

            return corsResponse(request, JSON.stringify({
              success: true,
              message: "Pearl updated",
              version: nextVersion,
              pearl_id: pearlId
            }));
          } else {
            // COMMUNITY: Create pending edit for approval
            await env.LOCKSMITH_DB.prepare(`
              INSERT INTO pearl_edits (pearl_id, content, action, category, make, model, year_start, year_end, risk, tags, display_tags, section, subsection, display_order, submitted_by, edit_reason, status)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
            `).bind(
              pearlId,
              content || null, body.action || null, category || null,
              make || null, model || null, year_start || null, year_end || null,
              risk || null, tags ? (typeof tags === 'string' ? tags : JSON.stringify(tags)) : null,
              display_tags ? (typeof display_tags === 'string' ? display_tags : JSON.stringify(display_tags)) : null,
              section || null, subsection || null, display_order || null,
              userEmail, edit_reason || 'Community edit'
            ).run();

            return corsResponse(request, JSON.stringify({
              success: true,
              message: "Edit submitted for approval",
              pearl_id: pearlId
            }));
          }
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // ==============================================
      // PEARL ADMIN: Reorder Pearl (POST /api/pearls/:id/reorder)
      // ==============================================
      // Dev only: Update display_order for drag-and-drop
      if (path.match(/^\/api\/pearls\/[^/]+\/reorder$/) && request.method === "POST") {
        try {
          const pearlId = path.split('/')[3];

          const sessionToken = getSessionToken(request);
          if (!sessionToken) {
            return corsResponse(request, JSON.stringify({ error: "Authentication required" }), 401);
          }

          const payload = await verifySession(sessionToken, env.SESSION_SECRET);
          if (!payload?.email) {
            return corsResponse(request, JSON.stringify({ error: "Invalid session" }), 401);
          }

          const userEmail = payload.email as string;
          const userIsDev = payload.is_developer || isDeveloper(userEmail, env.DEV_EMAILS);

          if (!userIsDev) {
            return corsResponse(request, JSON.stringify({ error: "Developer access required" }), 403);
          }

          const body = await request.json() as any;
          const { section, subsection, display_order } = body;

          if (display_order === undefined) {
            return corsResponse(request, JSON.stringify({ error: "display_order required" }), 400);
          }

          // Update pearl position
          const updates = ["display_order = ?", "last_edited_by = ?", "last_edited_at = ?"];
          const params: any[] = [display_order, userEmail, new Date().toISOString()];

          if (section !== undefined) { updates.push("section = ?"); params.push(section); }
          if (subsection !== undefined) { updates.push("subsection = ?"); params.push(subsection); }

          params.push(pearlId);
          await env.LOCKSMITH_DB.prepare(
            `UPDATE refined_pearls SET ${updates.join(", ")} WHERE id = ?`
          ).bind(...params).run();

          // Log reorder in version history
          await env.LOCKSMITH_DB.prepare(`
            INSERT INTO pearl_versions (pearl_id, version_number, section, subsection, display_order, edited_by, edit_reason, edit_type)
            SELECT ?, COALESCE(MAX(version_number), 0) + 1, ?, ?, ?, ?, 'Reordered via drag-and-drop', 'reorder'
            FROM pearl_versions WHERE pearl_id = ?
          `).bind(pearlId, section, subsection, display_order, userEmail, pearlId).run();

          return corsResponse(request, JSON.stringify({
            success: true,
            message: "Pearl reordered",
            pearl_id: pearlId,
            display_order
          }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // ==============================================
      // PEARL RELATED: Get Related Pearls (GET /api/pearls/:id/related)
      // ==============================================
      // Returns related pearls based on pearl_relationships table
      if (path.match(/^\/api\/pearls\/[^/]+\/related$/) && request.method === "GET") {
        try {
          const pearlId = path.split('/')[3];
          const limit = Math.min(parseInt(url.searchParams.get("limit") || "10", 10), 50);

          // Fetch related pearls with their content preview
          const related = await env.LOCKSMITH_DB.prepare(`
            SELECT 
              pr.related_pearl_id as id,
              pr.relationship_type,
              pr.strength,
              rp.content,
              rp.make,
              rp.model,
              rp.category,
              rp.risk
            FROM pearl_relationships pr
            JOIN refined_pearls rp ON pr.related_pearl_id = rp.id
            WHERE pr.pearl_id = ?
              AND rp.duplicate_of IS NULL
            ORDER BY pr.strength DESC, pr.relationship_type
            LIMIT ?
          `).bind(pearlId, limit).all();

          const results = (related.results || []).map((r: any) => ({
            id: r.id,
            relationship: r.relationship_type,
            strength: r.strength,
            preview: r.content ? r.content.substring(0, 150) + '...' : '',
            make: r.make,
            model: r.model,
            category: r.category,
            risk: r.risk
          }));

          return corsResponse(request, JSON.stringify({
            pearl_id: pearlId,
            count: results.length,
            related: results
          }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // ==============================================
      // PEARL ADMIN: Get Version History (GET /api/pearls/:id/history)
      // ==============================================
      if (path.match(/^\/api\/pearls\/[^/]+\/history$/) && request.method === "GET") {
        try {
          const pearlId = path.split('/')[3];

          const sessionToken = getSessionToken(request);
          if (!sessionToken) {
            return corsResponse(request, JSON.stringify({ error: "Authentication required" }), 401);
          }

          const payload = await verifySession(sessionToken, env.SESSION_SECRET);
          if (!payload?.email) {
            return corsResponse(request, JSON.stringify({ error: "Invalid session" }), 401);
          }

          // Fetch current pearl
          const currentPearl = await env.LOCKSMITH_DB.prepare(
            "SELECT * FROM refined_pearls WHERE id = ?"
          ).bind(pearlId).first();

          if (!currentPearl) {
            return corsResponse(request, JSON.stringify({ error: "Pearl not found" }), 404);
          }

          // Fetch version history
          const versions = await env.LOCKSMITH_DB.prepare(`
            SELECT * FROM pearl_versions WHERE pearl_id = ? ORDER BY version_number DESC LIMIT 50
          `).bind(pearlId).all();

          return corsResponse(request, JSON.stringify({
            pearl_id: pearlId,
            current: currentPearl,
            versions: versions.results || [],
            version_count: versions.results?.length || 0
          }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // ==============================================
      // PEARL ADMIN: List Pending Edits (GET /api/pearls/pending)
      // ==============================================
      // Dev only: List all pending community edits
      if (path === "/api/pearls/pending" && request.method === "GET") {
        try {
          const sessionToken = getSessionToken(request);
          if (!sessionToken) {
            return corsResponse(request, JSON.stringify({ error: "Authentication required" }), 401);
          }

          const payload = await verifySession(sessionToken, env.SESSION_SECRET);
          if (!payload?.email) {
            return corsResponse(request, JSON.stringify({ error: "Invalid session" }), 401);
          }

          const userEmail = payload.email as string;
          const userIsDev = payload.is_developer || isDeveloper(userEmail, env.DEV_EMAILS);

          if (!userIsDev) {
            return corsResponse(request, JSON.stringify({ error: "Developer access required" }), 403);
          }

          const pendingEdits = await env.LOCKSMITH_DB.prepare(`
            SELECT pe.*, rp.content as current_content, rp.make as current_make, rp.model as current_model
            FROM pearl_edits pe
            LEFT JOIN refined_pearls rp ON pe.pearl_id = rp.id
            WHERE pe.status = 'pending'
            ORDER BY pe.submitted_at DESC
            LIMIT 100
          `).all();

          return corsResponse(request, JSON.stringify({
            pending_count: pendingEdits.results?.length || 0,
            edits: pendingEdits.results || []
          }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // ==============================================
      // PEARL ADMIN: Approve Pending Edit (POST /api/pearls/pending/:id/approve)
      // ==============================================
      if (path.match(/^\/api\/pearls\/pending\/\d+\/approve$/) && request.method === "POST") {
        try {
          const editId = path.split('/')[4];

          const sessionToken = getSessionToken(request);
          if (!sessionToken) {
            return corsResponse(request, JSON.stringify({ error: "Authentication required" }), 401);
          }

          const payload = await verifySession(sessionToken, env.SESSION_SECRET);
          if (!payload?.email) {
            return corsResponse(request, JSON.stringify({ error: "Invalid session" }), 401);
          }

          const userEmail = payload.email as string;
          const userIsDev = payload.is_developer || isDeveloper(userEmail, env.DEV_EMAILS);

          if (!userIsDev) {
            return corsResponse(request, JSON.stringify({ error: "Developer access required" }), 403);
          }

          // Fetch the pending edit
          const edit = await env.LOCKSMITH_DB.prepare(
            "SELECT * FROM pearl_edits WHERE id = ? AND status = 'pending'"
          ).bind(editId).first<any>();

          if (!edit) {
            return corsResponse(request, JSON.stringify({ error: "Pending edit not found" }), 404);
          }

          // Fetch current pearl for version history
          const currentPearl = await env.LOCKSMITH_DB.prepare(
            "SELECT * FROM refined_pearls WHERE id = ?"
          ).bind(edit.pearl_id).first<any>();

          if (!currentPearl) {
            return corsResponse(request, JSON.stringify({ error: "Pearl not found" }), 404);
          }

          // Save current state to version history
          const versionResult = await env.LOCKSMITH_DB.prepare(
            "SELECT COALESCE(MAX(version_number), 0) + 1 as next_version FROM pearl_versions WHERE pearl_id = ?"
          ).bind(edit.pearl_id).first<{ next_version: number }>();
          const nextVersion = versionResult?.next_version || 1;

          await env.LOCKSMITH_DB.prepare(`
            INSERT INTO pearl_versions (pearl_id, version_number, content, action, category, make, model, year_start, year_end, risk, tags, display_tags, section, subsection, display_order, edited_by, edit_reason, edit_type)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'update')
          `).bind(
            edit.pearl_id, nextVersion,
            currentPearl.content, currentPearl.action, currentPearl.category,
            currentPearl.make, currentPearl.model, currentPearl.year_start, currentPearl.year_end,
            currentPearl.risk, currentPearl.tags, currentPearl.display_tags,
            currentPearl.section || 'general', currentPearl.subsection, currentPearl.display_order || 0,
            edit.submitted_by, `Community edit approved by ${userEmail}`
          ).run();

          // Apply the edit to the pearl (only non-null fields)
          const updates: string[] = [];
          const updateParams: any[] = [];

          if (edit.content !== null) { updates.push("content = ?"); updateParams.push(edit.content); }
          if (edit.category !== null) { updates.push("category = ?"); updateParams.push(edit.category); }
          if (edit.make !== null) { updates.push("make = ?"); updateParams.push(edit.make); }
          if (edit.model !== null) { updates.push("model = ?"); updateParams.push(edit.model); }
          if (edit.year_start !== null) { updates.push("year_start = ?"); updateParams.push(edit.year_start); }
          if (edit.year_end !== null) { updates.push("year_end = ?"); updateParams.push(edit.year_end); }
          if (edit.risk !== null) { updates.push("risk = ?"); updateParams.push(edit.risk); }
          if (edit.tags !== null) { updates.push("tags = ?"); updateParams.push(edit.tags); }
          if (edit.display_tags !== null) { updates.push("display_tags = ?"); updateParams.push(edit.display_tags); }
          if (edit.section !== null) { updates.push("section = ?"); updateParams.push(edit.section); }
          if (edit.subsection !== null) { updates.push("subsection = ?"); updateParams.push(edit.subsection); }
          if (edit.display_order !== null) { updates.push("display_order = ?"); updateParams.push(edit.display_order); }

          updates.push("last_edited_by = ?"); updateParams.push(edit.submitted_by);
          updates.push("last_edited_at = ?"); updateParams.push(new Date().toISOString());

          if (updates.length > 2) {
            updateParams.push(edit.pearl_id);
            await env.LOCKSMITH_DB.prepare(
              `UPDATE refined_pearls SET ${updates.join(", ")} WHERE id = ?`
            ).bind(...updateParams).run();
          }

          // Mark edit as approved
          await env.LOCKSMITH_DB.prepare(`
            UPDATE pearl_edits SET status = 'approved', reviewed_by = ?, reviewed_at = ? WHERE id = ?
          `).bind(userEmail, new Date().toISOString(), editId).run();

          return corsResponse(request, JSON.stringify({
            success: true,
            message: "Edit approved and applied",
            edit_id: editId,
            pearl_id: edit.pearl_id
          }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // ==============================================
      // PEARL ADMIN: Reject Pending Edit (POST /api/pearls/pending/:id/reject)
      // ==============================================
      if (path.match(/^\/api\/pearls\/pending\/\d+\/reject$/) && request.method === "POST") {
        try {
          const editId = path.split('/')[4];

          const sessionToken = getSessionToken(request);
          if (!sessionToken) {
            return corsResponse(request, JSON.stringify({ error: "Authentication required" }), 401);
          }

          const payload = await verifySession(sessionToken, env.SESSION_SECRET);
          if (!payload?.email) {
            return corsResponse(request, JSON.stringify({ error: "Invalid session" }), 401);
          }

          const userEmail = payload.email as string;
          const userIsDev = payload.is_developer || isDeveloper(userEmail, env.DEV_EMAILS);

          if (!userIsDev) {
            return corsResponse(request, JSON.stringify({ error: "Developer access required" }), 403);
          }

          const body = await request.json() as any;
          const { review_notes } = body;

          await env.LOCKSMITH_DB.prepare(`
            UPDATE pearl_edits SET status = 'rejected', reviewed_by = ?, reviewed_at = ?, review_notes = ? WHERE id = ? AND status = 'pending'
          `).bind(userEmail, new Date().toISOString(), review_notes || null, editId).run();

          return corsResponse(request, JSON.stringify({
            success: true,
            message: "Edit rejected",
            edit_id: editId
          }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // ==============================================
      // PEARL ADMIN: Revert to Version (POST /api/pearls/:id/revert/:version)
      // ==============================================
      if (path.match(/^\/api\/pearls\/[^/]+\/revert\/\d+$/) && request.method === "POST") {
        try {
          const parts = path.split('/');
          const pearlId = parts[3];
          const targetVersion = parseInt(parts[5], 10);

          const sessionToken = getSessionToken(request);
          if (!sessionToken) {
            return corsResponse(request, JSON.stringify({ error: "Authentication required" }), 401);
          }

          const payload = await verifySession(sessionToken, env.SESSION_SECRET);
          if (!payload?.email) {
            return corsResponse(request, JSON.stringify({ error: "Invalid session" }), 401);
          }

          const userEmail = payload.email as string;
          const userIsDev = payload.is_developer || isDeveloper(userEmail, env.DEV_EMAILS);

          if (!userIsDev) {
            return corsResponse(request, JSON.stringify({ error: "Developer access required" }), 403);
          }

          // Fetch target version
          const targetVersionData = await env.LOCKSMITH_DB.prepare(
            "SELECT * FROM pearl_versions WHERE pearl_id = ? AND version_number = ?"
          ).bind(pearlId, targetVersion).first<any>();

          if (!targetVersionData) {
            return corsResponse(request, JSON.stringify({ error: "Version not found" }), 404);
          }

          // Fetch current pearl for version history
          const currentPearl = await env.LOCKSMITH_DB.prepare(
            "SELECT * FROM refined_pearls WHERE id = ?"
          ).bind(pearlId).first<any>();

          if (!currentPearl) {
            return corsResponse(request, JSON.stringify({ error: "Pearl not found" }), 404);
          }

          // Save current state to version history as 'revert'
          const versionResult = await env.LOCKSMITH_DB.prepare(
            "SELECT COALESCE(MAX(version_number), 0) + 1 as next_version FROM pearl_versions WHERE pearl_id = ?"
          ).bind(pearlId).first<{ next_version: number }>();
          const nextVersion = versionResult?.next_version || 1;

          await env.LOCKSMITH_DB.prepare(`
            INSERT INTO pearl_versions (pearl_id, version_number, content, action, category, make, model, year_start, year_end, risk, tags, display_tags, section, subsection, display_order, edited_by, edit_reason, edit_type)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'revert')
          `).bind(
            pearlId, nextVersion,
            currentPearl.content, currentPearl.action, currentPearl.category,
            currentPearl.make, currentPearl.model, currentPearl.year_start, currentPearl.year_end,
            currentPearl.risk, currentPearl.tags, currentPearl.display_tags,
            currentPearl.section || 'general', currentPearl.subsection, currentPearl.display_order || 0,
            userEmail, `Reverted to version ${targetVersion}`
          ).run();

          // Apply target version to pearl
          await env.LOCKSMITH_DB.prepare(`
            UPDATE refined_pearls SET
              content = ?, action = ?, category = ?, make = ?, model = ?,
              year_start = ?, year_end = ?, risk = ?, tags = ?, display_tags = ?,
              section = ?, subsection = ?, display_order = ?,
              last_edited_by = ?, last_edited_at = ?
            WHERE id = ?
          `).bind(
            targetVersionData.content, targetVersionData.action, targetVersionData.category,
            targetVersionData.make, targetVersionData.model,
            targetVersionData.year_start, targetVersionData.year_end,
            targetVersionData.risk, targetVersionData.tags, targetVersionData.display_tags,
            targetVersionData.section, targetVersionData.subsection, targetVersionData.display_order,
            userEmail, new Date().toISOString(), pearlId
          ).run();

          return corsResponse(request, JSON.stringify({
            success: true,
            message: `Reverted to version ${targetVersion}`,
            pearl_id: pearlId,
            new_version: nextVersion
          }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // ==============================================
      // WALKTHROUGHS ENDPOINT - Step-by-step procedures
      // ==============================================
      // Returns Add Key and AKL procedures from walkthroughs_v2
      // Filters by make/model and year range
      if (path === "/api/walkthroughs") {
        try {
          const make = url.searchParams.get("make")?.toLowerCase() || "";
          const model = url.searchParams.get("model")?.toLowerCase() || "";
          const year = parseInt(url.searchParams.get("year") || "0", 10);
          const type = url.searchParams.get("type") || ""; // 'add_key', 'akl', or '' for all

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
            // Year-range filtering: walkthrough.year_start <= year AND walkthrough.year_end >= year
            conditions.push("(year_start IS NULL OR year_start <= ?)");
            conditions.push("(year_end IS NULL OR year_end >= ?)");
            params.push(year, year);
          }
          if (type) {
            conditions.push("type = ?");
            params.push(type);
          }

          const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

          const sql = `
            SELECT 
              id, type, title, make, model,
              year_start, year_end, difficulty, time_minutes, risk_level,
              requirements_json, tools_json, steps_json, menu_path, source_file
            FROM walkthroughs_v2
            ${whereClause}
            ORDER BY 
              CASE type WHEN 'add_key' THEN 1 WHEN 'akl' THEN 2 ELSE 3 END,
              year_start DESC
            LIMIT 20
          `;

          const result = await env.LOCKSMITH_DB.prepare(sql).bind(...params).all();

          const walkthroughs = (result.results || []).map((w: any) => ({
            id: w.id,
            type: w.type,
            title: w.title,
            make: w.make,
            model: w.model,
            year_start: w.year_start,
            year_end: w.year_end,
            difficulty: w.difficulty,
            time_minutes: w.time_minutes,
            risk_level: w.risk_level,
            requirements_json: w.requirements_json,
            tools_json: w.tools_json,
            steps_json: w.steps_json,
            menu_path: w.menu_path,
            source_file: w.source_file
          }));

          return corsResponse(request, JSON.stringify({
            source: "walkthroughs_v2",
            count: walkthroughs.length,
            query: { make, model, year: year || null, type: type || null },
            walkthroughs
          }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // ==============================================
      // PROCEDURES ENDPOINT - Structured procedure packages
      // ==============================================
      // Returns Add Key and AKL procedures from procedure_packages table
      // Filters by make/model and year range
      if (path === "/api/procedures") {
        try {
          const make = url.searchParams.get("make")?.toLowerCase() || "";
          const model = url.searchParams.get("model")?.toLowerCase() || "";
          const year = parseInt(url.searchParams.get("year") || "0", 10);
          const scenario = url.searchParams.get("scenario") || ""; // 'add_key', 'akl', 'general', or '' for all

          const conditions: string[] = [];
          const params: (string | number)[] = [];

          if (make) {
            conditions.push("LOWER(make) = ?");
            params.push(make);
          }
          if (model) {
            conditions.push("(LOWER(model) = ? OR model IS NULL OR model = 'None')");
            params.push(model);
          }
          if (year) {
            // Year-range filtering: year_start <= year AND year_end >= year
            conditions.push("(year_start IS NULL OR year_start <= ?)");
            conditions.push("(year_end IS NULL OR year_end >= ?)");
            params.push(year, year);
          }
          if (scenario) {
            conditions.push("scenario = ?");
            params.push(scenario);
          }

          const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

          const sql = `
            SELECT 
              id, make, model, year_start, year_end, scenario, title,
              difficulty, time_estimate, prerequisites, steps, tools,
              warnings, post_procedure, source_dossier
            FROM procedure_packages
            ${whereClause}
            ORDER BY 
              CASE scenario WHEN 'add_key' THEN 1 WHEN 'akl' THEN 2 ELSE 3 END,
              year_start DESC
            LIMIT 20
          `;

          const result = await env.LOCKSMITH_DB.prepare(sql).bind(...params).all();

          // Parse JSON fields
          const procedures = (result.results || []).map((p: any) => {
            const parseJson = (val: any) => {
              if (!val) return [];
              try {
                return typeof val === 'string' ? JSON.parse(val) : val;
              } catch {
                return [];
              }
            };

            return {
              id: p.id,
              make: p.make,
              model: p.model,
              year_start: p.year_start,
              year_end: p.year_end,
              scenario: p.scenario,
              title: p.title,
              difficulty: p.difficulty,
              time_estimate: p.time_estimate,
              prerequisites: parseJson(p.prerequisites),
              steps: parseJson(p.steps),
              tools: parseJson(p.tools),
              warnings: parseJson(p.warnings),
              post_procedure: parseJson(p.post_procedure),
              source_dossier: p.source_dossier
            };
          });

          return corsResponse(request, JSON.stringify({
            source: "procedure_packages",
            count: procedures.length,
            query: { make, model, year: year || null, scenario: scenario || null },
            procedures
          }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // Browse Database endpoint - uses unified schema
      if (path === "/api/browse") {
        const tStart = performance.now();
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
          const tCount = performance.now();

          // Data query using unified vehicles table with SMART DEDUPLICATION
          // 1. Group by unique key signature (Make/Model/Year/NormalizedFCC/KeyType)
          // 2. Normalize FCC (O vs 0, remove hyphens) to merge typos
          // 3. Prioritize highest confidence_score (AKS > Locksmith > Legacy)
          // 4. Filter by generation_boundaries to exclude wrong-generation FCC IDs
          const dataSql = `
          WITH RankedVehicles AS (
            SELECT 
                v.*,
                ROW_NUMBER() OVER (
                    PARTITION BY 
                        v.make, 
                        v.model, 
                        -- NORMALIZE FCC: Uppercase, O->0, Remove Hyphens
                        REPLACE(REPLACE(UPPER(v.fcc_id), 'O', '0'), '-', ''),
                        -- GENERATION BOUNDARY: Group by decade to prevent cross-generational merge
                        -- 2002-2009 = 200, 2010-2019 = 201, 2020-2029 = 202
                        (v.year_start / 10)
                    ORDER BY 
                        v.confidence_score DESC,
                        (v.source_name = 'AKS') DESC, -- Prefer AKS (Verified)
                        v.id DESC
                ) as rn
            FROM vehicles v
            ${whereClause}
            -- GENERATION BOUNDARY FILTER: Exclude FCC IDs from wrong generations
            AND (
                -- If generation_boundaries exists for this make/model, only allow valid FCC IDs
                NOT EXISTS (
                    SELECT 1 FROM generation_boundaries gb 
                    WHERE LOWER(gb.make) = LOWER(v.make) 
                    AND LOWER(gb.model) = LOWER(v.model)
                )
                OR EXISTS (
                    SELECT 1 FROM generation_boundaries gb 
                    WHERE LOWER(gb.make) = LOWER(v.make) 
                    AND LOWER(gb.model) = LOWER(v.model)
                    AND v.year_start >= gb.year_start AND v.year_end <= gb.year_end
                    AND gb.valid_fcc_ids LIKE '%' || UPPER(v.fcc_id) || '%'
                )
                OR v.fcc_id IS NULL  -- Allow mechanical key entries without FCC
            )
          )

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
            v.key_blank_refs,
            v.key_type_display,
            v.key_image_url,
            v.pearl_count,
            v.alert_count,
            v.has_akl_procedure,
            v.has_add_key_procedure,
            v.primary_walkthrough_id,
            v.verified_config_count,
            v.tool_support_json,
            v.quick_facts_json,
            v.architecture_tags_json,
            v.data_sources_json,
            v.last_validated,
            cr.technology as chip_technology,
            cr.bits as chip_bits,
            cr.description as chip_description,
            pc.ilco_part,
            pc.strattec_part,
            pc.jma_part,
            pc.keydiy_part,
            pc.key_type as crossref_key_type,
            pc.notes as crossref_notes
          FROM RankedVehicles v
          LEFT JOIN chip_registry cr ON LOWER(v.chip) = LOWER(cr.chip_type)
          LEFT JOIN (
            SELECT * FROM part_crossref GROUP BY make, fcc_id
          ) pc ON (
            LOWER(v.make) = LOWER(pc.make) AND 
            (v.fcc_id = pc.fcc_id OR v.oem_part_number = pc.oem_part)
          )
          WHERE v.rn = 1
          ORDER BY v.make, v.model, v.year_start
          LIMIT ? OFFSET ?
        `;
          const dataResult = await env.LOCKSMITH_DB.prepare(dataSql).bind(...params, limit, offset).all();
          const rows = dataResult.results || [];
          const tData = performance.now();

          // ---------------------------------------------------------
          // CAMARO REBUILD: Fetch Alerts & Guides if specific vehicle
          // ---------------------------------------------------------
          let alerts: any[] = [];
          let guide: any = null;
          let pearls: any[] = [];
          let procedures: any[] = [];
          let walkthroughs: any[] = [];

          if (make && model && year) {
            const y = parseInt(year, 10);
            if (!Number.isNaN(y)) {
              // 1. Fetch Alerts (Priority Order)
              const alertsResult = await env.LOCKSMITH_DB.prepare(`
                SELECT * FROM locksmith_alerts 
                WHERE LOWER(make) = ? AND LOWER(model) = ? 
                AND ? BETWEEN year_start AND year_end
                ORDER BY CASE alert_level 
                  WHEN 'CRITICAL' THEN 1 
                  WHEN 'WARNING' THEN 2 
                  WHEN 'INFO' THEN 3 
                  ELSE 4 END
              `).bind(make, model, y).all();
              alerts = alertsResult.results || [];

              // 2. Fetch Programming Guide
              guide = await env.LOCKSMITH_DB.prepare(`
                SELECT * FROM programming_guides
                WHERE LOWER(make) = ? AND LOWER(model) = ?
                AND ? BETWEEN year_start AND year_end
                LIMIT 1
              `).bind(make, model, y).first();

              // 3. Fetch Programming Pearls (Research Automation)
              // Use LIKE for model matching to handle variations
              // Include pearl_type and is_critical for frontend section distribution
              const modelPattern = `${model}%`;
              const pearlsResult = await env.LOCKSMITH_DB.prepare(`
                SELECT id, vehicle_key, make, model, year_start, year_end, 
                       pearl_title, pearl_content, pearl_type, is_critical, reference_url,
                       display_order, source_doc, created_at,
                       COALESCE((SELECT SUM(vote) FROM pearl_votes pv WHERE pv.pearl_id = vehicle_pearls.id), 0) as score,
                       COALESCE((SELECT COUNT(*) FROM pearl_comments pc WHERE pc.pearl_id = vehicle_pearls.id), 0) as comment_count
                FROM vehicle_pearls
                WHERE LOWER(make) = ? AND LOWER(model) LIKE ?
                AND ? BETWEEN year_start AND year_end
                AND LENGTH(pearl_content) > 80
                AND pearl_title NOT LIKE 'http%'
                AND pearl_content NOT LIKE '%accessed December%'
                AND pearl_content NOT LIKE '%accessed January%'
                GROUP BY pearl_title
                ORDER BY 
                  CASE pearl_type 
                    WHEN 'Alert' THEN 1
                    WHEN 'AKL Procedure' THEN 2
                    WHEN 'Add Key Procedure' THEN 3
                    WHEN 'Tool Alert' THEN 4
                    WHEN 'FCC Registry' THEN 5
                    ELSE 10 
                  END,
                  is_critical DESC,
                  display_order ASC
              `).bind(make, modelPattern, y).all();
              pearls = pearlsResult.results || [];

              // 4. Fetch Procedures from vehicle_procedures (Rich procedure data)
              try {
                const proceduresResult = await env.LOCKSMITH_DB.prepare(`
                  SELECT 
                    id,
                    tool,
                    tool_category,
                    LOWER(procedure_type) as procedure_type,
                    steps,
                    time_estimate,
                    online_required,
                    voltage_warning,
                    source_file,
                    created_at
                  FROM vehicle_procedures
                  WHERE LOWER(make) = ? AND LOWER(model) LIKE ?
                  AND ? BETWEEN year_start AND year_end
                  ORDER BY 
                    CASE LOWER(procedure_type)
                      WHEN 'akl' THEN 1
                      WHEN 'add_key' THEN 2
                      ELSE 3
                    END,
                    tool ASC
                `).bind(make, modelPattern, y).all();
                procedures = proceduresResult.results || [];
              } catch (e) {
                // Table may not exist yet - graceful fallback
                procedures = [];
              }

              // 5. Fetch Walkthroughs (NEW: via junction table for one-to-many relationship)
              // A walkthrough can apply to multiple vehicles/years
              try {
                const walkthroughsResult = await env.LOCKSMITH_DB.prepare(`
                  SELECT w.id, w.slug, w.title, w.content, w.difficulty, 
                         w.estimated_time_mins, w.video_url, w.tools_required,
                         w.prerequisites, w.platform_code, w.security_architecture,
                         w.category, w.updated_at, w.structured_steps_json, w.full_content_html,
                         wv.is_primary, wv.notes as vehicle_notes
                  FROM walkthrough_vehicles wv
                  JOIN walkthroughs w ON w.id = wv.walkthrough_id
                  WHERE LOWER(wv.make) = ? 
                    AND LOWER(wv.model) LIKE ?
                    AND ? BETWEEN wv.year_start AND wv.year_end
                  ORDER BY wv.is_primary DESC, w.updated_at DESC
                `).bind(make, modelPattern, y).all();
                walkthroughs = walkthroughsResult.results || [];
              } catch (e) {
                // Table may not exist yet - graceful fallback
                walkthroughs = [];
              }


            }
          }
          const tEnd = performance.now();

          const headers = new Headers({
            "content-type": "application/json",
            "Cache-Control": "public, max-age=60", // Reduced cache for debugging
            "Access-Control-Allow-Origin": "*",
          });
          headers.set("Server-Timing", `total;desc="Total";dur=${tEnd - tStart}, count;desc="CountQuery";dur=${tCount - tStart}, data;desc="DataQuery";dur=${tData - tCount}, extras;desc="AlertsGuide";dur=${tEnd - tData}`);

          return new Response(JSON.stringify({
            total,
            rows,
            alerts,
            guide,
            pearls,
            procedures,
            walkthroughs,
            _timings: {
              total: tEnd - tStart,
              count: tCount - tStart,
              data: tData - tCount,
              extras: tEnd - tData
            }
          }), {
            headers
          });
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // ==============================================
      // VEHICLE DETAIL ENDPOINT - Combined Data with Priority Rules
      // ==============================================
      // Combines:
      //   Priority 0: vehicle_enrichments (LLM-parsed research docs) - HIGHEST
      //   Priority 1: AKS product detail (year-filtered, product-type segmented)
      //   Priority 2: VYP (vehicle_year_products) - primary for Lishi
      //   Priority 3: Vehicles table - fallback for immobilizer, platform, etc.
      if (path === "/api/vehicle-detail") {
        try {
          const make = url.searchParams.get("make")?.toLowerCase() || "";
          const model = url.searchParams.get("model")?.toLowerCase() || "";
          const yearParam = url.searchParams.get("year");
          const year = yearParam ? parseInt(yearParam, 10) : null;

          if (!make || !model) {
            return corsResponse(request, JSON.stringify({ error: "make and model required" }), 400);
          }

          // 0. Get enrichments (Priority 0 - LLM-parsed research docs, HIGHEST priority)
          let enrichmentData: any = null;
          const enrichmentQuery = year
            ? `SELECT * FROM vehicle_enrichments WHERE LOWER(make) = ? AND LOWER(model) LIKE ? AND (year_start IS NULL OR year_start <= ?) AND (year_end IS NULL OR year_end >= ?) ORDER BY confidence_score DESC LIMIT 1`
            : `SELECT * FROM vehicle_enrichments WHERE LOWER(make) = ? AND LOWER(model) LIKE ? ORDER BY confidence_score DESC LIMIT 1`;

          const enrichmentParams = year ? [make, `%${model}%`, year, year] : [make, `%${model}%`];
          enrichmentData = await env.LOCKSMITH_DB.prepare(enrichmentQuery).bind(...enrichmentParams).first<any>();

          // 1. Get VYP data (Priority 2 - source for Lishi, spaces, depths, MACS)
          let vypData: any = null;
          let itemNumbers: string[] = [];

          if (year) {
            const vypResult = await env.LOCKSMITH_DB.prepare(`
              SELECT * FROM vehicle_year_products 
              WHERE LOWER(make) = ? AND LOWER(model) LIKE ? AND year = ?
            `).bind(make, `%${model}%`, year).first<any>();

            if (vypResult) {
              vypData = vypResult;
              try {
                itemNumbers = JSON.parse(vypResult.item_numbers || "[]");
              } catch { itemNumbers = []; }
            }
          }

          // 1.5. Get AKS vehicles data (Priority 1.5 - source for keyway/lishi/bitting with better coverage)
          // Join aks_vehicles_by_year (exact year) → aks_vehicles (bitting specs) via page_id
          let aksVehicleData: any = null;
          if (year) {
            aksVehicleData = await env.LOCKSMITH_DB.prepare(`
              SELECT v.mechanical_key, v.transponder_key, v.lishi_tool, v.chip_type, v.code_series,
                     v.spaces, v.depths, v.macs
              FROM aks_vehicles_by_year vy
              JOIN aks_vehicles v ON vy.page_id = v.page_id
              WHERE LOWER(vy.make) = ? AND LOWER(vy.model) LIKE LOWER(?) AND vy.year = ?
              LIMIT 1
            `).bind(make, `%${model}%`, year).first<any>();
          }

          // 1.6. Get ALL FCCs from aks_vehicle_products → aks_products (for FCC breakdown popup)
          interface FccEntry {
            fcc: string;
            keyType: string;
            buttons: string | null;
          }
          let allFccs: FccEntry[] = [];

          if (year) {
            const fccResult = await env.LOCKSMITH_DB.prepare(`
              SELECT DISTINCT p.fcc_id, p.product_type, p.buttons, p.title
              FROM aks_vehicle_products vp
              JOIN aks_products p ON vp.product_page_id = p.page_id
              WHERE LOWER(vp.make) = ? AND LOWER(vp.model) LIKE LOWER(?) AND vp.year = ?
                AND p.fcc_id IS NOT NULL AND p.fcc_id != ''
                AND LOWER(COALESCE(p.product_type, '')) NOT LIKE '%shell%'
            `).bind(make, `%${model}%`, year).all<any>();

            // Normalize FCC IDs: replace common O/0 typos (letter O → number 0)
            const normalizeFcc = (fcc: string): string => {
              // Common pattern: N5F-AO8TAA should be N5F-A08TAA (letter O vs zero)
              // Replace letter O that's followed by a digit with 0
              return fcc.replace(/O(\d)/g, '0$1');
            };

            // Parse and dedupe FCCs, tracking which key types use each
            const fccMap = new Map<string, Set<string>>();

            for (const row of (fccResult.results || [])) {
              // Skip shell products (double-check in case SQL filter missed)
              const productType = (row.product_type || '').toLowerCase();
              const title = (row.title || '').toLowerCase();
              if (productType.includes('shell') || title.includes('shell only') || title.includes('case only')) {
                continue;
              }

              // Handle comma-separated FCC IDs (e.g., "YGOG21TB2, YG0G21TB2")
              const fccIds = (row.fcc_id || '').split(',').map((f: string) => f.trim()).filter((f: string) => f);

              // Build a readable key type description
              const keyType = row.product_type || 'Key';
              const btnMatch = (row.title || '').match(/(\d)-(?:Btn|Button)/i);
              const btnCount = btnMatch ? btnMatch[1] : null;
              const description = btnCount ? `${btnCount}-Button ${keyType}` : keyType;

              for (const rawFcc of fccIds) {
                // Skip combined FCC entries that have spaces (malformed data)
                if (rawFcc.includes(' ')) continue;

                const fcc = normalizeFcc(rawFcc.trim());
                if (!fccMap.has(fcc)) {
                  fccMap.set(fcc, new Set());
                }
                fccMap.get(fcc)!.add(description);
              }
            }

            // Convert to array format grouped by key type
            allFccs = Array.from(fccMap.entries()).map(([fcc, types]) => ({
              fcc,
              keyType: Array.from(types).join(', '),
              buttons: null // Could extract if needed
            }));
          }

          // 1.7. Get AKS key configurations grouped by key type → button count
          // Uses: aks_vehicle_products → aks_products → aks_products_detail (for R2 images)
          interface AksKeyConfig {
            keyType: string;
            buttonCount: string | null;
            fccIds: string[];
            oemParts: string[];
            chip: string | null;
            battery: string | null;
            frequency: string | null;
            keyway: string | null;
            partNumber: string | null;
            imageUrl: string | null;
            productCount: number;
          }
          let aksKeyConfigs: AksKeyConfig[] = [];
          const WORKER_BASE = "https://euro-keys.jeremy-samuels17.workers.dev";

          if (year) {
            const keyConfigResult = await env.LOCKSMITH_DB.prepare(`
              SELECT 
                p.page_id,
                p.title,
                p.product_type,
                p.buttons,
                p.fcc_id,
                p.oem_part_number,
                p.battery,
                p.frequency,
                p.image_url as cdn_image,
                d.image_r2_key,
                d.chip,
                d.keyway,
                d.model_num
              FROM aks_vehicle_products vp
              JOIN aks_products p ON vp.product_page_id = p.page_id
              LEFT JOIN aks_products_detail d ON CAST(p.item_id AS TEXT) = d.item_number
              WHERE LOWER(vp.make) = ? 
                AND LOWER(vp.model) LIKE LOWER(?) 
                AND vp.year = ?
                AND LOWER(COALESCE(p.product_type, '')) NOT LIKE '%shell%'
                AND LOWER(COALESCE(p.product_type, '')) NOT LIKE '%flip%'
                AND LOWER(COALESCE(p.product_type, '')) NOT LIKE '%tool%'
                AND LOWER(COALESCE(p.product_type, '')) NOT LIKE '%lishi%'
                AND LOWER(COALESCE(p.product_type, '')) NOT LIKE '%ignition%'
                AND LOWER(COALESCE(p.product_type, '')) NOT LIKE '%lock%'
                AND COALESCE(p.product_type, '') != 'Key'
                AND LOWER(COALESCE(p.product_type, '')) NOT LIKE '%chip%'
                AND LOWER(COALESCE(p.product_type, '')) NOT LIKE '%other%'
                AND LOWER(COALESCE(p.title, '')) NOT LIKE '%shell only%'
                AND LOWER(COALESCE(p.title, '')) NOT LIKE '%case only%'
                AND LOWER(COALESCE(p.title, '')) NOT LIKE '%-pack%'
                AND LOWER(COALESCE(p.title, '')) NOT LIKE '%flip blade%'
              ORDER BY p.product_type, p.buttons DESC
            `).bind(make, `%${model}%`, year).all<any>();

            // Group by key type → button count
            const keyTypeGroups: Record<string, Record<string, {
              fccIds: Set<string>;
              oemParts: Set<string>;
              chips: Set<string>;
              batteries: Set<string>;
              frequencies: Set<string>;
              keyways: Set<string>;
              modelNums: Set<string>;
              images: string[];
              productCount: number;
            }>> = {};

            for (const row of (keyConfigResult.results || [])) {
              // Skip products with no product_type (usually accessories like batteries)
              if (!row.product_type) continue;

              // Determine key type
              let baseType = row.product_type;

              // Normalize malformed key type names
              if (baseType === 'Emergency Key_Blade') {
                baseType = 'Emergency Key';
              }

              // Extract button count
              let buttonCount: string | null = null;
              const btnMatch = (row.title || '').match(/(\d)-(?:Btn|Button)/i);
              if (btnMatch) {
                buttonCount = btnMatch[1];
              } else if (row.buttons) {
                const btnParts = String(row.buttons).split('/');
                buttonCount = String(btnParts.length);
              }

              // Initialize key type group
              if (!keyTypeGroups[baseType]) {
                keyTypeGroups[baseType] = {};
              }

              const btnKey = buttonCount || 'other';
              if (!keyTypeGroups[baseType][btnKey]) {
                keyTypeGroups[baseType][btnKey] = {
                  fccIds: new Set(),
                  oemParts: new Set(),
                  chips: new Set(),
                  batteries: new Set(),
                  frequencies: new Set(),
                  keyways: new Set(),
                  modelNums: new Set(),
                  images: [],
                  productCount: 0
                };
              }

              const group = keyTypeGroups[baseType][btnKey];

              // Aggregate data
              // Skip FCC aggregation for blade/emergency/mechanical keys (no RF transmitter)
              const isBladeType = ['Emergency Key', 'Mechanical Key', 'Blade'].includes(baseType);
              if (row.fcc_id && !isBladeType) {
                row.fcc_id.split(',').map((f: string) => f.trim()).filter((f: string) => f).forEach((f: string) => {
                  // Normalize O→0 typos
                  group.fccIds.add(f.replace(/O(\d)/g, '0$1'));
                });
              }
              if (row.oem_part_number) group.oemParts.add(row.oem_part_number);
              if (row.chip) group.chips.add(row.chip);
              if (row.battery) group.batteries.add(row.battery);
              if (row.frequency) group.frequencies.add(row.frequency);
              if (row.keyway) group.keyways.add(row.keyway);
              if (row.model_num) group.modelNums.add(row.model_num);


              // Collect images - gather R2 and CDN separately for best selection
              if (row.image_r2_key) {
                group.images.push(`r2:${row.image_r2_key}`);
              } else if (row.cdn_image) {
                group.images.push(`cdn:${row.cdn_image}`);
              }

              group.productCount++;
            }

            // Flatten to array format
            for (const [keyType, buttonGroups] of Object.entries(keyTypeGroups)) {
              for (const [btnKey, group] of Object.entries(buttonGroups)) {
                // Pick best image: prefer R2 (any), then CDN (any)
                const r2Image = group.images.find(img => img.startsWith('r2:'));
                const cdnImage = group.images.find(img => img.startsWith('cdn:'));
                let imageUrl: string | null = null;
                if (r2Image) {
                  const r2Key = r2Image.substring(3);
                  imageUrl = `${WORKER_BASE}/api/r2/${encodeURIComponent(r2Key)}`;
                } else if (cdnImage) {
                  imageUrl = cdnImage.substring(4);
                }

                aksKeyConfigs.push({
                  keyType,
                  buttonCount: btnKey === 'other' ? null : btnKey,
                  fccIds: Array.from(group.fccIds).slice(0, 5),
                  oemParts: Array.from(group.oemParts).slice(0, 10),
                  chip: Array.from(group.chips)[0] || null,
                  battery: Array.from(group.batteries)[0] || null,
                  frequency: Array.from(group.frequencies)[0] || null,
                  keyway: Array.from(group.keyways)[0] || null,
                  partNumber: Array.from(group.modelNums)[0] || null,
                  imageUrl,
                  productCount: group.productCount
                });
              }
            }

            // Sort: Smart Keys first, then by button count descending
            const typeOrder: Record<string, number> = {
              'Smart Key': 1, 'Remote Head Key': 2, 'Remote Keyless Entry': 3,
              'Flip Key': 4, 'Transponder Key': 5, 'Mechanical Key': 6, 'Emergency Key': 7
            };
            aksKeyConfigs.sort((a, b) => {
              const orderA = typeOrder[a.keyType] || 10;
              const orderB = typeOrder[b.keyType] || 10;
              if (orderA !== orderB) return orderA - orderB;
              return (parseInt(b.buttonCount || '0') || 0) - (parseInt(a.buttonCount || '0') || 0);
            });
          }

          // Query for Tools (Lishi) based on keyways found in the keys
          interface AksTool {
            name: string;
            partNumber: string | null;
            imageUrl: string | null;
            keyways: string[];
          }
          let aksTools: AksTool[] = [];

          // Collect keyways from the key configs to match tools
          const vehicleKeyways = new Set<string>();
          aksKeyConfigs.forEach(kc => {
            if (kc.keyway) {
              // Split keyway like "H128-PT/HU101" into individual parts
              kc.keyway.split(/[\/;,]/).forEach(k => vehicleKeyways.add(k.trim()));
            }
          });

          if (vehicleKeyways.size > 0) {
            // Query tools that match any of the keyways
            const keywayPatterns = Array.from(vehicleKeyways).map(k => `%${k}%`);
            const toolsQuery = `
              SELECT DISTINCT
                p.title,
                p.image_url as cdn_image,
                d.model_num,
                d.image_r2_key,
                d.keyway
              FROM aks_products p
              LEFT JOIN aks_products_detail d ON CAST(p.item_id AS TEXT) = d.item_number
              WHERE (LOWER(p.product_type) LIKE '%tool%' OR LOWER(p.product_type) LIKE '%lishi%')
                AND (${keywayPatterns.map(() => `LOWER(p.title) LIKE ?`).join(' OR ')})
              LIMIT 5
            `;
            const toolsResult = await env.LOCKSMITH_DB.prepare(toolsQuery)
              .bind(...keywayPatterns.map(k => k.toLowerCase()))
              .all<any>();

            aksTools = (toolsResult.results || []).map(row => {
              let imageUrl: string | null = null;
              if (row.image_r2_key) {
                imageUrl = `${WORKER_BASE}/api/r2/${encodeURIComponent(row.image_r2_key)}`;
              } else if (row.cdn_image) {
                imageUrl = row.cdn_image;
              }
              return {
                name: row.title,
                partNumber: row.model_num || null,
                imageUrl,
                keyways: row.keyway ? row.keyway.split(/[\/;,]/).map((k: string) => k.trim()) : []
              };
            });
          }

          // 2. Get vehicles table data (Priority 3 - fallback for immobilizer, platform, etc.)
          let vehicleData: any = null;
          const vehicleQuery = year
            ? `SELECT * FROM vehicles WHERE LOWER(make) = ? AND LOWER(model) LIKE ? AND year_start <= ? AND (year_end IS NULL OR year_end >= ?) LIMIT 1`
            : `SELECT * FROM vehicles WHERE LOWER(make) = ? AND LOWER(model) LIKE ? LIMIT 1`;

          const vehicleParams = year ? [make, `%${model}%`, year, year] : [make, `%${model}%`];
          vehicleData = await env.LOCKSMITH_DB.prepare(vehicleQuery).bind(...vehicleParams).first<any>();

          // 3. Get AKS products aggregated by product_type (Priority 1 for OEM/FCC/chip/keyway/prices)
          const productsByType: Record<string, any> = {};

          if (itemNumbers.length > 0) {
            const placeholders = itemNumbers.map(() => "?").join(",");

            // Apply year filter to AKS products
            let yearFilter = "";
            if (year) {
              yearFilter = ` AND (year_start IS NULL OR year_start <= ${year}) AND (year_end IS NULL OR year_end >= ${year})`;
            }

            const aksResult = await env.LOCKSMITH_DB.prepare(`
              SELECT 
                item_number,
                product_type,
                buttons,
                title,
                fcc_id,
                oem_part_numbers,
                ic,
                chip,
                keyway,
                frequency,
                battery,
                CAST(price AS REAL) as price_num
              FROM aks_products_detail
              WHERE item_number IN (${placeholders})${yearFilter}
            `).bind(...itemNumbers).all();

            for (const row of (aksResult.results || []) as any[]) {
              // Hide multipacks/shells
              if (HIDE_PATTERNS.some(p => p.test(row.title || ''))) continue;

              // Generate unique signature for this variation (By FCC + Buttons + Features)
              const sig = getKeySignature(row);

              // Extract or fallback button count
              const btns = extractButtons(row.title || '') || row.buttons || null;
              const features = extractFeatures(row.title || '');
              const baseType = row.product_type || extractKeyType(row.title || '') || "Remote";

              // Construct a readable name for this variant
              let productType = baseType;
              if (btns && btns > 0) {
                productType = `${btns}-Button ${baseType}`;
                if (features.length > 0) {
                  productType += ` (${features.join(', ')})`;
                }
              }

              // Parse OEM parts
              let oemParts: string[] = [];
              try {
                if (row.oem_part_numbers) {
                  const parsed = JSON.parse(row.oem_part_numbers);
                  if (Array.isArray(parsed)) oemParts = parsed.map(String);
                  else oemParts = [String(parsed)];
                }
              } catch {
                if (row.oem_part_numbers) oemParts = [row.oem_part_numbers];
              }

              // Initialize group if not exists
              if (!productsByType[productType]) {
                productsByType[productType] = {
                  buttons: btns,
                  features: features,
                  fcc_ids: [],
                  oem_parts: [],
                  ic_numbers: [],
                  chips: [],
                  keyways: [],
                  frequencies: [],
                  batteries: [],
                  price_range: { min: row.price_num, max: row.price_num },
                  product_count: 0
                };
              }

              const group = productsByType[productType];
              if (row.fcc_id) group.fcc_ids.push(row.fcc_id);
              if (oemParts.length > 0) group.oem_parts.push(...oemParts);
              if (row.ic) group.ic_numbers.push(row.ic);
              if (row.chip) group.chips.push(row.chip);
              if (row.keyway) group.keyways.push(row.keyway);
              if (row.frequency) group.frequencies.push(row.frequency);
              if (row.battery) group.batteries.push(row.battery);

              if (row.price_num) {
                group.price_range.min = group.price_range.min ? Math.min(group.price_range.min, row.price_num) : row.price_num;
                group.price_range.max = group.price_range.max ? Math.max(group.price_range.max, row.price_num) : row.price_num;
              }
              group.product_count++;
            }

            // Deduplicate lists in groups
            for (const type of Object.keys(productsByType)) {
              const g = productsByType[type];
              g.fcc_ids = [...new Set(g.fcc_ids)].filter(Boolean);
              g.oem_parts = [...new Set(g.oem_parts)].filter(Boolean);
              g.ic_numbers = [...new Set(g.ic_numbers)].filter(Boolean);
              g.chips = [...new Set(g.chips)].filter(Boolean);
              g.keyways = [...new Set(g.keyways)].filter(Boolean);
              g.frequencies = [...new Set(g.frequencies)].filter(Boolean);
              g.batteries = [...new Set(g.batteries)].filter(Boolean);
            }
          }

          // 4. Extract consensus specs from productsByType (AKS data) using 60% Mode Rule
          // This handles transition years where hardware varies (e.g., 2022 Silverado)
          const aksConsensus: {
            chip: string | null;
            battery: string | null;
            frequency: string | null;
            keyway: string | null;
            fcc_id: string | null;
            hasVariance: boolean;
            varianceDetails: Record<string, { values: string[]; percentages: Record<string, number> }>;
          } = {
            chip: null,
            battery: null,
            frequency: null,
            keyway: null,
            fcc_id: null,
            hasVariance: false,
            varianceDetails: {}
          };

          const productTypeKeys = Object.keys(productsByType);
          if (productTypeKeys.length > 0) {
            // Helper to find consensus value using 60% Mode Rule
            const findConsensus = (field: 'chips' | 'batteries' | 'frequencies' | 'keyways' | 'fcc_ids'): { value: string | null; hasVariance: boolean; percentages: Record<string, number> } => {
              const allValues: string[] = [];
              for (const type of productTypeKeys) {
                const group = productsByType[type];
                if (group[field] && Array.isArray(group[field])) {
                  allValues.push(...group[field]);
                }
              }

              if (allValues.length === 0) return { value: null, hasVariance: false, percentages: {} };

              // Count occurrences
              const counts: Record<string, number> = {};
              for (const v of allValues) {
                counts[v] = (counts[v] || 0) + 1;
              }

              // Calculate percentages
              const total = allValues.length;
              const percentages: Record<string, number> = {};
              for (const [val, count] of Object.entries(counts)) {
                percentages[val] = Math.round((count / total) * 100);
              }

              // Find max occurrence
              const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
              const [topValue, topCount] = sorted[0];
              const topPercentage = (topCount / total) * 100;

              // 60% Mode Rule: if top value >= 60%, it's the consensus
              // Otherwise, flag as variance (transition year)
              if (topPercentage >= 60) {
                return { value: topValue, hasVariance: false, percentages };
              } else {
                return { value: topValue, hasVariance: true, percentages };
              }
            };

            const chipResult = findConsensus('chips');
            const batteryResult = findConsensus('batteries');
            const frequencyResult = findConsensus('frequencies');
            const keywayResult = findConsensus('keyways');
            const fccResult = findConsensus('fcc_ids');

            aksConsensus.chip = chipResult.value;
            aksConsensus.battery = batteryResult.value;
            aksConsensus.frequency = frequencyResult.value;
            aksConsensus.keyway = keywayResult.value;
            aksConsensus.fcc_id = fccResult.value;

            // Track variance for UI alerts
            if (chipResult.hasVariance || batteryResult.hasVariance || frequencyResult.hasVariance) {
              aksConsensus.hasVariance = true;
              if (chipResult.hasVariance) aksConsensus.varianceDetails.chip = { values: Object.keys(chipResult.percentages), percentages: chipResult.percentages };
              if (batteryResult.hasVariance) aksConsensus.varianceDetails.battery = { values: Object.keys(batteryResult.percentages), percentages: batteryResult.percentages };
              if (frequencyResult.hasVariance) aksConsensus.varianceDetails.frequency = { values: Object.keys(frequencyResult.percentages), percentages: frequencyResult.percentages };
            }
          }

          // 5. Build combined response with priority rules
          // Priority: enrichments (0) > AKS (1) > VYP (2) > vehicles (3)
          const response: any = {
            query: { make, model, year },
            data_sources: {
              enrichments: !!enrichmentData,
              vyp: !!vypData,
              vehicles: !!vehicleData,
              aks_products: Object.keys(productsByType).length > 0
            },

            // Header data (enrichments override vehicles)
            header: {
              make: vehicleData?.make || make,
              model: vehicleData?.model || model,
              year: year,
              year_range: vehicleData ? { start: vehicleData.year_start, end: vehicleData.year_end } : null,
              // Priority 0: enrichments override
              immobilizer_system: enrichmentData?.immobilizer_system || vehicleData?.immobilizer_system || null,
              platform: enrichmentData?.platform || vehicleData?.platform || null,
              protocol_type: enrichmentData?.protocol_type || null,
              security_gateway: enrichmentData?.security_gateway || null,
              key_type: vehicleData?.key_type || null,
              can_fd_required: enrichmentData?.can_fd_required ?? vehicleData?.can_fd_required ?? false,
              adapter_type: enrichmentData?.adapter_type ?? vehicleData?.adapter_type ??
                (enrichmentData?.can_fd_required || vehicleData?.can_fd_required ? 'CAN FD' : 'None'),
              online_required: enrichmentData?.online_required ?? false,
              architecture_tags: vehicleData?.architecture_tags_json ? JSON.parse(vehicleData.architecture_tags_json) : []
            },

            // Specs data - Priority: enrichments > AKS vehicles > VYP > vehicles
            specs: {
              // Priority: enrichments > AKS vehicles (38% lishi) > VYP > vehicles
              lishi: enrichmentData?.lishi || aksVehicleData?.lishi_tool || vypData?.lishi || vehicleData?.lishi_tool || null,
              lishi_source: enrichmentData?.lishi ? "enrichments" : (aksVehicleData?.lishi_tool ? "aks_vehicles" : (vypData?.lishi ? "vyp" : (vehicleData?.lishi_tool ? "vehicles" : null))),

              // Bitting specs - Priority: AKS vehicles (74.5%) > VYP > vehicles
              spaces: parseInt(aksVehicleData?.spaces, 10) || parseInt(vypData?.spaces, 10) || vehicleData?.spaces || null,
              depths: aksVehicleData?.depths || vypData?.depths || vehicleData?.depths || null,
              macs: parseInt(aksVehicleData?.macs, 10) || parseInt(vypData?.macs, 10) || vehicleData?.macs || null,
              // Track source for accuracy/debugging
              mechanical_source: aksVehicleData?.spaces ? "aks_vehicles" : (vypData?.spaces ? "vyp" : (vehicleData?.spaces ? "vehicles" : null)),
              code_series: aksVehicleData?.code_series || vypData?.code_series || vehicleData?.code_series || null,
              mechanical_key: aksVehicleData?.mechanical_key || vypData?.mechanical_key || vehicleData?.mechanical_spec || null,
              transponder_key: aksVehicleData?.transponder_key || vypData?.transponder_key || vehicleData?.blade_type || null,
              // Priority: enrichments > AKS vehicles (83% coverage) > AKS consensus > vehicles
              keyway: enrichmentData?.keyway || aksVehicleData?.mechanical_key || aksConsensus.keyway || vehicleData?.keyway || null,
              keyway_source: enrichmentData?.keyway ? "enrichments" : (aksVehicleData?.mechanical_key ? "aks_vehicles" : (aksConsensus.keyway ? "aks_products" : (vehicleData?.keyway ? "vehicles" : null))),

              // Priority: enrichments (override) > AKS (primary hardware authority) > vehicles (fallback)
              chip: enrichmentData?.chip || aksConsensus.chip || vehicleData?.chip || null,
              frequency: enrichmentData?.frequency || aksConsensus.frequency || vehicleData?.frequency || null,
              battery: enrichmentData?.battery || aksConsensus.battery || vehicleData?.battery || null,
              buttons: vehicleData?.buttons || null,
              fcc_id: enrichmentData?.fcc_id || aksConsensus.fcc_id || vehicleData?.fcc_id || null,

              // Transition year variance detection (60% Mode Rule)
              hasVariance: aksConsensus.hasVariance,
              varianceDetails: aksConsensus.hasVariance ? aksConsensus.varianceDetails : null,

              // All FCCs grouped by key type (for popup display)
              all_fccs: allFccs.length > 0 ? allFccs : null
            },

            // Enrichment data (if available)
            enrichments: enrichmentData ? {
              source_doc: enrichmentData.source_doc,
              confidence_score: enrichmentData.confidence_score,
              extraction_method: enrichmentData.extraction_method,
              fcc_ids: enrichmentData.fcc_ids_json ? JSON.parse(enrichmentData.fcc_ids_json) : null,
              oem_parts: enrichmentData.oem_parts_json ? JSON.parse(enrichmentData.oem_parts_json) : null,
              ic_numbers: enrichmentData.ic_numbers_json ? JSON.parse(enrichmentData.ic_numbers_json) : null
            } : null,

            // VYP aggregated data
            vyp: vypData ? {
              product_count: vypData.product_count,
              fcc_ids: (vypData.fcc_ids || "").split(",").filter(Boolean),
              oem_parts: (vypData.oem_parts || "").split(",").filter(Boolean),
              chips: (vypData.chips || "").split(",").filter(Boolean),
              product_types: (vypData.product_types || "").split(",").filter(Boolean)
            } : null,

            // AKS products by type (Priority 1 for OEM/FCC/IC/chip/keyway/prices)
            products_by_type: productsByType,

            // AKS key configs grouped by key type → button count (with R2 images)
            aks_key_configs: aksKeyConfigs.length > 0 ? aksKeyConfigs : null,

            // Tools (Lishi) matched by keyway
            aks_tools: aksTools.length > 0 ? aksTools : null,

            // Programming info from vehicles table
            programming: vehicleData ? {
              method: vehicleData.programming_method,
              pin_required: !!vehicleData.pin_required,
              akl_supported: !!vehicleData.akl_supported,
              akl_difficulty: vehicleData.akl_difficulty,
              prog_difficulty: vehicleData.prog_difficulty,
              prog_tools: vehicleData.prog_tools
            } : null,

            // Counts for UI badges
            counts: {
              pearls: vehicleData?.pearl_count || 0,
              alerts: vehicleData?.alert_count || 0,
              has_akl: vehicleData?.has_akl_procedure || false,
              has_add_key: vehicleData?.has_add_key_procedure || false
            }
          };

          return corsResponse(request, JSON.stringify(response));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // ==============================================
      // VEHICLE PRODUCTS ENDPOINT - AKS Products with R2 Images
      // ==============================================

      // Returns key fob products from aks_products_detail with image_r2_key for dynamic frontend
      if (path === "/api/vehicle-products") {
        try {
          const make = url.searchParams.get("make")?.toLowerCase() || "";
          const model = url.searchParams.get("model")?.toLowerCase() || "";
          const year = parseInt(url.searchParams.get("year") || "0", 10);
          const fccId = url.searchParams.get("fcc")?.toUpperCase() || "";
          const oem = url.searchParams.get("oem") || "";

          if (!make && !fccId && !oem) {
            return corsResponse(request, JSON.stringify({ error: "make, fcc, or oem required" }), 400);
          }

          const conditions: string[] = [];
          const params: (string | number)[] = [];

          // Build WHERE clause
          if (make) {
            conditions.push("LOWER(title) LIKE ?");
            params.push(`%${make}%`);
          }
          if (model) {
            conditions.push("(LOWER(title) LIKE ? OR LOWER(compatible_vehicles) LIKE ?)");
            params.push(`%${model}%`, `%${model}%`);
          }
          if (fccId) {
            conditions.push("UPPER(fcc_id) LIKE ?");
            params.push(`%${fccId}%`);
          }
          if (oem) {
            conditions.push("oem_part_numbers LIKE ?");
            params.push(`%${oem}%`);
          }

          // Year filter - only return products that fit the requested year
          if (year > 0) {
            conditions.push("(year_start IS NULL OR year_start <= ?)");
            conditions.push("(year_end IS NULL OR year_end >= ?)");
            params.push(year, year);
          }

          const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

          const sql = `
            SELECT 
              item_number,
              title,
              fcc_id,
              buttons,
              frequency,
              battery,
              keyway,
              chip,
              oem_part_numbers,
              price,
              cost,
              url,
              compatible_vehicles,
              product_type,
              emergency_key,
              image_r2_key,
              year_start,
              year_end
            FROM aks_products_detail
            ${whereClause}
            ORDER BY 
              CASE WHEN title LIKE '%OEM%' THEN 0 ELSE 1 END,
              buttons DESC
            LIMIT 50
          `;

          const result = await env.LOCKSMITH_DB.prepare(sql).bind(...params).all();

          // Build full R2 proxy URLs for images
          const WORKER_BASE = "https://euro-keys.jeremy-samuels17.workers.dev";
          const products = (result.results || []).map((p: any) => {
            // Parse OEM part numbers from JSON string
            let oemParts: string[] = [];
            try {
              if (p.oem_part_numbers) {
                oemParts = JSON.parse(p.oem_part_numbers);
              }
            } catch { oemParts = []; }

            return {
              item_number: p.item_number,
              title: p.title,
              fcc_id: p.fcc_id,
              buttons: p.buttons,
              frequency: p.frequency,
              battery: p.battery,
              keyway: p.keyway,
              chip: p.chip,
              oem_part_numbers: oemParts,
              price: p.price,
              cost: p.cost,
              aks_url: p.url,
              compatible_vehicles: p.compatible_vehicles,
              product_type: p.product_type,
              emergency_key: p.emergency_key,
              year_start: p.year_start,
              year_end: p.year_end,
              image_url: p.image_r2_key
                ? `${WORKER_BASE}/api/r2/${encodeURIComponent(p.image_r2_key)}`
                : null
            };
          });

          return new Response(JSON.stringify({
            query: { make, model, year: year || null, fcc: fccId || null, oem: oem || null },
            total: products.length,
            products
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
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // ==============================================
      // VEHICLE PRODUCTS V2 ENDPOINT - Using New Normalized AKS Tables
      // ==============================================
      // Uses: aks_vehicles_by_year + aks_vehicle_products (junction) + aks_products
      // Returns: Products grouped by type (Smart Key 4-btn, Emergency Blade, etc.)
      //          with aggregated OEM parts per type

      if (path === "/api/vehicle-products-v2") {
        try {
          const make = url.searchParams.get("make") || "";
          const model = url.searchParams.get("model") || "";
          const year = parseInt(url.searchParams.get("year") || "0", 10);

          if (!make || !model || !year) {
            return corsResponse(request, JSON.stringify({ error: "make, model, and year required" }), 400);
          }

          // 1. Get vehicle specs from expanded table
          const vehicleSpecs = await env.LOCKSMITH_DB.prepare(`
            SELECT * FROM aks_vehicles_by_year 
            WHERE LOWER(make) = ? AND LOWER(model) LIKE ? AND year = ?
            LIMIT 1
          `).bind(make.toLowerCase(), `%${model.toLowerCase()}%`, year).first<any>();

          // 2. Get all products for this vehicle via junction table
          const productsResult = await env.LOCKSMITH_DB.prepare(`
            SELECT p.*, vp.section
            FROM aks_vehicle_products vp
            JOIN aks_products p ON vp.product_page_id = p.page_id
            WHERE LOWER(vp.make) = ? 
              AND LOWER(vp.model) LIKE ? 
              AND vp.year = ?
            ORDER BY p.product_type, p.buttons DESC
          `).bind(make.toLowerCase(), `%${model.toLowerCase()}%`, year).all();

          const rawProducts = (productsResult.results || []) as any[];

          // 3. Group products by TYPE (Smart Key 4-btn, Smart Key 5-btn, Emergency Blade, etc.)
          // One card per type with aggregated OEM parts
          const productsByType: Record<string, {
            type_name: string;
            product_type: string;
            buttons: string | null;
            fcc_ids: Set<string>;
            ic_numbers: Set<string>;
            oem_parts: Set<string>;
            cross_refs: Set<string>;
            batteries: Set<string>;
            frequencies: Set<string>;
            keyways: Set<string>;
            price_min: number;
            price_max: number;
            images: string[];
            product_count: number;
            condition_types: Set<string>;
          }> = {};

          for (const p of rawProducts) {
            // Skip packs, shells, and tools
            const title = (p.title || '').toLowerCase();
            if (title.includes('-pack') || title.includes(' pack')) continue;
            if (title.includes('shell') && !title.includes('key')) continue;
            if (p.product_type === 'Tool' || p.product_type === 'Lishi Pick/Decoder') continue;

            // Extract button count
            let buttons: string | null = null;
            const btnMatch = title.match(/(\d)-btn/) || title.match(/(\d)-button/) || title.match(/(\d) btn/);
            if (btnMatch) {
              buttons = btnMatch[1];
            } else if (p.buttons) {
              // Count buttons from L/U/T/RS/P format
              const btnParts = String(p.buttons).split('/');
              buttons = String(btnParts.length);
            }

            // Build type key: "Smart Key 4-Button" or "Emergency Blade" or "Transponder Key"
            const baseType = p.product_type || 'Key';
            let typeKey: string;

            if (baseType === 'Emergency Key' || baseType.includes('Blade') || title.includes('blade') || title.includes('emergency')) {
              typeKey = 'Emergency Blade';
            } else if (baseType === 'Mechanical Key' || title.includes('mechanical')) {
              typeKey = 'Mechanical Key';
            } else if (baseType === 'Transponder Key' || title.includes('transponder')) {
              typeKey = 'Transponder Key';
            } else if (baseType === 'Smart Key' || baseType === 'Remote Keyless Entry' || baseType === 'Remote Head Key') {
              typeKey = buttons ? `${buttons}-Button ${baseType}` : baseType;
            } else if (buttons) {
              typeKey = `${buttons}-Button ${baseType}`;
            } else {
              typeKey = baseType;
            }

            // Initialize group
            if (!productsByType[typeKey]) {
              productsByType[typeKey] = {
                type_name: typeKey,
                product_type: baseType,
                buttons: buttons,
                fcc_ids: new Set(),
                ic_numbers: new Set(),
                oem_parts: new Set(),
                cross_refs: new Set(),
                batteries: new Set(),
                frequencies: new Set(),
                keyways: new Set(),
                price_min: Infinity,
                price_max: 0,
                images: [],
                product_count: 0,
                condition_types: new Set()
              };
            }

            const group = productsByType[typeKey];

            // Aggregate data
            if (p.fcc_id) group.fcc_ids.add(p.fcc_id);
            if (p.ic) group.ic_numbers.add(p.ic);
            if (p.oem_part_number) group.oem_parts.add(p.oem_part_number);
            if (p.cross_ref) {
              // Parse cross refs: "CHRY-1678 (MWK) / RSK-DDG-4205"
              const refs = String(p.cross_ref).split('/').map((r: string) => r.trim());
              refs.forEach((r: string) => group.cross_refs.add(r));
            }
            if (p.battery) group.batteries.add(p.battery);
            if (p.frequency) group.frequencies.add(p.frequency + ' MHz');
            if (p.product_condition) group.condition_types.add(p.product_condition);

            // Price range
            const price = parseFloat(p.price);
            if (!isNaN(price) && price > 0) {
              group.price_min = Math.min(group.price_min, price);
              group.price_max = Math.max(group.price_max, price);
            }

            // Collect images (first 3 per type)
            if (p.image_url && group.images.length < 3) {
              group.images.push(p.image_url);
            }

            group.product_count++;
          }

          // 4. Convert to array and format for frontend
          const groupedProducts = Object.values(productsByType).map(g => ({
            type: g.type_name,
            product_type: g.product_type,
            buttons: g.buttons,
            fcc_ids: Array.from(g.fcc_ids).slice(0, 5),
            ic_numbers: Array.from(g.ic_numbers).slice(0, 3),
            oem_parts: Array.from(g.oem_parts).slice(0, 10),
            cross_refs: Array.from(g.cross_refs).slice(0, 5),
            battery: Array.from(g.batteries)[0] || null,
            frequency: Array.from(g.frequencies)[0] || null,
            price_range: g.price_min < Infinity ? {
              min: g.price_min,
              max: g.price_max,
              display: g.price_min === g.price_max
                ? `$${g.price_min.toFixed(2)}`
                : `$${g.price_min.toFixed(2)} - $${g.price_max.toFixed(2)}`
            } : null,
            images: g.images,
            product_count: g.product_count,
            conditions: Array.from(g.condition_types)
          }));

          // Sort: Smart Keys first (by button count desc), then blades/mechanical last
          const typeOrder: Record<string, number> = {
            'Smart Key': 1, 'Remote Head Key': 2, 'Remote Keyless Entry': 3,
            'Flip Blade': 4, 'Transponder Key': 5, 'Mechanical Key': 6, 'Emergency Blade': 7
          };
          groupedProducts.sort((a, b) => {
            const orderA = typeOrder[a.product_type] || 10;
            const orderB = typeOrder[b.product_type] || 10;
            if (orderA !== orderB) return orderA - orderB;
            // Within same type, sort by button count descending
            return (parseInt(b.buttons || '0') || 0) - (parseInt(a.buttons || '0') || 0);
          });

          // 5. Build response
          const response = {
            query: { make, model, year },
            vehicle_specs: vehicleSpecs ? {
              code_series: vehicleSpecs.code_series,
              mechanical_key: vehicleSpecs.mechanical_key,
              transponder_key: vehicleSpecs.transponder_key,
              lishi_tool: vehicleSpecs.lishi_tool,
              chip_type: vehicleSpecs.chip_type,
              image_url: vehicleSpecs.image_url
            } : null,
            product_types: groupedProducts.length,
            total_products: rawProducts.length,
            products: groupedProducts
          };

          return corsResponse(request, JSON.stringify(response));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // Vehicle Keys endpoint - returns all compatible keys from AKS for a vehicle
      // With Amazon affiliate search links (eurokeys-20)
      // Smart deduplication: groups by FCC+buttons+features, filters multipacks/shells
      if (path === "/api/vehicle-keys") {
        try {
          const make = url.searchParams.get("make") || "";
          const model = url.searchParams.get("model") || "";
          const year = parseInt(url.searchParams.get("year") || "0", 10);
          const showAll = url.searchParams.get("all") === "true"; // Optional: show all variants

          if (!make || !model) {
            return corsResponse(request, JSON.stringify({ error: "make and model required" }), 400);
          }

          const conditions: string[] = ["LOWER(make) = ?"];
          const params: (string | number)[] = [make.toLowerCase()];

          // Handle model matching - allow partial match
          conditions.push("LOWER(model) LIKE ?");
          params.push(`%${model.toLowerCase()}%`);

          // Year filter
          if (year) {
            conditions.push("(year_start IS NULL OR year_start <= ?)");
            conditions.push("(year_end IS NULL OR year_end >= ?)");
            params.push(year, year);
          }

          const whereClause = `WHERE ${conditions.join(" AND ")}`;

          const sql = `
          SELECT DISTINCT
            product_item_num,
            product_title,
            chip,
            frequency,
            battery,
            fcc_id,
            price,
            url,
            year_start,
            year_end
          FROM vehicle_keys
          ${whereClause}
          ORDER BY product_title
          LIMIT 100
        `;

          const result = await env.LOCKSMITH_DB.prepare(sql).bind(...params).all();
          const allRows = result.results || [];

          // === SMART DEDUPLICATION ===

          // selects best representative from each group

          // Filter out multipacks and shells
          const filteredRows = (allRows as any[]).filter((row: any) => {
            const title = row.product_title || '';
            return !HIDE_PATTERNS.some(pattern => pattern.test(title));
          });

          // Group by key signature
          const keyGroups: Record<string, any[]> = {};
          for (const row of filteredRows) {
            const sig = getKeySignature(row);
            if (!keyGroups[sig]) keyGroups[sig] = [];
            keyGroups[sig].push(row);
          }

          // Select best representative from each group
          // Priority: OEM > Aftermarket, then lowest price
          const uniqueKeys: any[] = [];
          for (const sig of Object.keys(keyGroups)) {
            const variants = keyGroups[sig];
            // Sort: OEM first, then by price
            variants.sort((a, b) => {
              const aAfter = isAftermarket(a.product_title || '');
              const bAfter = isAftermarket(b.product_title || '');
              if (aAfter !== bAfter) return aAfter ? 1 : -1; // OEM first
              return parsePrice(a.price) - parsePrice(b.price); // Then cheapest
            });

            const best = variants[0];
            const prices = variants.map(v => parsePrice(v.price)).filter(p => p < 9999);
            const minPrice = prices.length ? Math.min(...prices) : null;
            const maxPrice = prices.length ? Math.max(...prices) : null;

            uniqueKeys.push({
              ...best,
              key_signature: sig,
              variants_count: variants.length,
              price_range: minPrice !== maxPrice ? { min: minPrice, max: maxPrice } : null,
              button_count: extractButtons(best.product_title || ''),
              features: extractFeatures(best.product_title || ''),
              key_type: extractKeyType(best.product_title || ''),
              is_aftermarket: isAftermarket(best.product_title || '')
            });
          }

          // Sort by: key type (smart first), then button count
          const typeOrder: Record<string, number> = { smart: 1, fobik: 2, rhk: 3, flip: 4, remote: 5, transponder: 6, mechanical: 7, blade: 8, key: 9 };
          uniqueKeys.sort((a, b) => {
            const typeA = typeOrder[a.key_type] || 10;
            const typeB = typeOrder[b.key_type] || 10;
            if (typeA !== typeB) return typeA - typeB;
            return (b.button_count || 0) - (a.button_count || 0); // More buttons first
          });

          // Generate Amazon affiliate search URLs
          const AFFILIATE_TAG = "eurokeys-20";
          const keysWithAmazon = uniqueKeys.map((row: any) => {
            const searchTerms: string[] = [];
            searchTerms.push(make);
            if (model) searchTerms.push(model);
            searchTerms.push("key");
            if (row.fcc_id) searchTerms.push(row.fcc_id);
            if (row.chip && row.chip !== "No" && row.chip !== "None") searchTerms.push(row.chip);

            const searchQuery = searchTerms.join(" ");
            const amazonUrl = `https://www.amazon.com/s?k=${encodeURIComponent(searchQuery)}&tag=${AFFILIATE_TAG}`;

            return {
              ...row,
              amazon_search_url: amazonUrl,
              amazon_affiliate_tag: AFFILIATE_TAG
            };
          });

          return new Response(JSON.stringify({
            vehicle: { make, model, year: year || null },
            total: keysWithAmazon.length,
            total_variants: allRows.length,
            keys: keysWithAmazon
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
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // FCC Database endpoint - uses fcc_registry (with AKS images) + fcc_cross_reference for vehicles
      if (path === "/api/fcc") {
        try {
          const q = url.searchParams.get("q")?.toLowerCase() || "";
          const limit = Math.min(parseInt(url.searchParams.get("limit") || "100", 10) || 100, 500);
          const offset = parseInt(url.searchParams.get("offset") || "0", 10) || 0;

          // Build where clause for fcc_complete (pre-computed table)
          let whereClause = `WHERE 1=1`;
          const params: string[] = [];

          if (q) {
            whereClause += ` AND (LOWER(fcc_id) LIKE ? OR LOWER(vehicles) LIKE ? OR LOWER(chip) LIKE ?)`;
            params.push(`%${q}%`, `%${q}%`, `%${q}%`);
          }

          // Simple query from pre-computed fcc_complete table
          // Includes fallback to aks_products.image_url when R2 image is missing
          const sql = `
          SELECT 
            fc.fcc_id,
            fc.frequency,
            fc.chip,
            fc.key_type,
            fc.vehicles,
            fc.vehicle_count,
            fc.image_r2_key,
            (SELECT p.image_url FROM aks_products p 
             WHERE p.fcc_id LIKE '%' || fc.fcc_id || '%' 
             AND p.image_url IS NOT NULL AND p.image_url != '' 
             LIMIT 1) as fallback_image
          FROM fcc_complete fc
          ${whereClause}
          ORDER BY fc.fcc_id
          LIMIT ? OFFSET ?
        `;

          // Count query
          const countSql = `SELECT COUNT(*) as cnt FROM fcc_complete ${whereClause}`;
          const countResult = await env.LOCKSMITH_DB.prepare(countSql).bind(...params).first<{ cnt: number }>();
          const total = countResult?.cnt || 0;

          const dataResult = await env.LOCKSMITH_DB.prepare(sql).bind(...params, limit, offset).all();

          // Transform to include image URLs (R2 preferred, fallback to AKS CDN, then orphan map)
          const WORKER_BASE = "https://euro-keys.jeremy-samuels17.workers.dev";

          // Hardcoded fallback for orphan FCC IDs not in AKS catalog (from research docs)
          const ORPHAN_IMAGE_FALLBACKS: Record<string, string> = {
            'IYZ-AK2': 'https://i.ebayimg.com/images/g/ZX4AAOSwBIxnnykc/s-l1600.jpg',
            'IYZ-MS2': 'https://i.ebayimg.com/images/g/a0wAAOSwW55hyPhf/s-l1600.jpg',
            'IYZ-MS5': 'https://i.ebayimg.com/images/g/C7IAAOSwAhpnV6F1/s-l1600.jpg',
            'IYZDC07': 'https://i.ebayimg.com/images/g/ZhkAAOSwR1VbLh0O/s-l1600.jpg',
            'NBGDM3': 'https://i.ebayimg.com/images/g/qbsAAOSwFQhnrBns/s-l1600.jpg',
            'HUF5661': 'https://i.ebayimg.com/images/g/rMgAAOxy0xBMEknQ/s-l1600.jpg',
            'CWTWBU619': 'https://i.ebayimg.com/images/g/hkcAAOSwU~VnBnfj/s-l1600.jpg',
            'AB01602T': 'https://i.ebayimg.com/images/g/y84AAOSwK6RkT80f/s-l1600.jpg',
            'L2C0005T': 'https://i.ebayimg.com/images/g/fToAAOSwNTZmNdmq/s-l1600.jpg',
            'LHJ009': 'https://i.ebayimg.com/images/g/4REAAOSW1LxmhJXg/s-l1600.jpg',
            'KBRASTU10': 'https://i.ebayimg.com/images/g/DZ4AAOSwQixeOxrL/s-l1600.jpg',
            'GOH-PCGEN2': 'https://i.ebayimg.com/images/g/k8oAAOSwKTRlQM8n/s-l1600.jpg',
            'G0H-PCGEN2': 'https://i.ebayimg.com/images/g/k8oAAOSwKTRlQM8n/s-l1600.jpg',
            'MLBHLIK-1TA': 'https://i.ebayimg.com/images/g/NjkAAOSw3dBeUtLs/s-l1600.jpg',
            'KR5V2X-V44': 'https://i.ebayimg.com/images/g/7fIAAOSwX6VlAlmN/s-l1600.jpg',
          };

          const rows = ((dataResult.results || []) as any[]).map(row => ({
            ...row,
            image_url: row.image_r2_key
              ? `${WORKER_BASE}/api/r2/${encodeURIComponent(row.image_r2_key)}`
              : row.fallback_image || ORPHAN_IMAGE_FALLBACKS[row.fcc_id] || null
          }));

          return new Response(JSON.stringify({ total, rows }), {
            headers: {
              "content-type": "application/json",
              "Cache-Control": "public, max-age=300",
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "GET, OPTIONS",
              "Access-Control-Allow-Headers": "*",
            },
          });
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }


      // FCC Detail endpoint - returns all OEM parts with ASINs for a specific FCC ID
      if (path.startsWith("/api/fcc-detail/")) {
        try {
          const fccId = decodeURIComponent(path.split("/").pop() || "");
          if (!fccId) {
            return corsResponse(request, JSON.stringify({ error: "FCC ID required" }), 400);
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
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
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
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
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
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
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
            return corsResponse(request, JSON.stringify({ error: "make or fcc required" }), 400);
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
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
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
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
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
          return corsResponse(request, JSON.stringify({ rows: result.results || [] }), 200);
        } catch (e: any) {
          return corsResponse(request, JSON.stringify({ error: e.message }), 500);
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
          return corsResponse(request, JSON.stringify({ rows: result.results || [] }), 200);
        } catch (e: any) {
          return corsResponse(request, JSON.stringify({ error: e.message }), 500);
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

          // Enrich with Make Assets AND Vehicle Research Data
          const enrichedRows = [];
          for (const row of (result.results || []) as any[]) {
            const makeKey = (row.make || "").toLowerCase();
            const modelKey = (row.model || "").toLowerCase();

            // Add static make assets (infographics, PDFs)
            const staticAssets = MAKE_ASSETS[makeKey];
            const enrichedRow = staticAssets ? { ...row, assets: staticAssets } : { ...row };

            // NEW: Fetch dynamic images from guide_assets table
            try {
              const guideAssets = await env.LOCKSMITH_DB.prepare(`
              SELECT asset_type, asset_url, caption, display_order, source_doc
              FROM guide_assets 
              WHERE LOWER(make) = ? OR make = '_GENERAL'
              ORDER BY display_order
              LIMIT 20
            `).bind(makeKey).all();

              if (guideAssets.results && guideAssets.results.length > 0) {
                enrichedRow.guide_images = guideAssets.results;
              }
            } catch (e) {
              // Silently continue if guide_assets fetch fails
              console.error("Guide assets fetch failed:", e);
            }

            // ENRICHMENT: Fetch research intel from vehicles table
            try {
              const vehicleIntel = await env.LOCKSMITH_DB.prepare(`
              SELECT 
                rf_system,
                vin_ordered,
                dealer_tool_only,
                part_number_prefix,
                service_notes_pro,
                chip,
                fcc_id,
                oem_part_number,
                programming_method
              FROM vehicles 
              WHERE LOWER(make) = ? 
                AND LOWER(model) LIKE ?
                AND (rf_system IS NOT NULL OR vin_ordered = 1 OR dealer_tool_only IS NOT NULL)
              ORDER BY year_end DESC
              LIMIT 1
            `).bind(makeKey, `%${modelKey}%`).first<any>();

              if (vehicleIntel) {
                // Merge research intel into guide
                enrichedRow.rf_system = vehicleIntel.rf_system;
                enrichedRow.vin_ordered = vehicleIntel.vin_ordered;
                enrichedRow.dealer_tool_only = vehicleIntel.dealer_tool_only;
                enrichedRow.part_number_prefix = vehicleIntel.part_number_prefix;
                enrichedRow.vehicle_warnings = vehicleIntel.service_notes_pro;
                enrichedRow.chip = vehicleIntel.chip;
                enrichedRow.fcc_id = vehicleIntel.fcc_id;
                enrichedRow.oem_part_number = vehicleIntel.oem_part_number;
                enrichedRow.programming_method = vehicleIntel.programming_method;
              }
            } catch (e) {
              // Silently continue if enrichment fails
              console.error("Guide enrichment failed:", e);
            }

            enrichedRows.push(enrichedRow);
          }

          const rows = enrichedRows;

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
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
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
            return corsResponse(request, JSON.stringify({ error: "Asset key required" }), 400);
          }

          const object = await env.ASSETS_BUCKET.get(key);

          if (!object) {
            return corsResponse(request, "Asset not found", 404);
          }

          const headers = new Headers();
          object.writeHttpMetadata(headers);
          headers.set("etag", object.httpEtag);
          headers.set("Cache-Control", "public, max-age=31536000"); // Cache for 1 year
          headers.set("Access-Control-Allow-Origin", "*");

          return new Response(object.body, { headers });
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message || "Failed to fetch asset" }), 500);
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
            return corsResponse(request, JSON.stringify({ error: "Invalid vehicle ID" }), 400);
          }

          // Get vehicle info from lookup table
          const vehicle = await env.LOCKSMITH_DB.prepare(
            "SELECT * FROM vehicles WHERE id = ?"
          ).bind(vehicleId).first<any>();

          if (!vehicle) {
            return corsResponse(request, JSON.stringify({ error: "Vehicle not found" }), 404);
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
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // Get all vehicles that use a specific FCC ID (for FCC -> Browse linking)
      if (path.startsWith("/api/vehicles-by-fcc/")) {
        try {
          const fccId = decodeURIComponent(path.split("/").pop() || "");
          if (!fccId) {
            return corsResponse(request, JSON.stringify({ error: "FCC ID required" }), 400);
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
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // Get Lishi tools compatible with a specific keyway (for Browse -> Tools linking)
      if (path.startsWith("/api/tools-by-keyway/")) {
        try {
          const keywayParam = decodeURIComponent(path.split("/").pop() || "");
          if (!keywayParam) {
            return corsResponse(request, JSON.stringify({ error: "Keyway required" }), 400);
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
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
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
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
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
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
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
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
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
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
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
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
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
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
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
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
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
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
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
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      // ============ STRIPE SUBSCRIPTION ENDPOINTS ============

      // Create Stripe Checkout Session
      if (path === "/api/create-checkout-session" && request.method === "POST") {
        try {
          const body = await request.json() as { userId?: string; email?: string; plan: string };
          let { userId, email, plan } = body;

          // Try to get authenticated user if session exists
          const cookieHeader = request.headers.get("Cookie");
          const sessionToken = cookieHeader?.split(';').find(c => c.trim().startsWith('session='))?.split('=')[1];
          if (sessionToken) {
            const payload = await verifyInternalToken(sessionToken, env.JWT_SECRET || 'dev-secret');
            if (payload) {
              userId = userId || payload.sub as string;
              email = email || payload.email as string;
            }
          }

          // Fallback for plan if missing (default to monthly)
          if (!plan) plan = 'monthly';

          if (!userId || !email || !plan) {
            const missing = [];
            if (!userId) missing.push("userId");
            if (!email) missing.push("email");
            if (!plan) missing.push("plan");

            // Return the keys present in the body to help debug
            const bodyKeys = Object.keys(body || {}).join(", ");
            return corsResponse(request, JSON.stringify({
              error: `Missing fields: ${missing.join(", ")} (Found in body: ${bodyKeys || 'none'})`
            }), 400);
          }

          // Plan pricing configuration (in cents)
          const plans: Record<string, { name: string; amount: number; mode: string; interval?: string }> = {
            monthly: { name: "EuroKeys Pro Monthly", amount: 999, mode: "subscription", interval: "month" },
            annual: { name: "EuroKeys Pro Annual", amount: 7999, mode: "subscription", interval: "year" },
            lifetime: { name: "EuroKeys Pro Lifetime", amount: 14999, mode: "payment" }
          };

          const selectedPlan = plans[plan];
          if (!selectedPlan) {
            return corsResponse(request, JSON.stringify({ error: "Invalid plan" }), 400);
          }

          // Build checkout session body using price_data (inline pricing)
          const bodyParams: Record<string, string> = {
            "mode": selectedPlan.mode,
            "success_url": "https://eurokeys.app/?subscription=success",
            "cancel_url": "https://eurokeys.app/?subscription=canceled",
            "customer_email": email,
            "client_reference_id": userId,
            "line_items[0][quantity]": "1",
            "line_items[0][price_data][currency]": "usd",
            "line_items[0][price_data][product_data][name]": selectedPlan.name,
            "line_items[0][price_data][unit_amount]": String(selectedPlan.amount),
            "metadata[userId]": userId,
            "metadata[plan]": plan,
          };

          // Add recurring interval for subscriptions
          if (selectedPlan.interval) {
            bodyParams["line_items[0][price_data][recurring][interval]"] = selectedPlan.interval;
          }

          // Create Stripe Checkout Session via API
          const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${env.STRIPE_SECRET_KEY}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams(bodyParams),
          });

          const session = await stripeResponse.json() as { url?: string; error?: { message: string } };

          if (!stripeResponse.ok || session.error) {
            return corsResponse(request, JSON.stringify({ error: session.error?.message || "Stripe error" }), 500);
          }

          return corsResponse(request, JSON.stringify({ url: session.url }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
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

          return corsResponse(request, JSON.stringify({ received: true }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 400);
        }
      }

      // Get Subscription Status
      if (path === "/api/subscription-status") {
        try {
          const userId = url.searchParams.get("userId");

          if (!userId) {
            return corsResponse(request, JSON.stringify({ error: "Missing userId" }), 400);
          }

          const result = await env.LOCKSMITH_DB.prepare(`
          SELECT plan, status, current_period_end 
          FROM subscriptions 
          WHERE user_id = ?
        `).bind(userId).first() as { plan: string; status: string; current_period_end: number } | null;

          if (!result) {
            return corsResponse(request, JSON.stringify({ isPro: false, plan: null }));
          }

          const now = Math.floor(Date.now() / 1000);
          const isActive = result.status === "active" && result.current_period_end > now;

          return corsResponse(request, JSON.stringify({
            isPro: isActive,
            plan: isActive ? result.plan : null,
            expiresAt: isActive ? result.current_period_end : null
          }));
        } catch (err: any) {
          return corsResponse(request, JSON.stringify({ error: err.message }), 500);
        }
      }

      return corsResponse(request, JSON.stringify({ error: "Not found" }), 404);
    } catch (err: any) {
      const errorMessage = err.stack || err.message || String(err);
      console.error("Critical Worker Error:", errorMessage);
      return corsResponse(request, JSON.stringify({
        error: "Critical Worker Error",
        details: errorMessage
      }), 500);
    }
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

    // 3. Call OpenRouter (DeepSeek-V3)
    const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer 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`,
        "HTTP-Referer": "https://eurokeys.app",
        "X-Title": "Euro Keys Business Analyst",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "deepseek/deepseek-v3.2",
        "messages": [
          { "role": "system", "content": "You are a high-performance business growth consultant for a professional automotive locksmith. Your goal is to maximize revenue, identify high-margin opportunities, and push sales. Output JSON only." },
          { "role": "user", "content": prompt }
        ],
        "response_format": { "type": "json_object" }
      })
    });

    if (!aiResponse.ok) {
      throw new Error(`OpenRouter API error: ${aiResponse.status}`);
    }

    const aiData: any = await aiResponse.json();
    const responseContent = aiData.choices[0].message.content;
    let content = "Analysis complete.";
    let recommendations: any[] = [];

    try {
      const parsed = JSON.parse(responseContent);
      content = parsed.message || "Business analysis updated.";
      if (parsed.client_strategy) content += "\n\n**Sales Strategy:** " + parsed.client_strategy;
      if (parsed.financial_tip) content += "\n\n**Revenue Maximization:** " + parsed.financial_tip;
      recommendations = parsed.restock_recommendations || [];
    } catch (e) {
      content = responseContent;
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
