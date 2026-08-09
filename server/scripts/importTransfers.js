import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from '../config/db.js';
import Transfer from '../models/Transfer.js';
import Admission from '../models/Admission.js';
import { readCsv, assertColumns, parseMimicTime, toNumberOrNull } from './lib/csv.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIMIC_DIR = process.env.MIMIC_DIR
  || path.resolve(__dirname, '../../data/mimic-iv-clinical-database-demo-2.2');

const REQUIRED = ['subject_id', 'hadm_id', 'transfer_id', 'eventtype', 'intime', 'outtime'];

function transformRow(row) {
  const subjectId = Number(row.subject_id);
  const transferId = Number(row.transfer_id);
  if (!Number.isInteger(subjectId) || !Number.isInteger(transferId)) {
    return { error: `invalid ids: subject_id=${row.subject_id} transfer_id=${row.transfer_id}` };
  }
  const inTime = parseMimicTime(row.intime);
  if (!inTime) return { error: `unparseable intime for transfer_id=${row.transfer_id}` };

  const careUnit = row.careunit || null;
  return { doc: {
    subjectId,
    hadmId: toNumberOrNull(row.hadm_id),      // kept as null when absent — not skipped
    transferId,
    eventType: row.eventtype || null,
    careUnit,
    title: careUnit || row.eventtype || 'Transfer', // fallback when careUnit is null
    inTime,
    outTime: parseMimicTime(row.outtime),
    source: { table: 'transfers', file: 'hosp/transfers.csv' },
  }};
}

async function run() {
  const file = path.join(MIMIC_DIR, 'hosp', 'transfers.csv.gz');
  console.log(`Reading ${file}`);
  const rows = readCsv(file);
  assertColumns(rows, REQUIRED, 'transfers');

  const docs = [];
  let malformed = 0;
  for (const row of rows) {
    const { doc, error } = transformRow(row);
    if (error) { malformed++; console.warn(`  skip row: ${error}`); continue; }
    docs.push(doc);
  }

  await connectDB(process.env.MONGO_URI);
  await Transfer.deleteMany({});          // idempotent re-import
  await Transfer.insertMany(docs);
  const total = await Transfer.countDocuments();

  // Reporting
  const nullHadm = docs.filter(d => d.hadmId === null).length;
  console.log(`\nInserted ${total} transfers (skipped ${malformed} malformed).`);
  console.log(`  rows with null hadmId (patient-only): ${nullHadm}`);

  // Integrity: warn (don't fail) if a non-null hadmId points to a missing admission
  const hadmIds = [...new Set(docs.filter(d => d.hadmId !== null).map(d => d.hadmId))];
  const known = new Set((await Admission.find({ hadmId: { $in: hadmIds } }, 'hadmId')).map(a => a.hadmId));
  const orphans = hadmIds.filter(h => !known.has(h));
  console.log(`  orphan hadmIds (in transfers, not in admissions): ${orphans.length}`);

  process.exit(0);
}

run().catch(err => { console.error('Import failed:', err.message); process.exit(1); });