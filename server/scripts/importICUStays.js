import 'dotenv/config';
import path from 'path';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { connectDB } from '../config/db.js';
import IcuStay from '../models/IcuStay.js';
import { readCsv, assertColumns, parseMimicTime, toNumberOrNull } from './lib/csv.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIMIC_DIR = process.env.MIMIC_DIR
  || path.resolve(__dirname, '../../data/mimic-iv-clinical-database-demo-2.2');

const REQUIRED = ['subject_id', 'hadm_id', 'stay_id', 'intime', 'outtime'];

function transformRow(row) {
  const subjectId = Number(row.subject_id);
  const stayId = Number(row.stay_id);
  if (!Number.isInteger(subjectId) || !Number.isInteger(stayId)) {
    return { error: `invalid ids: subject_id=${row.subject_id} stay_id=${row.stay_id}` };
  }
  return { doc: {
    subjectId,
    hadmId: toNumberOrNull(row.hadm_id),
    stayId,
    firstCareUnit: row.first_careunit || null,
    lastCareUnit: row.last_careunit || null,
    inTime: parseMimicTime(row.intime),
    outTime: parseMimicTime(row.outtime),
    los: toNumberOrNull(row.los),
    source: { table: 'icustays', file: 'icu/icustays.csv' },
  }};
}

async function run() {
  const file = path.join(MIMIC_DIR, 'icu', 'icustays.csv.gz');
  console.log(`Reading ${file}`);
  const rows = readCsv(file);
  assertColumns(rows, REQUIRED, 'icustays');
  const docs = []; let malformed = 0;
  for (const row of rows) {
    const { doc, error } = transformRow(row);
    if (error) { malformed++; console.warn(`  skip row: ${error}`); continue; }
    docs.push(doc);
  }
  await connectDB(process.env.MONGO_URI);
  await IcuStay.deleteMany({});
  await IcuStay.insertMany(docs);
  const total = await IcuStay.countDocuments();
  console.log(`ICU stays -> parsed=${rows.length} inserted=${docs.length} malformed=${malformed} inDb=${total}`);
  await mongoose.disconnect();
}
run().catch((err) => { console.error('Import failed:', err.message); process.exit(1); });