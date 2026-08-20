// server/routes/evaluationRoutes.js

import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to evaluation results
// const resultsPath = path.join(__dirname, '..', '..', 'evaluation', 'results.json');
const resultsPath = process.env.EVALUATION_RESULTS_PATH 
  ? path.resolve(process.cwd(), process.env.EVALUATION_RESULTS_PATH)
  : path.join(__dirname, '..', '..', 'evaluation', 'results.json');

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

// // server/routes/evaluationRoutes.js
// import express from 'express';
// import fs from 'fs';
// import path from 'path';
// import { fileURLToPath } from 'url';

// const router = express.Router();
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // ✅ FIX: Use a more robust path resolution
// // Try multiple possible locations for the results file
// const getResultsPath = () => {
//   const possiblePaths = [
//     // Path relative to the routes file (../evaluation/results.json)
//     path.join(__dirname, '..', '..', 'evaluation', 'results.json'),
//     // Path relative to the server root
//     path.join(process.cwd(), 'evaluation', 'results.json'),
//     // Path in the dist folder (for Vercel)
//     path.join(process.cwd(), 'dist', 'evaluation', 'results.json'),
//     // Path in the root directory
//     path.join(process.cwd(), '..', 'evaluation', 'results.json'),
//   ];

//   for (const p of possiblePaths) {
//     if (fs.existsSync(p)) {
//       console.log(`✅ Found evaluation results at: ${p}`);
//       return p;
//     }
//   }
  
//   console.log('⚠️ Evaluation results file not found in any location');
//   return null;
// };

// // GET /api/evaluation/results
// router.get('/results', (req, res) => {
//   try {
//     const resultsPath = getResultsPath();
    
//     if (!resultsPath) {
//       return res.status(404).json({
//         success: false,
//         error: 'Evaluation results not found. Please run the evaluation first.'
//       });
//     }

//     // Read and parse results
//     const data = fs.readFileSync(resultsPath, 'utf8');
//     const results = JSON.parse(data);

//     res.json({
//       success: true,
//       data: results
//     });
//   } catch (error) {
//     console.error('Error reading evaluation results:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to load evaluation results'
//     });
//   }
// });

// // GET /api/evaluation/summary
// router.get('/summary', (req, res) => {
//   try {
//     const resultsPath = getResultsPath();
    
//     if (!resultsPath) {
//       return res.status(404).json({
//         success: false,
//         error: 'Evaluation results not found.'
//       });
//     }

//     const data = fs.readFileSync(resultsPath, 'utf8');
//     const results = JSON.parse(data);

//     // Return only summary
//     res.json({
//       success: true,
//       data: results.summary
//     });
//   } catch (error) {
//     console.error('Error reading evaluation summary:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to load evaluation summary'
//     });
//   }
// });

// // 🆕 POST /api/evaluation/generate - Generate results on demand (for production)
// router.post('/generate', async (req, res) => {
//   try {
//     // Import the evaluation runner dynamically
//     const { default: runEvaluation } = await import('../evaluation/runEvaluation.js');
    
//     // Run the evaluation (this will generate results.json)
//     await runEvaluation();
    
//     res.json({
//       success: true,
//       message: 'Evaluation results generated successfully'
//     });
//   } catch (error) {
//     console.error('Error generating evaluation results:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to generate evaluation results'
//     });
//   }
// });

// export default router;