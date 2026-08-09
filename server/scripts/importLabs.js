import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from '../config/db.js';
import Lab from '../models/Lab.js';
import Admission from '../models/Admission.js';
import { readCsv, assertColumns, parseMimicTime, toNumberOrNull } from './lib/csv.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIMIC_DIR = process.env.MIMIC_DIR
  || path.resolve(__dirname, '../../data/mimic-iv-clinical-database-demo-2.2');

const REQUIRED = ['labevent_id', 'subject_id', 'hadm_id', 'itemid', 'charttime',
                  'value', 'valuenum', 'valueuom'];

// Build itemid -> label from the dictionary table. Keys are strings (as read from CSV).
function loadLabelMap() {
  const file = path.join(MIMIC_DIR, 'hosp', 'd_labitems.csv.gz');
  const rows = readCsv(file);
  assertColumns(rows, ['itemid', 'label'], 'd_labitems');
  const map = new Map();
  for (const r of rows) map.set(r.itemid, r.label);
  console.log(`Loaded ${map.size} lab labels from d_labitems`);
  return map;
}

function transformRow(row, labelMap) {
  const labeventId = Number(row.labevent_id);
  const subjectId = Number(row.subject_id);
  if (!Number.isInteger(labeventId) || !Number.isInteger(subjectId)) {
    return { error: `invalid ids labevent_id=${row.labevent_id}` };
  }
  const chartTime = parseMimicTime(row.charttime);
  if (!chartTime) return { error: `unparseable charttime for labevent_id=${row.labevent_id}` };

  return { doc: {
    labeventId,
    subjectId,
    hadmId: toNumberOrNull(row.hadm_id),          // kept as null, not skipped
    itemId: Number(row.itemid),
    title: labelMap.get(row.itemid) || `Lab item ${row.itemid}`,
    valueNum: toNumberOrNull(row.valuenum),
    value: row.value || null,                     // preserves text results
    unit: row.valueuom || null,
    flag: row.flag || null,
    chartTime,
    source: { table: 'labevents', file: 'hosp/labevents.csv' },
  }};
}

async function insertInChunks(docs, size = 5000) {
  for (let i = 0; i < docs.length; i += size) {
    await Lab.insertMany(docs.slice(i, i + size));
    process.stdout.write(`  inserted ${Math.min(i + size, docs.length)}/${docs.length}\r`);
  }
  process.stdout.write('\n');
}

async function run() {
  const labelMap = loadLabelMap();

  const file = path.join(MIMIC_DIR, 'hosp', 'labevents.csv.gz');
  console.log(`Reading ${file}`);
  const rows = readCsv(file);
  assertColumns(rows, REQUIRED, 'labevents');

  const docs = [];
  let malformed = 0, unlabeled = 0;
  for (const row of rows) {
    const { doc, error } = transformRow(row, labelMap);
    if (error) { malformed++; console.warn(`  skip row: ${error}`); continue; }
    if (!labelMap.has(row.itemid)) unlabeled++;
    docs.push(doc);
  }

  await connectDB(process.env.MONGO_URI);
  await Lab.deleteMany({});
  await insertInChunks(docs);
  const total = await Lab.countDocuments();

  const nullHadm = docs.filter(d => d.hadmId === null).length;
  console.log(`\nInserted ${total} labs (skipped ${malformed} malformed).`);
  console.log(`  null hadmId (outpatient/patient-only): ${nullHadm}`);
  console.log(`  itemids with no label match: ${unlabeled}`);

  // Integrity: orphan admission refs (ignoring the legitimately-null ones)
  const hadmIds = [...new Set(docs.filter(d => d.hadmId !== null).map(d => d.hadmId))];
  const known = new Set((await Admission.find({ hadmId: { $in: hadmIds } }, 'hadmId')).map(a => a.hadmId));
  const orphans = hadmIds.filter(h => !known.has(h));
  console.log(`  orphan hadmIds (in labs, not in admissions): ${orphans.length}`);

  process.exit(0);
}

run().catch(err => { console.error('Import failed:', err.message); process.exit(1); });