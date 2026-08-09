import 'dotenv/config';
import path from 'path';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { connectDB } from '../config/db.js';
import Patient from '../models/Patient.js';
import { readCsv, assertColumns, parseMimicTime } from './lib/csv.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIMIC_DIR = process.env.MIMIC_DIR
  || path.resolve(__dirname, '../../data/mimic-iv-clinical-database-demo-2.2');

const REQUIRED = ['subject_id', 'gender', 'anchor_age', 'anchor_year_group'];

function transformRow(row) {
  const subjectId = Number(row.subject_id);
  if (!Number.isInteger(subjectId)) return { error: `invalid subject_id: ${row.subject_id}` };
  return { doc: {
    subjectId,
    gender: row.gender || null,
    anchorAge: row.anchor_age === '' ? null : Number(row.anchor_age),
    anchorYearGroup: row.anchor_year_group || null,
    dod: parseMimicTime(row.dod),
    source: { table: 'patients', file: 'hosp/patients.csv' },
  }};
}

async function run() {
  const file = path.join(MIMIC_DIR, 'hosp', 'patients.csv.gz');
  console.log(`Reading ${file}`);
  const rows = readCsv(file);
  assertColumns(rows, REQUIRED, 'patients');

  const docs = [];
  let malformed = 0;
  for (const row of rows) {
    const { doc, error } = transformRow(row);
    if (error) { malformed++; console.warn(`  skip row: ${error}`); continue; }
    docs.push(doc);
  }

  await connectDB(process.env.MONGO_URI);
  await Patient.deleteMany({});               // idempotent: re-running replaces, never duplicates
  await Patient.insertMany(docs);
  const total = await Patient.countDocuments();
  console.log(`Patients -> parsed=${rows.length} inserted=${docs.length} malformed=${malformed} inDb=${total}`);
  await mongoose.disconnect();
}

run().catch((err) => { console.error('Import failed:', err.message); process.exit(1); });