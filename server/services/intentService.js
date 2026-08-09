// Supported intents
export const SUPPORTED_INTENTS = [
  "TIMELINE",
  "LAB_RESULTS",
  "MEDICATION_EVENTS",
  "PROCEDURES",
  "TRANSFERS",
  "DIAGNOSES",
  "ICU_OBSERVATIONS",
  "SOURCE_LOOKUP"
];

// Intent to collection mapping
const INTENT_COLLECTION_MAP = {
  'LAB_RESULTS': 'labs',
  'MEDICATION_EVENTS': 'medications',
  'PROCEDURES': 'procedures',
  'TRANSFERS': 'transfers',
  'DIAGNOSES': 'diagnoses',
  'ICU_OBSERVATIONS': 'icuEvents',
  'TIMELINE': 'timelineEvents',
  'SOURCE_LOOKUP': 'timelineEvents'
};

// Intent to model mapping
const INTENT_MODEL_MAP = {
  'LAB_RESULTS': 'Lab',
  'MEDICATION_EVENTS': 'Medication',
  'PROCEDURES': 'Procedure',
  'TRANSFERS': 'Transfer',
  'DIAGNOSES': 'Diagnosis',
  'ICU_OBSERVATIONS': 'ICUEvent',
  'TIMELINE': 'TimelineEvent',
  'SOURCE_LOOKUP': 'TimelineEvent'
};

// Temporal relation options
export const TEMPORAL_RELATIONS = [
  'BEFORE',
  'AFTER',
  'DURING',
  'BETWEEN',
  'ALL'
];

// Validate intent
export const validateIntent = (intent) => {
  if (!intent) {
    return { valid: false, error: 'Intent is required' };
  }
  
  if (!SUPPORTED_INTENTS.includes(intent)) {
    return { 
      valid: false, 
      error: `Unsupported intent: ${intent}. Supported intents: ${SUPPORTED_INTENTS.join(', ')}`
    };
  }
  
  return { valid: true };
};

// Validate temporal relation
export const validateTemporalRelation = (relation) => {
  if (!relation) return { valid: true }; // Optional
  
  if (!TEMPORAL_RELATIONS.includes(relation)) {
    return {
      valid: false,
      error: `Unsupported temporal relation: ${relation}. Supported: ${TEMPORAL_RELATIONS.join(', ')}`
    };
  }
  
  return { valid: true };
};

// Get collection name for intent
export const getCollectionForIntent = (intent) => {
  return INTENT_COLLECTION_MAP[intent] || null;
};

// Get model name for intent
export const getModelForIntent = (intent) => {
  return INTENT_MODEL_MAP[intent] || null;
};

// Build a structured query from intent parameters
export const buildStructuredQuery = (params) => {
  const { intent, hadmId, subjectId, eventType, temporalRelation, referenceEvent, startDate, endDate } = params;
  
  // Validate required parameters
  if (!hadmId && !subjectId) {
    return { error: 'Either hadmId or subjectId is required' };
  }
  
  // Build base query
  let query = {};
  
  if (hadmId) {
    query.hadmId = parseInt(hadmId);
  }
  
  if (subjectId) {
    query.subjectId = parseInt(subjectId);
  }
  
  // Add temporal filters based on intent and relation
  if (intent === 'TIMELINE') {
    // Timeline uses eventType and temporal filters
    if (eventType) {
      query.eventType = eventType.toUpperCase();
    }
    
    // Add temporal filtering
    if (temporalRelation) {
      const filter = buildTemporalFilter(temporalRelation, referenceEvent, startDate, endDate);
      if (filter) {
        query = { ...query, ...filter };
      }
    }
  } else {
    // For specific event types, we need to handle timestamps differently
    // based on the collection
    if (temporalRelation) {
      const filter = buildTemporalFilterForCollection(
        temporalRelation, 
        referenceEvent, 
        startDate, 
        endDate,
        getCollectionForIntent(intent)
      );
      if (filter) {
        query = { ...query, ...filter };
      }
    }
  }
  
  return { query, collection: getCollectionForIntent(intent) };
};

// Build temporal filter for timeline events
const buildTemporalFilter = (relation, referenceEvent, startDate, endDate) => {
  const filter = {};
  const now = new Date();
  
  switch (relation) {
    case 'BEFORE':
      if (referenceEvent) {
        // We'll handle reference events separately in the retrieval service
        filter._temporal = { relation: 'BEFORE', referenceEvent };
      } else if (startDate) {
        filter.eventTime = { $lt: new Date(startDate) };
      }
      break;
      
    case 'AFTER':
      if (referenceEvent) {
        filter._temporal = { relation: 'AFTER', referenceEvent };
      } else if (startDate) {
        filter.eventTime = { $gt: new Date(startDate) };
      }
      break;
      
    case 'DURING':
      if (startDate && endDate) {
        filter.eventTime = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }
      break;
      
    case 'BETWEEN':
      if (startDate && endDate) {
        filter.eventTime = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }
      break;
      
    case 'ALL':
    default:
      // No temporal filter
      break;
  }
  
  return filter;
};

// Build temporal filter for specific collections
const buildTemporalFilterForCollection = (relation, referenceEvent, startDate, endDate, collection) => {
  // Map collection to timestamp field
  const timestampFields = {
    'labs': 'chartTime',
    'medications': 'startTime',
    'procedures': 'chartDate',
    'transfers': 'eventtime',
    'diagnoses': null, // Diagnoses don't have a direct timestamp
    'icuEvents': 'charttime'
  };
  
  const field = timestampFields[collection];
  if (!field) return {};
  
  const filter = {};
  
  switch (relation) {
    case 'BEFORE':
      if (startDate) {
        filter[field] = { $lt: new Date(startDate) };
      }
      break;
      
    case 'AFTER':
      if (startDate) {
        filter[field] = { $gt: new Date(startDate) };
      }
      break;
      
    case 'DURING':
    case 'BETWEEN':
      if (startDate && endDate) {
        filter[field] = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }
      break;
      
    case 'ALL':
    default:
      break;
  }
  
  return filter;
};