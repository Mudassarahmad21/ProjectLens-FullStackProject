import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

const testAIIntentParser = async () => {
  console.log('🧠 Testing AI Intent Parser...\n');

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
  let testHadmId = 24181354;
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
    {
      question: 'What laboratory measurements were recorded?',
      expectedIntent: 'LAB_RESULTS'
    },
    {
      question: 'What labs were recorded before ICU admission?',
      expectedIntent: 'LAB_RESULTS',
      expectedTemporal: 'BEFORE'
    },
    {
      question: 'Show me the medications given',
      expectedIntent: 'MEDICATION_EVENTS'
    },
    {
      question: 'What procedures were performed?',
      expectedIntent: 'PROCEDURES'
    },
    {
      question: 'What transfers occurred?',
      expectedIntent: 'TRANSFERS'
    },
    {
      question: 'Show me the patient timeline',
      expectedIntent: 'TIMELINE'
    },
    {
      question: 'What are the diagnoses?',
      expectedIntent: 'DIAGNOSES'
    },
    {
      question: 'Should I take this medication?',
      expectedIntent: 'UNSUPPORTED'
    },
    {
      question: 'What is the best treatment for this?',
      expectedIntent: 'UNSUPPORTED'
    }
  ];

  console.log('📋 Testing Natural Language Queries...\n');

  for (const test of testQuestions) {
    console.log(`Question: "${test.question}"`);
    
    try {
      const response = await axios.post(`${BASE_URL}/query/natural`, {
        hadmId: testHadmId,
        question: test.question
      });
      
      if (response.data.success) {
        console.log(`  ✅ Intent: ${response.data.intent}`);
        console.log(`  Confidence: ${response.data.confidence}`);
        if (response.data.reasoning) {
          console.log(`  Reasoning: ${response.data.reasoning}`);
        }
        if (response.data.temporalRelation) {
          console.log(`  Temporal: ${response.data.temporalRelation}`);
        }
        if (response.data.total !== undefined) {
          console.log(`  Results: ${response.data.total} records found`);
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

  console.log('✅ AI Intent Parser tests completed!');
};

testAIIntentParser();