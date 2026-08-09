import 'dotenv/config';
import path from 'path';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { connectDB } from '../config/db.js';
import Admission from '../models/Admission.js';
import Patient from '../models/Patient.js';
import { readCsv, assertColumns, parseMimicTime } from './lib/csv.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIMIC_DIR = process.env.MIMIC_DIR
  || path.resolve(__dirname, '../../data/mimic-iv-clinical-database-demo-2.2');

const REQUIRED = ['subject_id', 'hadm_id', 'admittime', 'dischtime',
                  'admission_type', 'admission_location', 'hospital_expire_flag'];

function transformRow(row) {
  const subjectId = Number(row.subject_id);
  const hadmId = Number(row.hadm_id);
  if (!Number.isInteger(subjectId) || !Number.isInteger(hadmId)) {
    return { error: `invalid ids: subject_id=${row.subject_id} hadm_id=${row.hadm_id}` };
  }
  const admissionTime = parseMimicTime(row.admittime);
  if (!admissionTime) return { error: `unparseable admittime for hadm_id=${row.hadm_id}` };
  return { doc: {
    subjectId, hadmId,
    admissionType: row.admission_type || null,
    admissionLocation: row.admission_location || null,
    dischargeLocation: row.discharge_location || null,
    admissionTime,
    dischargeTime: parseMimicTime(row.dischtime),
    deathTime: parseMimicTime(row.deathtime),
    hospitalExpireFlag: row.hospital_expire_flag === '1',
    source: { table: 'admissions', file: 'hosp/admissions.csv' },
  }};
}

async function run() {
  const file = path.join(MIMIC_DIR, 'hosp', 'admissions.csv.gz');
  console.log(`Reading ${file}`);
  const rows = readCsv(file);
  assertColumns(rows, REQUIRED, 'admissions');

  const docs = [];
  let malformed = 0;
  for (const row of rows) {
    const { doc, error } = transformRow(row);
    if (error) { malformed++; console.warn(`  skip row: ${error}`); continue; }
    docs.push(doc);
  }

  await connectDB(process.env.MONGO_URI);
  await Admission.deleteMany({});
  await Admission.insertMany(docs);
  const total = await Admission.countDocuments();

  // Integrity: warn (don't fail) if any admission points to a missing patient.
  const patientIds = new Set(await Patient.distinct('subjectId'));
  const orphans = (await Admission.distinct('subjectId')).filter((s) => !patientIds.has(s));
  console.log(`Admissions -> parsed=${rows.length} inserted=${docs.length} malformed=${malformed} inDb=${total}`);
  console.log(`Orphan admission subjects (no matching patient): ${orphans.length}`);
  if (orphans.length) console.warn('  Import patients BEFORE admissions if this is > 0.');
  await mongoose.disconnect();
}

run().catch((err) => { console.error('Import failed:', err.message); process.exit(1); });