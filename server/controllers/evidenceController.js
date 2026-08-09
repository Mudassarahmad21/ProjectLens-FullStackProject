import TimelineEvent from '../models/TimelineEvent.js';
import Admission from '../models/Admission.js';
import Patient from '../models/Patient.js';
import Transfer from '../models/Transfer.js';
import Lab from '../models/Lab.js';
import Medication from '../models/Medication.js';
import Procedure from '../models/Procedure.js';
import Diagnosis from '../models/Diagnosis.js';
import mongoose from 'mongoose';

// Get the source model based on table name
const getSourceModel = (table) => {
  const modelMap = {
    'admissions': Admission,
    'transfers': Transfer,
    'labevents': Lab,
    'prescriptions': Medication,
    'procedures_icd': Procedure,
    'diagnoses_icd': Diagnosis,
  };
  return modelMap[table];
};

// Fetch the actual source record
const fetchSourceRecord = async (table, rowId, subjectId, hadmId) => {
  try {
    const Model = getSourceModel(table);
    if (!Model) {
      return { error: `Unknown table: ${table}` };
    }

    // Try to find by rowId if it's a number
    let query = {};
    if (rowId && !isNaN(parseInt(rowId))) {
      // For tables with specific ID fields
      const idFields = {
        'admissions': 'hadmId',
        'transfers': 'transferId',
        'labevents': 'labeventId',
        'prescriptions': 'pharmacyId',
        'procedures_icd': '_id',
        'diagnoses_icd': '_id',
      };
      
      const idField = idFields[table] || '_id';
      if (idField === '_id' && mongoose.Types.ObjectId.isValid(rowId)) {
        query = { _id: rowId };
      } else if (idField !== '_id') {
        query = { [idField]: parseInt(rowId) };
      } else {
        query = { _id: rowId };
      }
    } else if (mongoose.Types.ObjectId.isValid(rowId)) {
      query = { _id: rowId };
    } else {
      // Fallback: search by subjectId and hadmId
      query = { subjectId, hadmId };
    }

    const record = await Model.findOne(query).lean();
    return record || { error: 'Record not found' };
  } catch (error) {
    return { error: error.message };
  }
};

// Get evidence for a specific timeline event
export const getEvidenceByEventId = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    // Find the timeline event
    let event;
    if (mongoose.Types.ObjectId.isValid(eventId)) {
      event = await TimelineEvent.findById(eventId).lean();
    } else {
      event = await TimelineEvent.findOne({ 'source.rowId': eventId }).lean();
    }
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: `Event with id ${eventId} not found`
      });
    }

    // Fetch patient info
    const patient = await Patient.findOne({ 
      subjectId: event.subjectId 
    }).select('subjectId gender anchorAge').lean();

    // Fetch admission info
    const admission = await Admission.findOne({ 
      hadmId: event.hadmId 
    }).select('hadmId admissionType admissionTime').lean();

    // Fetch the actual source record
    const sourceRecord = await fetchSourceRecord(
      event.source.table,
      event.source.rowId,
      event.subjectId,
      event.hadmId
    );

    // Build the evidence response
    const evidence = {
      event: {
        id: event._id,
        type: event.eventType,
        title: event.title,
        value: event.value,
        unit: event.unit,
        time: event.eventTime,
      },
      patient: {
        subjectId: event.subjectId,
        gender: patient?.gender || 'Unknown',
        anchorAge: patient?.anchorAge || 'Unknown',
      },
      admission: {
        hadmId: event.hadmId,
        type: admission?.admissionType || 'Unknown',
        time: admission?.admissionTime || null,
      },
      source: {
        table: event.source.table,
        rowId: event.source.rowId,
        field: event.source.field,
        timestampField: event.source.timestampField,
      },
      sourceRecord: sourceRecord.error ? null : sourceRecord,
      traceability: [
        `Timeline Event → ${event.source.table}`,
        `Row: ${event.source.rowId}`,
        `Field: ${event.source.field}`,
        `Timestamp: ${event.source.timestampField || 'Not specified'}`
      ],
      found: !sourceRecord.error,
    };

    res.json({
      success: true,
      data: evidence
    });
  } catch (error) {
    console.error('Error fetching evidence:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching evidence',
      error: error.message
    });
  }
};

// Get evidence for multiple events
export const getEvidenceForEvents = async (req, res) => {
  try {
    const { eventIds } = req.body;
    
    if (!eventIds || !Array.isArray(eventIds)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of eventIds'
      });
    }

    const events = await TimelineEvent.find({
      _id: { $in: eventIds }
    }).lean();

    const evidenceMap = {};
    for (const event of events) {
      const sourceRecord = await fetchSourceRecord(
        event.source.table,
        event.source.rowId,
        event.subjectId,
        event.hadmId
      );

      evidenceMap[event._id] = {
        source: {
          table: event.source.table,
          rowId: event.source.rowId,
          field: event.source.field,
        },
        eventDetails: {
          title: event.title,
          value: event.value,
          time: event.eventTime,
        },
        sourceRecord: sourceRecord.error ? null : sourceRecord,
        found: !sourceRecord.error,
      };
    }

    res.json({
      success: true,
      data: evidenceMap
    });
  } catch (error) {
    console.error('Error fetching evidence:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching evidence',
      error: error.message
    });
  }
};