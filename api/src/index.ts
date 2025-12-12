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

        if (make) {
          conditions.push("LOWER(vm.make) = ?");
          params.push(make);
        }
        if (model) {
          conditions.push("LOWER(vm.model) LIKE ?");
          params.push(`%${model}%`);
        }
        if (year) {
          const y = parseInt(year, 10);
          if (!Number.isNaN(y)) {
            conditions.push("vv.year_start <= ? AND vv.year_end >= ?");
            params.push(y, y);
          }
        }
        if (immo) {
          conditions.push("LOWER(vv.immobilizer_system) LIKE ?");
          params.push(`%${immo}%`);
        }
        if (fcc) {
          conditions.push("LOWER(vv.fcc_id) LIKE ?");
          params.push(`%${fcc}%`);
        }
        if (q) {
          conditions.push("(LOWER(vm.make) LIKE ? OR LOWER(vm.model) LIKE ? OR LOWER(vv.immobilizer_system) LIKE ? OR LOWER(vv.fcc_id) LIKE ? OR LOWER(vv.chip) LIKE ?)");
          params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
        }

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

        // Data query with full fields and chip_registry JOIN
        const dataSql = `
          SELECT 
            vm.id, vm.make, vm.model,
            vv.year_start, vv.year_end, vv.key_type, vv.keyway, vv.fcc_id, vv.chip,
            vv.frequency, vv.cloning_possible, vv.obd_program, vv.immobilizer_system,
            vv.lishi_tool, vv.code_series, vv.oem_part_number, vv.aftermarket_part,
            vv.buttons, vv.battery, vv.emergency_key, vv.programmer, vv.programming_method,
            vv.pin_required, vv.notes,
            cr.technology as chip_technology, cr.bits as chip_bits, cr.description as chip_description
          FROM vehicles_master vm
          LEFT JOIN vehicle_variants vv ON vm.id = vv.vehicle_id
          LEFT JOIN chip_registry cr ON LOWER(vv.chip) = LOWER(cr.chip_type)
          ${whereClause}
          ORDER BY vm.make, vm.model, vv.year_start
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

        if (make) {
          conditions.push("LOWER(vm.make) = ?");
          params.push(make);
        }
        if (model) {
          conditions.push("LOWER(vm.model) LIKE ?");
          params.push(`%${model}%`);
        }
        if (year) {
          const y = parseInt(year, 10);
          conditions.push("vv.year_start <= ? AND vv.year_end >= ?");
          params.push(y, y);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

        // Count query
        const countSql = `
          SELECT COUNT(DISTINCT vm.id) as cnt 
          FROM vehicles_master vm
          LEFT JOIN vehicle_variants vv ON vm.id = vv.vehicle_id
          ${whereClause}
        `;
        const countResult = await env.LOCKSMITH_DB.prepare(countSql).bind(...params).first<{ cnt: number }>();
        const total = countResult?.cnt || 0;

        // Data query - join master, variants, and chip_registry for complete data
        const dataSql = `
          SELECT 
            vm.id,
            vm.make,
            vm.model,
            vv.year_start,
            vv.year_end,
            vv.key_type,
            vv.keyway,
            vv.fcc_id,
            vv.chip,
            vv.frequency,
            vv.cloning_possible,
            vv.obd_program,
            vv.immobilizer_system,
            vv.lishi_tool,
            vv.code_series,
            vv.oem_part_number,
            vv.aftermarket_part,
            vv.buttons,
            vv.battery,
            vv.emergency_key,
            vv.programmer,
            vv.programming_method,
            vv.pin_required,
            vv.notes,
            cr.technology as chip_technology,
            cr.bits as chip_bits,
            cr.description as chip_description
          FROM vehicles_master vm
          LEFT JOIN vehicle_variants vv ON vm.id = vv.vehicle_id
          LEFT JOIN chip_registry cr ON LOWER(vv.chip) = LOWER(cr.chip_type)
          ${whereClause}
          ORDER BY vm.make, vm.model, vv.year_start
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

    // FCC Database endpoint - uses fcc_registry + vehicle_variants
    if (path === "/api/fcc") {
      try {
        const q = url.searchParams.get("q")?.toLowerCase() || "";
        const limit = Math.min(parseInt(url.searchParams.get("limit") || "100", 10) || 100, 500);
        const offset = parseInt(url.searchParams.get("offset") || "0", 10) || 0;

        let whereClause = "WHERE vv.fcc_id IS NOT NULL AND vv.fcc_id != ''";
        const params: string[] = [];

        if (q) {
          whereClause += " AND (LOWER(vv.fcc_id) LIKE ? OR LOWER(vm.make) LIKE ? OR LOWER(vm.model) LIKE ? OR LOWER(vv.chip) LIKE ?)";
          params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
        }

        // Get unique FCC IDs with aggregated data from vehicle_variants
        const sql = `
          SELECT 
            vv.fcc_id,
            vv.frequency,
            vv.chip,
            GROUP_CONCAT(DISTINCT vm.make || ' ' || vm.model || ' (' || vv.year_start || '-' || vv.year_end || ')') as vehicles,
            COUNT(*) as vehicle_count
          FROM vehicle_variants vv
          JOIN vehicles_master vm ON vv.vehicle_id = vm.id
          ${whereClause}
          GROUP BY vv.fcc_id
          ORDER BY vv.fcc_id
          LIMIT ? OFFSET ?
        `;

        const countSql = `
          SELECT COUNT(DISTINCT vv.fcc_id) as cnt 
          FROM vehicle_variants vv
          JOIN vehicles_master vm ON vv.vehicle_id = vm.id
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

        return new Response(JSON.stringify({ rows: result.results || [] }), {
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

    return textResponse(JSON.stringify({ error: "Not found" }), 404);
  },
};
