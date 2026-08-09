import 'dotenv/config';
import path from 'path';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { connectDB } from '../config/db.js';
import IcuEvent from '../models/IcuEvent.js';
import { readCsv, streamCsv, assertColumns, parseMimicTime, toNumberOrNull } from './lib/csv.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIMIC_DIR = process.env.MIMIC_DIR
  || path.resolve(__dirname, '../../data/mimic-iv-clinical-database-demo-2.2');

const BATCH = 5000;

// Curated vital-sign itemids. Edit this list to widen/narrow what reaches the timeline.
const VITALS = new Set([
  220045,                 // Heart Rate
  220210,                 // Respiratory Rate
  220277,                 // O2 saturation (pulse ox)
  220179, 220180, 220181, // Non-invasive BP: systolic / diastolic / mean
  220050, 220051, 220052, // Arterial BP: systolic / diastolic / mean
  223761, 223762,         // Temperature F / C
  220739, 223900, 223901, // GCS: eye / verbal / motor
]);

function loadItemMeta() {
  const rows = readCsv(path.join(MIMIC_DIR, 'icu', 'd_items.csv.gz'));
  assertColumns(rows, ['itemid', 'label'], 'd_items');
  const map = new Map();
  for (const r of rows) map.set(Number(r.itemid), { label: r.label || null, category: r.category || null });
  return map;
}

async function run() {
  const itemMeta = loadItemMeta();
  const file = path.join(MIMIC_DIR, 'icu', 'chartevents.csv.gz');
  console.log(`Streaming ${file} — keeping ${VITALS.size} vital itemids`);

  const docs = [];
  let kept = 0;
  const scanned = await streamCsv(file, (row) => {
    const itemId = Number(row.itemid);
    if (!VITALS.has(itemId)) return;
    const valueNum = toNumberOrNull(row.valuenum);
    if (valueNum === null) return;              // vitals subset is numeric
    const meta = itemMeta.get(itemId) || {};
    docs.push({
      subjectId: Number(row.subject_id),
      hadmId: toNumberOrNull(row.hadm_id),
      stayId: toNumberOrNull(row.stay_id),
      itemId,
      label: meta.label || null,
      category: meta.category || null,
      chartTime: parseMimicTime(row.charttime),
      value: row.value || null,
      valueNum,
      valueUom: row.valueuom || null,
      source: { table: 'chartevents', file: 'icu/chartevents.csv', labelFrom: 'icu/d_items.csv' },
    });
    kept++;
  });
  console.log(`Scanned ${scanned} chartevents rows, kept ${kept} vitals`);

  await connectDB(process.env.MONGO_URI);
  await IcuEvent.deleteMany({});
  for (let i = 0; i < docs.length; i += BATCH) {
    await IcuEvent.insertMany(docs.slice(i, i + BATCH));
    console.log(`  inserted ${Math.min(i + BATCH, docs.length)}/${docs.length}`);
  }
  const total = await IcuEvent.countDocuments();
  console.log(`ICU events -> scanned=${scanned} kept=${kept} inDb=${total}`);
  await mongoose.disconnect();
}
run().catch((err) => { console.error('Import failed:', err.message); process.exit(1); });