// Cloudflare Worker to serve master locksmith data from KV
// Exposes:
//   GET /api/master               -> full list (JSON)
//   GET /api/master.csv           -> full CSV
//   GET /api/master?make=...&model=...&year=...&immo=...&fcc=... -> filtered JSON
//   (legacy aliases) /api/locksmith, /api/locksmith.csv
// Uses KV key: "master_locksmith.csv"

export interface Env {
  LOCKSMITH_KV: KVNamespace;
  LOCKSMITH_DB: D1Database;
}

let cachedCsv = "";
let cachedRows: Record<string, string>[] | null = null;
let cachedAt = 0;
const CACHE_MS = 5 * 60 * 1000;

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

async function fetchCsv(env: Env): Promise<string> {
  if (cachedCsv && Date.now() - cachedAt < CACHE_MS) return cachedCsv;
  const csv = await env.LOCKSMITH_KV.get("master_locksmith.csv");
  if (!csv) throw new Error("CSV not found in KV (master_locksmith.csv)");
  cachedCsv = csv;
  cachedAt = Date.now();
  return csv;
}

async function fetchRows(env: Env): Promise<Record<string, string>[]> {
  if (cachedRows && Date.now() - cachedAt < CACHE_MS) return cachedRows;
  const csv = await fetchCsv(env);
  cachedRows = parseCsv(csv);
  return cachedRows;
}

function parseCsv(csv: string): Record<string, string>[] {
  const [headerLine, ...rows] = csv.split(/\r?\n/);
  const headers = headerLine.split(",");
  return rows
    .filter((r) => r.trim().length > 0)
    .map((r) => {
      const parts: string[] = [];
      let current = "";
      let inQuotes = false;
      for (let i = 0; i < r.length; i++) {
        const ch = r[i];
        if (ch === '"') {
          // toggle inQuotes unless escaped
          if (inQuotes && r[i + 1] === '"') {
            current += '"';
            i++; // skip next quote
          } else {
            inQuotes = !inQuotes;
          }
        } else if (ch === ',' && !inQuotes) {
          parts.push(current);
          current = "";
        } else {
          current += ch;
        }
      }
      parts.push(current);
      const obj: Record<string, string> = {};
      headers.forEach((h, idx) => {
        obj[h] = parts[idx] ?? "";
      });
      return obj;
    });
}

function filterRows(rows: Record<string, string>[], params: URLSearchParams) {
  const make = params.get("make")?.toLowerCase();
  const model = params.get("model")?.toLowerCase();
  const year = params.get("year");
  const immo = params.get("immo")?.toLowerCase();
  const fcc = params.get("fcc")?.toLowerCase();
  const q = params.get("q")?.toLowerCase();

  return rows.filter((row) => {
    if (make && row.make?.toLowerCase() !== make && row.make_norm?.toLowerCase() !== make) return false;
    if (model && row.model?.toLowerCase() !== model) return false;
    if (year) {
      const y = parseInt(year, 10);
      const ry = parseInt(row.year || "0", 10);
      if (!Number.isNaN(y) && ry !== y) return false;
    }
    if (immo && !(row.immobilizer_system || "").toLowerCase().includes(immo) && !(row.immobilizer_system_specific || "").toLowerCase().includes(immo)) return false;
    if (fcc && !(row.fcc_id || "").toLowerCase().includes(fcc)) return false;
    if (q) {
      const fields = [
        row.make,
        row.make_norm,
        row.model,
        row.immobilizer_system,
        row.immobilizer_system_specific,
        row.notes,
        row.fcc_id,
        row.part_number,
        row.keyway,
        row.keyway_norm,
      ]
        .filter(Boolean)
        .map((s) => s.toLowerCase());
      if (!fields.some((f) => f.includes(q))) return false;
    }
    return true;
  });
}

type ImmoRow = {
  make?: string;
  model?: string;
  year?: string;
  compat_year_min?: string;
  compat_year_max?: string;
  immobilizer_system?: string;
  immobilizer_system_specific?: string;
  module_or_system?: string;
  key_type?: string;
  key_category?: string;
  notes?: string;
};

function buildImmoSlice(rows: Record<string, string>[], params: URLSearchParams) {
  const make = params.get("make")?.toLowerCase() || "";
  const model = params.get("model")?.toLowerCase() || "";
  const q = params.get("q")?.toLowerCase() || "";
  const limit = Math.min(parseInt(params.get("limit") || "300", 10) || 300, 1000);
  const offset = parseInt(params.get("offset") || "0", 10) || 0;

  const filtered: ImmoRow[] = [];
  for (const r of rows) {
    const makeVal = (r.make || r.make_norm || "").toLowerCase();
    if (make && makeVal !== make) continue;
    const modelVal = (r.model || "").toLowerCase();
    if (model && !modelVal.includes(model)) continue;
    if (q) {
      const hay = [
        r.make,
        r.model,
        r.immobilizer_system,
        r.immobilizer_system_specific,
        r.module_or_system,
        r.key_type,
        r.key_category,
        r.notes,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!hay.includes(q)) continue;
    }
    filtered.push({
      make: r.make,
      model: r.model,
      year: r.year,
      compat_year_min: r.compat_year_min,
      compat_year_max: r.compat_year_max,
      immobilizer_system: r.immobilizer_system,
      immobilizer_system_specific: r.immobilizer_system_specific,
      module_or_system: r.module_or_system,
      key_type: r.key_type,
      key_category: r.key_category,
      notes: r.notes,
    });
  }

  const total = filtered.length;
  const sliced = filtered.slice(offset, offset + limit);
  return { total, rows: sliced };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") {
      return textResponse("", 204);
    }

    const path = url.pathname;
    if (path === "/api/master.csv" || path === "/api/locksmith.csv") {
      try {
        const csv = await fetchCsv(env);
        return textResponse(csv, 200, "text/csv");
      } catch (err: any) {
        return textResponse(JSON.stringify({ error: err.message || "failed to load csv" }), 500);
      }
    }

    if (path === "/api/master" || path === "/api/locksmith") {
      try {
        const rows = await fetchRows(env);
        const filtered = filterRows(rows, url.searchParams);
        const total = filtered.length;
        const limit = Math.min(parseInt(url.searchParams.get("limit") || "500", 10) || 500, 2000);
        const offset = parseInt(url.searchParams.get("offset") || "0", 10) || 0;
        const sliced = filtered.slice(offset, offset + limit);
        return textResponse(JSON.stringify({ count: sliced.length, total, rows: sliced }));
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

        const conditions: string[] = ["needs_enrichment = 0"]; // Only show complete data
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

        const whereClause = `WHERE ${conditions.join(" AND ")}`;

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

        let whereClause = "WHERE fcc_id IS NOT NULL AND fcc_id != '' AND needs_enrichment = 0";
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
          },
        });
      } catch (err: any) {
        return textResponse(JSON.stringify({ error: err.message }), 500);
      }
    }

    return textResponse(JSON.stringify({ error: "Not found" }), 404);
  },
};

