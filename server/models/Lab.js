import mongoose from 'mongoose';

const labSchema = new mongoose.Schema({
  labeventId: { type: Number, required: true, unique: true },
  subjectId: { type: Number, required: true },
  hadmId: { type: Number, default: null },
  itemId: { type: Number, required: true },
  title: { type: String, required: true },
  valueNum: { type: Number, default: null },
  value: { type: String, default: null },
  unit: { type: String, default: null },
  flag: { type: String, default: null },
  chartTime: { type: Date, required: true },
  _source: {
    table: { type: String, default: 'labevents' },
    file: { type: String, default: 'hosp/labevents.csv' },
    importedAt: { type: Date, default: Date.now }
  }
}, { timestamps: true });

// ONLY indexes here
labSchema.index({ subjectId: 1 });
labSchema.index({ hadmId: 1 });
labSchema.index({ chartTime: 1 });
labSchema.index({ labeventId: 1 }, { unique: true });

export default mongoose.model('Lab', labSchema);