import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from '../config/db.js';
import Procedure from '../models/Procedure.js';
import Admission from '../models/Admission.js';
import { readCsv, assertColumns, parseMimicTime, toNumberOrNull } from './lib/csv.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIMIC_DIR = process.env.MIMIC_DIR
  || path.resolve(__dirname, '../../data/mimic-iv-clinical-database-demo-2.2');

const REQUIRED = ['subject_id', 'hadm_id', 'seq_num', 'chartdate', 'icd_code', 'icd_version'];

// Compound key "version|code" -> long_title
function loadTitleMap(fileName, tableName) {
  const rows = readCsv(path.join(MIMIC_DIR, 'hosp', fileName));
  assertColumns(rows, ['icd_code', 'icd_version', 'long_title'], tableName);
  const map = new Map();
  for (const r of rows) map.set(`${r.icd_version}|${r.icd_code}`, r.long_title);
  console.log(`Loaded ${map.size} titles from ${tableName}`);
  return map;
}

function transformRow(row, titleMap) {
  const subjectId = Number(row.subject_id);
  const hadmId = Number(row.hadm_id);
  if (!Number.isInteger(subjectId) || !Number.isInteger(hadmId)) {
    return { error: `invalid ids subject_id=${row.subject_id} hadm_id=${row.hadm_id}` };
  }
  const chartDate = parseMimicTime(row.chartdate);
  if (!chartDate) return { error: `unparseable chartdate hadm_id=${row.hadm_id} seq=${row.seq_num}` };

  const key = `${row.icd_version}|${row.icd_code}`;
  return { doc: {
    subjectId,
    hadmId,
    seqNum: toNumberOrNull(row.seq_num),
    icdCode: row.icd_code || null,
    icdVersion: toNumberOrNull(row.icd_version),
    title: titleMap.get(key) || `ICD${row.icd_version} ${row.icd_code}`,
    chartDate,
    source: { table: 'procedures_icd', file: 'hosp/procedures_icd.csv' },
  }};
}

async function run() {
  const titleMap = loadTitleMap('d_icd_procedures.csv.gz', 'd_icd_procedures');

  const file = path.join(MIMIC_DIR, 'hosp', 'procedures_icd.csv.gz');
  console.log(`Reading ${file}`);
  const rows = readCsv(file);
  assertColumns(rows, REQUIRED, 'procedures_icd');

  const docs = [];
  let malformed = 0, unresolved = 0;
  for (const row of rows) {
    const { doc, error } = transformRow(row, titleMap);
    if (error) { malformed++; console.warn(`  skip row: ${error}`); continue; }
    if (!titleMap.has(`${row.icd_version}|${row.icd_code}`)) unresolved++;
    docs.push(doc);
  }

  await connectDB(process.env.MONGO_URI);
  await Procedure.deleteMany({});
  await Procedure.insertMany(docs);
  const total = await Procedure.countDocuments();

  console.log(`\nInserted ${total} procedures (skipped ${malformed} malformed).`);
  console.log(`  unresolved ICD titles: ${unresolved}`);

  const hadmIds = [...new Set(docs.map(d => d.hadmId))];
  const known = new Set((await Admission.find({ hadmId: { $in: hadmIds } }, 'hadmId')).map(a => a.hadmId));
  const orphans = hadmIds.filter(h => !known.has(h));
  console.log(`  orphan hadmIds (in procedures, not in admissions): ${orphans.length}`);

  process.exit(0);
}

run().catch(err => { console.error('Import failed:', err.message); process.exit(1); });