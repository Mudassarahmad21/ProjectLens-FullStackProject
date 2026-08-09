import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

const testAnswerGeneration = async () => {
  console.log('🧪 Testing Evidence-Grounded Answer Generation...\n');

  // Check if server is running
  try {
    await axios.get(`${BASE_URL}/health`);
    console.log('✅ Server is running\n');
  } catch (error) {
    console.error('❌ Server is not running!');
    console.error('Please start the server first: npm run dev\n');
    process.exit(1);
  }

  // Get a real hadmId
  let testHadmId = 21477991;
  try {
    const admissionsRes = await axios.get(`${BASE_URL}/admissions?limit=1`);
    if (admissionsRes.data.data && admissionsRes.data.data.length > 0) {
      testHadmId = admissionsRes.data.data[0].hadmId;
    }
    console.log(`Using hadmId: ${testHadmId}\n`);
  } catch (error) {
    console.log('Could not fetch admissions, using default hadmId');
  }

  // Test questions
  const testQuestions = [
    'What medications were given?',
    'What procedures were performed?',
    'What transfers occurred?',
    'What are the diagnoses?',
    'Show me the patient timeline',
    'What laboratory measurements were recorded?',
    'Should I take this medication?'
  ];

  console.log('📋 Testing Answer Generation...\n');

  for (const question of testQuestions) {
    console.log(`Question: "${question}"`);
    
    try {
      const response = await axios.post(`${BASE_URL}/query`, {
        hadmId: testHadmId,
        question
      });
      
      if (response.data.success) {
        console.log(`  ✅ Intent: ${response.data.intent}`);
        console.log(`  Answer: ${response.data.answer?.slice(0, 200)}${response.data.answer?.length > 200 ? '...' : ''}`);
        console.log(`  Evidence: ${response.data.evidence?.length || 0} sources`);
        console.log(`  Abstained: ${response.data.abstained}`);
        if (response.data.temporalRelation) {
          console.log(`  Temporal: ${response.data.temporalRelation}`);
        }
      } else {
        console.log(`  ❌ Error: ${response.data.message}`);
        if (response.data.reasoning) {
          console.log(`  Reasoning: ${response.data.reasoning}`);
        }
      }
    } catch (error) {
      console.log(`  ❌ Request failed: ${error.message}`);
      if (error.response) {
        console.log(`  Response: ${JSON.stringify(error.response.data, null, 2)}`);
      }
    }
    console.log('');
  }

  console.log('✅ Answer Generation tests completed!');
};

testAnswerGeneration();