import mongoose from 'mongoose';

const transferSchema = new mongoose.Schema({
  subjectId: { type: Number, required: true },
  hadmId: { type: Number, default: null },
  transferId: { type: Number, required: true, unique: true },
  eventType: { type: String, default: null },
  careUnit: { type: String, default: null },
  title: { type: String, default: 'Transfer' },
  inTime: { type: Date, required: true },
  outTime: { type: Date, default: null },
  _source: {
    table: { type: String, default: 'transfers' },
    file: { type: String, default: 'hosp/transfers.csv' },
    importedAt: { type: Date, default: Date.now }
  }
}, { timestamps: true });

// ONLY indexes here
transferSchema.index({ subjectId: 1 });
transferSchema.index({ hadmId: 1 });
transferSchema.index({ inTime: 1 });
transferSchema.index({ transferId: 1 }, { unique: true });

export default mongoose.model('Transfer', transferSchema);