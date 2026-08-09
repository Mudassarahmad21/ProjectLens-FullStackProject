import TimelineEvent from '../models/TimelineEvent.js';
import Lab from '../models/Lab.js';
import Medication from '../models/Medication.js';
import Procedure from '../models/Procedure.js';
import Transfer from '../models/Transfer.js';
import Diagnosis from '../models/Diagnosis.js';
import ICUEvent from '../models/ICUEvent.js';
import Admission from '../models/Admission.js';
import { getModelForIntent, getCollectionForIntent } from './intentService.js';

// Model map
const MODEL_MAP = {
  'TimelineEvent': TimelineEvent,
  'Lab': Lab,
  'Medication': Medication,
  'Procedure': Procedure,
  'Transfer': Transfer,
  'Diagnosis': Diagnosis,
  'ICUEvent': ICUEvent
};

// Execute a structured query
export const executeQuery = async (structuredQuery, limit = 100) => {
  try {
    const { query, collection, modelName } = structuredQuery;
    
    if (!query || Object.keys(query).length === 0) {
      return { error: 'Invalid query: No query parameters provided' };
    }
    
    // Get the model
    const Model = MODEL_MAP[modelName];
    if (!Model) {
      return { error: `Unknown model: ${modelName}` };
    }
    
    // Remove temporal metadata before executing query
    const { _temporal, ...cleanQuery } = query;
    
    // Execute query
    let results = await Model.find(cleanQuery)
      .limit(limit)
      .lean();
    
    // Handle temporal relations if specified
    if (_temporal && results.length > 0) {
      results = await applyTemporalFilter(results, _temporal, collection);
    }
    
    // Transform results to evidence format
    const evidence = results.map(record => ({
      source: {
        table: collection,
        rowId: record._id ? record._id.toString() : 'unknown',
        field: getPrimaryField(collection),
        timestampField: getTimestampField(collection)
      },
      data: record,
      provenance: {
        subjectId: record.subjectId,
        hadmId: record.hadmId
      }
    }));
    
    return {
      success: true,
      count: evidence.length,
      data: evidence,
      query: cleanQuery
    };
    
  } catch (error) {
    console.error('Error executing query:', error);
    return { error: error.message };
  }
};

// Apply temporal filtering after query (for reference events)
const applyTemporalFilter = async (results, temporal, collection) => {
  const { relation, referenceEvent } = temporal;
  
  if (!referenceEvent) return results;
  
  // Find the reference event time
  const referenceTime = await findReferenceEventTime(referenceEvent);
  if (!referenceTime) return results;
  
  // Filter results based on relation
  const timestampField = getTimestampField(collection);
  
  return results.filter(record => {
    const recordTime = record[timestampField];
    if (!recordTime) return false;
    
    switch (relation) {
      case 'BEFORE':
        return new Date(recordTime) < new Date(referenceTime);
      case 'AFTER':
        return new Date(recordTime) > new Date(referenceTime);
      default:
        return true;
    }
  });
};

// Find the time of a reference event
const findReferenceEventTime = async (referenceEvent) => {
  try {
    // Look for ICU_ADMISSION in transfers
    if (referenceEvent === 'ICU_ADMISSION') {
      const transfer = await Transfer.findOne({ 
        eventtype: /ICU/i 
      }).sort({ eventtime: -1 }).lean();
      return transfer?.eventtime || null;
    }
    
    // Look for ADMISSION in admissions
    if (referenceEvent === 'ADMISSION') {
      const admission = await Admission.findOne().sort({ admissionTime: -1 }).lean();
      return admission?.admissionTime || null;
    }
    
    return null;
  } catch (error) {
    console.error('Error finding reference event:', error);
    return null;
  }
};

// Get primary field for a collection
const getPrimaryField = (collection) => {
  const fields = {
    'labs': 'valuenum',
    'medications': 'drug',
    'procedures': 'icdCode',
    'transfers': 'careunit',
    'diagnoses': 'icdCode',
    'icuEvents': 'valuenum',
    'timelineEvents': 'title'
  };
  return fields[collection] || 'value';
};

// Get timestamp field for a collection
const getTimestampField = (collection) => {
  const fields = {
    'labs': 'chartTime',
    'medications': 'startTime',
    'procedures': 'chartDate',
    'transfers': 'eventtime',
    'diagnoses': null,
    'icuEvents': 'charttime',
    'timelineEvents': 'eventTime'
  };
  return fields[collection] || 'createdAt';
};

// Get summary statistics for an intent
export const getIntentSummary = async (intent, hadmId) => {
  try {
    const collection = getCollectionForIntent(intent);
    const modelName = getModelForIntent(intent);
    const Model = MODEL_MAP[modelName];
    
    if (!Model) {
      return { error: 'Unknown intent' };
    }
    
    const query = hadmId ? { hadmId: parseInt(hadmId) } : {};
    const count = await Model.countDocuments(query);
    
    // Get sample record
    const sample = await Model.findOne(query).lean();
    
    return {
      success: true,
      count,
      sample: sample || null,
      collection,
      modelName
    };
  } catch (error) {
    console.error('Error getting intent summary:', error);
    return { error: error.message };
  }
};