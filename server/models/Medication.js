// server/models/Medication.js
import mongoose from 'mongoose';

const medicationSchema = new mongoose.Schema({
  subjectId: {
    type: Number,
    required: true,
    // REMOVED: index: true
  },
  hadmId: {
    type: Number,
    required: true,
    // REMOVED: index: true
  },
  pharmacyId: {
    type: Number,
    default: null
  },
  drug: {
    type: String,
    required: true
  },
  drugType: {
    type: String,
    default: null
  },
  doseVal: {
    type: String,
    default: null
  },
  doseUnit: {
    type: String,
    default: null
  },
  route: {
    type: String,
    default: null
  },
  title: {
    type: String,
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  stopTime: {
    type: Date,
    default: null
  },
  _source: {
    table: {
      type: String,
      default: 'prescriptions'
    },
    file: {
      type: String,
      default: 'hosp/prescriptions.csv'
    },
    importedAt: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

// ONLY ONE set of index definitions
medicationSchema.index({ subjectId: 1 });
medicationSchema.index({ hadmId: 1 });
medicationSchema.index({ startTime: 1 });

const Medication = mongoose.model('Medication', medicationSchema);
export default Medication;