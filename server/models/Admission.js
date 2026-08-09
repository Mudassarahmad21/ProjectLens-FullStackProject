import mongoose from 'mongoose';

const admissionSchema = new mongoose.Schema({
  subjectId: { type: Number, required: true },
  hadmId: { type: Number, required: true, unique: true },
  admissionTime: { type: Date, required: true },
  dischargeTime: { type: Date, required: true },
  admissionType: { type: String, required: true },
  admissionLocation: { type: String, required: true },
  dischargeLocation: { type: String, required: true },
  insurance: { type: String, default: null },
  language: { type: String, default: null },
  maritalStatus: { type: String, default: null },
  ethnicity: { type: String, default: null },
  edregtime: { type: Date, default: null },
  edouttime: { type: Date, default: null },
  deathTime: { type: Date, default: null },
  hospitalExpireFlag: { type: Boolean, default: false },
  _source: {
    table: { type: String, default: 'admissions' },
    file: { type: String, default: 'hosp/admissions.csv' },
    importedAt: { type: Date, default: Date.now }
  }
}, { timestamps: true });

// ONLY indexes here
admissionSchema.index({ subjectId: 1 });
admissionSchema.index({ hadmId: 1 }, { unique: true });
admissionSchema.index({ admissionTime: 1 });

export default mongoose.model('Admission', admissionSchema);