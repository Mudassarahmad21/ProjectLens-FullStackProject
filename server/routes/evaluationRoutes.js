// server/routes/evaluationRoutes.js

import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to evaluation results
const resultsPath = path.join(__dirname, '..', '..', 'evaluation', 'results.json');

// GET /api/evaluation/results
router.get('/results', (req, res) => {
  try {
    // Check if results file exists
    if (!fs.existsSync(resultsPath)) {
      return res.status(404).json({
        success: false,
        error: 'Evaluation results not found. Please run the evaluation first.'
      });
    }

    // Read and parse results
    const data = fs.readFileSync(resultsPath, 'utf8');
    const results = JSON.parse(data);

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error reading evaluation results:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load evaluation results'
    });
  }
});

// GET /api/evaluation/summary
router.get('/summary', (req, res) => {
  try {
    if (!fs.existsSync(resultsPath)) {
      return res.status(404).json({
        success: false,
        error: 'Evaluation results not found.'
      });
    }

    const data = fs.readFileSync(resultsPath, 'utf8');
    const results = JSON.parse(data);

    // Return only summary
    res.json({
      success: true,
      data: results.summary
    });
  } catch (error) {
    console.error('Error reading evaluation summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load evaluation summary'
    });
  }
});

export default router;