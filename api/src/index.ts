// Cloudflare Worker to serve master locksmith data from KV
// Exposes:
//   GET /api/master               -> full list (JSON)
//   GET /api/master.csv           -> full CSV
//   GET /api/master?make=...&model=...&year=...&immo=...&fcc=... -> filtered JSON
//   (legacy aliases) /api/locksmith, /api/locksmith.csv
// Uses KV key: "master_locksmith.csv"

export interface Env {
  LOCKSMITH_KV: KVNamespace;
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

async function fetchCsv(env: Env): Promise<string> {
  const csv = await env.LOCKSMITH_KV.get("master_locksmith.csv");
  if (!csv) throw new Error("CSV not found in KV (master_locksmith.csv)");
  return csv;
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
        const csv = await fetchCsv(env);
        const rows = parseCsv(csv);
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

    return textResponse(JSON.stringify({ error: "Not found" }), 404);
  },
};

