import fs from "fs";
import zlib from "zlib";
import { parse } from "csv-parse/sync";
import { parse as parseStream } from "csv-parse";

// Read a small/medium .csv or .csv.gz fully into an array of row objects.
export function readCsv(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`CSV not found: ${filePath}`);
  let buf = fs.readFileSync(filePath);
  if (filePath.endsWith(".gz")) buf = zlib.gunzipSync(buf);
  return parse(buf, { columns: true, skip_empty_lines: true, trim: true });
}

// Stream a large (possibly gzipped) CSV row-by-row — low memory. Use for chartevents.
// Calls onRow(row) per record; resolves with the number of rows scanned.
export function streamCsv(filePath, onRow) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(filePath))
      return reject(new Error(`CSV not found: ${filePath}`));
    const parser = parseStream({
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
    let count = 0;
    parser.on("readable", () => {
      let r;
      while ((r = parser.read()) !== null) {
        onRow(r);
        count++;
      }
    });
    parser.on("error", reject);
    parser.on("end", () => resolve(count));
    let stream = fs.createReadStream(filePath);
    if (filePath.endsWith(".gz")) stream = stream.pipe(zlib.createGunzip());
    stream.on("error", reject);
    stream.pipe(parser);
  });
}

export function assertColumns(rows, required, tableName) {
  if (rows.length === 0) throw new Error(`${tableName}: file has no rows`);
  const have = new Set(Object.keys(rows[0]));
  const missing = required.filter((c) => !have.has(c));
  if (missing.length)
    throw new Error(`${tableName}: missing columns: ${missing.join(", ")}`);
}

// UTC-tagged for deterministic ordering; record-relative, never real calendar dates.
export function parseMimicTime(value) {
  if (value == null || value === "") return null;
  const s = String(value).trim();
  if (s === "") return null;
  const iso = s.includes(" ")
    ? s.replace(" ", "T") + "Z"
    : s.length === 10
      ? s + "T00:00:00Z"
      : s + "Z";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function toNumberOrNull(value) {
  if (value === undefined || value === null || value === "") return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}
