import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from '../config/db.js';
import Medication from '../models/Medication.js';
import Admission from '../models/Admission.js';
import { readCsv, assertColumns, parseMimicTime, toNumberOrNull } from './lib/csv.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIMIC_DIR = process.env.MIMIC_DIR
  || path.resolve(__dirname, '../../data/mimic-iv-clinical-database-demo-2.2');

const REQUIRED = ['subject_id', 'hadm_id', 'pharmacy_id', 'drug', 'drug_type',
                  'starttime', 'stoptime', 'dose_val_rx', 'dose_unit_rx', 'route'];

function transformRow(row) {
  const subjectId = Number(row.subject_id);
  const hadmId = Number(row.hadm_id);
  if (!Number.isInteger(subjectId) || !Number.isInteger(hadmId)) {
    return { error: `invalid ids subject_id=${row.subject_id} hadm_id=${row.hadm_id}` };
  }
  const startTime = parseMimicTime(row.starttime);
  if (!startTime) return { error: `unparseable starttime for pharmacy_id=${row.pharmacy_id}` };

  return { doc: {
    subjectId,
    hadmId,
    pharmacyId: toNumberOrNull(row.pharmacy_id),
    drug: row.drug || null,
    drugType: row.drug_type || null,
    doseVal: row.dose_val_rx || null,     // kept as string
    doseUnit: row.dose_unit_rx || null,
    route: row.route || null,
    title: row.drug || 'Medication',
    startTime,
    stopTime: parseMimicTime(row.stoptime),
    source: { table: 'prescriptions', file: 'hosp/prescriptions.csv' },
  }};
}

async function run() {
  const file = path.join(MIMIC_DIR, 'hosp', 'prescriptions.csv.gz');
  console.log(`Reading ${file}`);
  const rows = readCsv(file);
  assertColumns(rows, REQUIRED, 'prescriptions');

  const docs = [];
  let malformed = 0;
  for (const row of rows) {
    const { doc, error } = transformRow(row);
    if (error) { malformed++; console.warn(`  skip row: ${error}`); continue; }
    docs.push(doc);
  }

  await connectDB(process.env.MONGO_URI);
  await Medication.deleteMany({});
  await Medication.insertMany(docs);
  const total = await Medication.countDocuments();

  const distinctPharmacy = (await Medication.distinct('pharmacyId')).length;
  console.log(`\nInserted ${total} medications (skipped ${malformed} malformed).`);
  console.log(`  distinct pharmacyId: ${distinctPharmacy} (fewer than rows = multi-component orders, expected)`);

  const hadmIds = [...new Set(docs.map(d => d.hadmId))];
  const known = new Set((await Admission.find({ hadmId: { $in: hadmIds } }, 'hadmId')).map(a => a.hadmId));
  const orphans = hadmIds.filter(h => !known.has(h));
  console.log(`  orphan hadmIds (in medications, not in admissions): ${orphans.length}`);

  process.exit(0);
}

run().catch(err => { console.error('Import failed:', err.message); process.exit(1); });