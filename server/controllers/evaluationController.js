// server/controllers/evaluationController.js
import EvaluationResult from '../models/EvaluationResult.js';

// Get latest evaluation results
export const getResults = async (req, res) => {
  try {
    const result = await EvaluationResult.findOne({ isActive: true })
      .sort({ createdAt: -1 })
      .lean();

    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Evaluation results not found. Please run the evaluation first.'
      });
    }

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching evaluation results:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load evaluation results'
    });
  }
};

// Get evaluation summary
export const getSummary = async (req, res) => {
  try {
    const result = await EvaluationResult.findOne({ isActive: true })
      .sort({ createdAt: -1 })
      .select('summary timestamp')
      .lean();

    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Evaluation results not found.'
      });
    }

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching evaluation summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load evaluation summary'
    });
  }
};

// Save evaluation results (for import)
export const saveResults = async (req, res) => {
  try {
    const { summary, details, timestamp } = req.body;

    // Deactivate previous results
    await EvaluationResult.updateMany({ isActive: true }, { isActive: false });

    // Create new result
    const result = await EvaluationResult.create({
      timestamp: timestamp || new Date(),
      summary,
      details,
      isActive: true
    });

    res.json({
      success: true,
      message: 'Evaluation results saved successfully',
      data: result
    });
  } catch (error) {
    console.error('Error saving evaluation results:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save evaluation results'
    });
  }
};