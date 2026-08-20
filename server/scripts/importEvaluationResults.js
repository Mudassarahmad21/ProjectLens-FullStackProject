// server/scripts/importEvaluationResults.js
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from '../config/db.js';
import EvaluationResult from '../models/EvaluationResult.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const importResults = async () => {
  try {
    await connectDB();

    // Read the results.json file
    const resultsPath = path.join(__dirname, '..', '..', 'evaluation', 'results.json');
    
    if (!fs.existsSync(resultsPath)) {
      console.error('❌ results.json not found at:', resultsPath);
      process.exit(1);
    }

    const data = fs.readFileSync(resultsPath, 'utf8');
    const results = JSON.parse(data);

    // Deactivate previous results
    await EvaluationResult.updateMany({ isActive: true }, { isActive: false });

    // Create new result
    const result = await EvaluationResult.create({
      timestamp: results.timestamp || new Date(),
      summary: results.summary,
      details: results.details,
      isActive: true
    });

    console.log('✅ Evaluation results imported successfully!');
    console.log(`   ID: ${result._id}`);
    console.log(`   Timestamp: ${result.timestamp}`);
    console.log(`   AI Passed: ${result.summary.ai.passed}/${result.summary.ai.total}`);
    console.log(`   Baseline Passed: ${result.summary.baseline.passed}/${result.summary.baseline.total}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error importing results:', error);
    process.exit(1);
  }
};

importResults();