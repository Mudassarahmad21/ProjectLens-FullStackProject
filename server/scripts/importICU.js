import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from '../config/db.js';
import ICUStay from '../models/ICUStay.js';
import ICUEvent from '../models/ICUEvent.js';
import Admission from '../models/Admission.js';
import { readCsv, assertColumns, streamCsv, parseMimicTime, toNumberOrNull } from './lib/csv.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIMIC_DIR = process.env.MIMIC_DIR
  || path.resolve(__dirname, '../../data/mimic-iv-clinical-database-demo-2.2');

// Vitals allowlist (itemid, as strings — CSV values are strings). Tunable.
const VITALS = new Set([
  '220045', // Heart Rate
  '220210', // Respiratory Rate
  '220277', // O2 saturation pulseoxymetry
  '220179', // Non Invasive BP systolic
  '220180', // Non Invasive BP diastolic
  '220050', // Arterial BP systolic
  '220051', // Arterial BP diastolic
  '223761', // Temperature Fahrenheit
  '223762', // Temperature Celsius
]);

async function insertInChunks(Model, docs, size = 5000) {
  for (let i = 0; i < docs.length; i += size) {
    await Model.insertMany(docs.slice(i, i + size));
    process.stdout.write(`  inserted ${Math.min(i + size, docs.length)}/${docs.length}\r`);
  }
  if (docs.length) process.stdout.write('\n');
}

async function importStays() {
  const file = path.join(MIMIC_DIR, 'icu', 'icustays.csv.gz');
  console.log(`Reading ${file}`);
  const rows = readCsv(file);
  assertColumns(rows, ['subject_id', 'hadm_id', 'stay_id', 'first_careunit',
                       'last_careunit', 'intime', 'outtime', 'los'], 'icustays');
  const docs = rows.map(r => ({
    subjectId: Number(r.subject_id),
    hadmId: Number(r.hadm_id),
    stayId: Number(r.stay_id),
    firstCareUnit: r.first_careunit || null,
    lastCareUnit: r.last_careunit || null,
    inTime: parseMimicTime(r.intime),
    outTime: parseMimicTime(r.outtime),
    los: toNumberOrNull(r.los),
    source: { table: 'icustays', file: 'icu/icustays.csv' },
  }));
  await ICUStay.deleteMany({});
  await ICUStay.insertMany(docs);
  console.log(`Inserted ${await ICUStay.countDocuments()} icustays.`);
}

function loadItemMap() {
  const rows = readCsv(path.join(MIMIC_DIR, 'icu', 'd_items.csv.gz'));
  assertColumns(rows, ['itemid', 'label', 'unitname'], 'd_items');
  const map = new Map();
  for (const r of rows) map.set(r.itemid, { label: r.label, unit: r.unitname });
  return map;
}

async function importVitals() {
  const itemMap = loadItemMap();
  const file = path.join(MIMIC_DIR, 'icu', 'chartevents.csv.gz');
  console.log(`Streaming ${file} (keeping ${VITALS.size} vital itemids)...`);

  const docs = [];
  let headerChecked = false;
  const scanned = await streamCsv(file, (row) => {
    if (!headerChecked) {
      for (const c of ['subject_id', 'stay_id', 'itemid', 'charttime', 'valuenum']) {
        if (!(c in row)) throw new Error(`chartevents missing column: ${c}`);
      }
      headerChecked = true;
    }
    if (!VITALS.has(row.itemid)) return;
    const chartTime = parseMimicTime(row.charttime);
    if (!chartTime) return;
    const meta = itemMap.get(row.itemid) || {};
    docs.push({
      subjectId: Number(row.subject_id),
      hadmId: toNumberOrNull(row.hadm_id),
      stayId: toNumberOrNull(row.stay_id),
      itemId: Number(row.itemid),
      title: meta.label || `Item ${row.itemid}`,
      valueNum: toNumberOrNull(row.valuenum),
      unit: row.valueuom || meta.unit || null,
      chartTime,
      source: { table: 'chartevents', file: 'icu/chartevents.csv' },
    });
  });

  console.log(`Scanned ${scanned.toLocaleString()} chartevents rows; kept ${docs.length.toLocaleString()} vitals.`);
  await ICUEvent.deleteMany({});
  await insertInChunks(ICUEvent, docs);
  console.log(`Inserted ${await ICUEvent.countDocuments()} icuevents.`);
}

async function run() {
  await connectDB(process.env.MONGO_URI);
  await importStays();
  await importVitals();

  // Integrity
  const stayHadm = [...new Set((await ICUStay.find({}, 'hadmId')).map(s => s.hadmId))];
  const known = new Set((await Admission.find({ hadmId: { $in: stayHadm } }, 'hadmId')).map(a => a.hadmId));
  console.log(`  orphan hadmIds (icustays not in admissions): ${stayHadm.filter(h => !known.has(h)).length}`);
  console.log(`  icuevents with null valueNum: ${await ICUEvent.countDocuments({ valueNum: null })}`);

  process.exit(0);
}

run().catch(err => { console.error('Import failed:', err.message); process.exit(1); });