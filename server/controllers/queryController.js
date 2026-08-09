import {
  SUPPORTED_INTENTS,
  validateIntent,
  validateTemporalRelation,
  buildStructuredQuery,
  getModelForIntent,
  getCollectionForIntent
} from '../services/intentService.js';
import {
  executeQuery,
  getIntentSummary
} from '../services/retrievalService.js';
import { generateAnswer, generateSummaryAnswer } from '../services/answerService.js';
import { parseIntent, validateIntentOutput, mapIntentToQuery } from '../services/intentParserService.js';
import { safetyCheck, getSafetyStatus } from '../services/safetyService.js';

// Natural language query with answer generation and safety
export const naturalLanguageQueryWithAnswer = async (req, res) => {
  try {
    const { subjectId, hadmId, question } = req.body;
    
    // Validate required fields
    if (!question) {
      return res.status(400).json({
        success: false,
        message: 'Question is required'
      });
    }

    if (!hadmId && !subjectId) {
      return res.status(400).json({
        success: false,
        message: 'Either hadmId or subjectId is required'
      });
    }

    // Step 1: Parse intent using LLM
    const intentResult = await parseIntent(question);

    if (intentResult.error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to parse intent',
        error: intentResult.error,
        raw: intentResult.raw
      });
    }

    // Step 2: Validate the parsed intent
    const validation = validateIntentOutput(intentResult);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid intent output',
        error: validation.error,
        parsedIntent: intentResult
      });
    }

    // Step 3: Check if unsupported
    if (intentResult.intent === 'UNSUPPORTED') {
      return res.status(400).json({
        success: false,
        message: 'This question is outside the supported structured-data scope.',
        intent: 'UNSUPPORTED',
        reasoning: intentResult.reasoning,
        confidence: intentResult.confidence,
        safety: {
          status: 'OUT_OF_SCOPE',
          label: 'OUT OF SCOPE',
          color: 'gray',
          icon: '📋'
        }
      });
    }

    // Step 4: Map intent to query parameters
    const queryParams = mapIntentToQuery(intentResult, hadmId, subjectId);

    // Step 5: Build structured query
    const structuredQuery = buildStructuredQuery(queryParams);

    if (structuredQuery.error) {
      return res.status(400).json({
        success: false,
        message: structuredQuery.error
      });
    }

    // Step 6: Execute the query
    const result = await executeQuery({
      ...structuredQuery,
      modelName: getModelForIntent(intentResult.intent)
    }, 100);

    if (result.error) {
      return res.status(500).json({
        success: false,
        message: result.error
      });
    }

    // Step 7: SAFETY CHECK - Validate evidence and scope
    const safetyResult = safetyCheck(
      question,
      intentResult.intent,
      result.data || [],
      hadmId || subjectId
    );

    if (!safetyResult.safe) {
      const status = getSafetyStatus(safetyResult.type);
      return res.status(400).json({
        success: false,
        message: safetyResult.message,
        safety: {
          status: safetyResult.type,
          label: status.label,
          color: status.color,
          icon: status.icon,
          reason: safetyResult.reason
        },
        intent: intentResult.intent,
        confidence: intentResult.confidence,
        reasoning: intentResult.reasoning,
        abstained: true
      });
    }

    // Step 8: Generate answer from evidence
    const answerResult = await generateSummaryAnswer(
      question,
      intentResult.intent,
      result.data,
      hadmId || subjectId
    );

    // Step 9: Build final response with safety info
    const response = {
      success: true,
      question,
      intent: intentResult.intent,
      confidence: intentResult.confidence,
      reasoning: intentResult.reasoning,
      hadmId: hadmId || subjectId,
      total: result.data.length,
      answer: answerResult.answer,
      abstained: answerResult.abstained || false,
      evidence: answerResult.evidence || [],
      evidenceCount: answerResult.evidenceCount || result.data.length,
      isSummary: answerResult.isSummary || false,
      temporalRelation: intentResult.temporalRelation || null,
      referenceEvent: intentResult.referenceEvent || null,
      safety: {
        status: 'SUPPORTED',
        label: 'SUPPORTED',
        color: 'green',
        icon: '✅'
      }
    };

    res.json(response);

  } catch (error) {
    console.error('Error in natural language query with answer:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing query',
      error: error.message
    });
  }
};

// Natural language query (intent only, for testing)
export const naturalLanguageQuery = async (req, res) => {
  try {
    const { subjectId, hadmId, question } = req.body;
    
    if (!question) {
      return res.status(400).json({
        success: false,
        message: 'Question is required'
      });
    }

    if (!hadmId && !subjectId) {
      return res.status(400).json({
        success: false,
        message: 'Either hadmId or subjectId is required'
      });
    }

    // Parse intent using LLM
    const intentResult = await parseIntent(question);

    if (intentResult.error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to parse intent',
        error: intentResult.error,
        raw: intentResult.raw
      });
    }

    // Validate the parsed intent
    const validation = validateIntentOutput(intentResult);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid intent output',
        error: validation.error,
        parsedIntent: intentResult
      });
    }

    res.json({
      success: true,
      question,
      intent: intentResult.intent,
      confidence: intentResult.confidence,
      reasoning: intentResult.reasoning,
      temporalRelation: intentResult.temporalRelation || null,
      referenceEvent: intentResult.referenceEvent || null
    });

  } catch (error) {
    console.error('Error in natural language query:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing query',
      error: error.message
    });
  }
};

// Structured query (for testing)
export const executeStructuredQuery = async (req, res) => {
  try {
    const { 
      intent, 
      hadmId, 
      subjectId, 
      eventType, 
      temporalRelation, 
      referenceEvent, 
      startDate, 
      endDate,
      limit = 100
    } = req.body;
    
    // Validate intent
    const intentValidation = validateIntent(intent);
    if (!intentValidation.valid) {
      return res.status(400).json({
        success: false,
        message: intentValidation.error
      });
    }
    
    // Validate temporal relation if provided
    if (temporalRelation) {
      const temporalValidation = validateTemporalRelation(temporalRelation);
      if (!temporalValidation.valid) {
        return res.status(400).json({
          success: false,
          message: temporalValidation.error
        });
      }
    }
    
    // Build structured query
    const structuredQuery = buildStructuredQuery({
      intent,
      hadmId,
      subjectId,
      eventType,
      temporalRelation,
      referenceEvent,
      startDate,
      endDate
    });
    
    if (structuredQuery.error) {
      return res.status(400).json({
        success: false,
        message: structuredQuery.error
      });
    }
    
    // Execute the query
    const result = await executeQuery({
      ...structuredQuery,
      modelName: getModelForIntent(intent)
    }, limit);
    
    if (result.error) {
      return res.status(500).json({
        success: false,
        message: result.error
      });
    }
    
    // Build response
    const response = {
      success: true,
      intent,
      hadmId: hadmId || subjectId,
      total: result.count,
      data: result.data,
      query: result.query,
      collection: getCollectionForIntent(intent)
    };
    
    // Add temporal info if provided
    if (temporalRelation) {
      response.temporalRelation = temporalRelation;
      if (referenceEvent) {
        response.referenceEvent = referenceEvent;
      }
      if (startDate || endDate) {
        response.dateRange = { startDate, endDate };
      }
    }
    
    res.json(response);
    
  } catch (error) {
    console.error('Error executing structured query:', error);
    res.status(500).json({
      success: false,
      message: 'Error executing query',
      error: error.message
    });
  }
};

// Get supported intents
export const getSupportedIntents = async (req, res) => {
  res.json({
    success: true,
    intents: SUPPORTED_INTENTS,
    description: 'Supported structured query intents for PatientLens'
  });
};

// Get summary for an intent
export const getIntentSummaryController = async (req, res) => {
  try {
    const { intent, hadmId } = req.params;
    
    const validation = validateIntent(intent);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error
      });
    }
    
    const summary = await getIntentSummary(intent, hadmId);
    
    if (summary.error) {
      return res.status(500).json({
        success: false,
        message: summary.error
      });
    }
    
    res.json({
      success: true,
      intent,
      ...summary
    });
    
  } catch (error) {
    console.error('Error getting intent summary:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting intent summary',
      error: error.message
    });
  }
};