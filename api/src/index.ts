// Cloudflare Worker to serve master locksmith data from D1
// Exposes:
//   GET /api/master               -> full list (JSON)
//   GET /api/master?make=...&model=...&year=...&immo=...&fcc=... -> filtered JSON
//   (legacy aliases) /api/locksmith
// Uses D1 Database: locksmith_data

export interface Env {
  LOCKSMITH_KV: KVNamespace;
  LOCKSMITH_DB: D1Database;
}

function textResponse(body: string, status = 200, contentType = "application/json") {
  return new Response(body, {
    status,
    headers: {
      "Content-Type": contentType,
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") {
      return textResponse("", 204);
    }

    const path = url.pathname;

    // Master Locksmith Data Endpoint - Migrated to D1
    // Unified with /api/browse but supports more legacy filters
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

        if (make) {
          conditions.push("(LOWER(make) = ? OR LOWER(make_norm) = ?)");
          params.push(make, make);
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
        if (immo) {
          conditions.push("(LOWER(immobilizer_system) LIKE ? OR LOWER(immobilizer_system_specific) LIKE ?)");
          params.push(`%${immo}%`, `%${immo}%`);
        }
        if (fcc) {
          conditions.push("LOWER(fcc_id) LIKE ?");
          params.push(`%${fcc}%`);
        }
        if (q) {
          conditions.push("(LOWER(make) LIKE ? OR LOWER(model) LIKE ? OR LOWER(immobilizer_system) LIKE ? OR LOWER(fcc_id) LIKE ? OR LOWER(notes) LIKE ?)");
          params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

        // Get total count
        const countSql = `SELECT COUNT(*) as cnt FROM locksmith_data ${whereClause}`;
        const countResult = await env.LOCKSMITH_DB.prepare(countSql).bind(...params).first<{ cnt: number }>();
        const total = countResult?.cnt || 0;

        // Get paginated rows
        const dataSql = `SELECT * FROM locksmith_data ${whereClause} ORDER BY make, model, year LIMIT ? OFFSET ?`;
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

    // Lightweight immobilizer endpoint - now uses D1 for fast queries
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

        // Build SQL query with parameters
        const conditions: string[] = [];
        const params: (string | number)[] = [];

        if (make) {
          conditions.push("(LOWER(make) = ? OR LOWER(make_norm) = ?)");
          params.push(make, make);
        }
        if (model) {
          conditions.push("LOWER(model) LIKE ?");
          params.push(`%${model}%`);
        }
        if (q) {
          conditions.push("(LOWER(make) LIKE ? OR LOWER(model) LIKE ? OR LOWER(immobilizer_system) LIKE ? OR LOWER(immobilizer_system_specific) LIKE ? OR LOWER(notes) LIKE ?)");
          params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
        }
        // Only include rows with immobilizer data
        conditions.push("(immobilizer_system IS NOT NULL AND immobilizer_system != '')");

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

        // Get total count
        const countSql = `SELECT COUNT(*) as cnt FROM locksmith_data ${whereClause}`;
        const countResult = await env.LOCKSMITH_DB.prepare(countSql).bind(...params).first<{ cnt: number }>();
        const total = countResult?.cnt || 0;

        // Get paginated rows
        const dataSql = `SELECT make, model, year, compat_year_min, compat_year_max, immobilizer_system, immobilizer_system_specific, key_type, key_category, notes FROM locksmith_data ${whereClause} ORDER BY make, model, year LIMIT ? OFFSET ?`;
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

    // Browse Database endpoint - uses D1 for fast queries
    if (path === "/api/browse") {
      try {
        const year = url.searchParams.get("year");
        const make = url.searchParams.get("make")?.toLowerCase() || "";
        const model = url.searchParams.get("model")?.toLowerCase() || "";
        const limit = Math.min(parseInt(url.searchParams.get("limit") || "100", 10) || 100, 500);
        const offset = parseInt(url.searchParams.get("offset") || "0", 10) || 0;

        const conditions: string[] = []; // Show all data (removed needs_enrichment filter)
        const params: (string | number)[] = [];

        if (year) {
          conditions.push("year = ?");
          params.push(parseInt(year, 10));
        }
        if (make) {
          conditions.push("(LOWER(make) = ? OR LOWER(make_norm) = ?)");
          params.push(make, make);
        }
        if (model) {
          conditions.push("LOWER(model) LIKE ?");
          params.push(`%${model}%`);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

        const countResult = await env.LOCKSMITH_DB.prepare(`SELECT COUNT(*) as cnt FROM locksmith_data ${whereClause}`).bind(...params).first<{ cnt: number }>();
        const total = countResult?.cnt || 0;

        const dataSql = `SELECT * FROM locksmith_data ${whereClause} ORDER BY make, model, year LIMIT ? OFFSET ?`;
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

    // FCC Database endpoint - grouped by FCC ID, uses D1
    if (path === "/api/fcc") {
      try {
        const q = url.searchParams.get("q")?.toLowerCase() || "";
        const limit = Math.min(parseInt(url.searchParams.get("limit") || "100", 10) || 100, 500);
        const offset = parseInt(url.searchParams.get("offset") || "0", 10) || 0;

        let whereClause = "WHERE fcc_id IS NOT NULL AND fcc_id != ''"; // Removed needs_enrichment filter
        const params: string[] = [];

        if (q) {
          whereClause += " AND (LOWER(fcc_id) LIKE ? OR LOWER(make) LIKE ? OR LOWER(model) LIKE ? OR LOWER(chip) LIKE ?)";
          params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
        }

        // Get unique FCC IDs with aggregated data
        const sql = `
          SELECT 
            fcc_id,
            frequency_mhz,
            chip,
            GROUP_CONCAT(DISTINCT make || ' ' || model || ' (' || year || ')') as vehicles,
            COUNT(*) as vehicle_count
          FROM locksmith_data 
          ${whereClause}
          GROUP BY fcc_id
          ORDER BY fcc_id
          LIMIT ? OFFSET ?
        `;

        const countSql = `SELECT COUNT(DISTINCT fcc_id) as cnt FROM locksmith_data ${whereClause}`;
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

    return textResponse(JSON.stringify({ error: "Not found" }), 404);
  },
};
