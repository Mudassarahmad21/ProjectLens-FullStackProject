import axios from 'axios';
import { SUPPORTED_INTENTS } from './services/intentService.js';

const BASE_URL = 'http://localhost:5000/api';

const testQueryEngine = async () => {
  console.log('🧪 Testing Query Engine...\n');
  
  // Get a real hadmId from the system
  let testHadmId = 24181354; // Default from earlier
  
  try {
    // First, get a real hadmId
    const admissionsRes = await axios.get(`${BASE_URL}/admissions?limit=1`);
    if (admissionsRes.data.data && admissionsRes.data.data.length > 0) {
      testHadmId = admissionsRes.data.data[0].hadmId;
    }
    console.log(`Using hadmId: ${testHadmId}\n`);
  } catch (error) {
    console.log('Could not fetch admissions, using default hadmId');
  }

  // Test each supported intent
  for (const intent of SUPPORTED_INTENTS) {
    console.log(`📋 Testing intent: ${intent}`);
    
    try {
      const response = await axios.post(`${BASE_URL}/query`, {
        intent,
        hadmId: testHadmId,
        limit: 5
      });
      
      if (response.data.success) {
        console.log(`  ✅ Found ${response.data.total} records`);
        console.log(`  Collection: ${response.data.collection}`);
        if (response.data.data && response.data.data.length > 0) {
          const sample = response.data.data[0];
          console.log(`  Sample: ${JSON.stringify(sample, null, 2).slice(0, 200)}...`);
        }
      } else {
        console.log(`  ❌ Failed: ${response.data.message}`);
      }
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
      if (error.response) {
        console.log(`  Response: ${error.response.data.message}`);
      }
    }
    console.log('');
  }

  // Test temporal queries
  console.log('🕐 Testing Temporal Queries...\n');
  
  const temporalTests = [
    { intent: 'LAB_RESULTS', temporalRelation: 'BEFORE', referenceEvent: 'ICU_ADMISSION' },
    { intent: 'TRANSFERS', temporalRelation: 'BEFORE', referenceEvent: 'ADMISSION' }
  ];
  
  for (const test of temporalTests) {
    console.log(`Testing: ${test.intent} ${test.temporalRelation} ${test.referenceEvent}`);
    try {
      const response = await axios.post(`${BASE_URL}/query`, {
        ...test,
        hadmId: testHadmId,
        limit: 3
      });
      
      if (response.data.success) {
        console.log(`  ✅ Found ${response.data.total} records`);
        console.log(`  Temporal: ${response.data.temporalRelation}`);
      }
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
    }
    console.log('');
  }

  // Test get supported intents
  console.log('📋 Getting Supported Intents...');
  try {
    const response = await axios.get(`${BASE_URL}/query/intents`);
    console.log(`  ✅ Supported intents: ${response.data.intents.join(', ')}`);
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
  }
  
  console.log('\n✅ Query Engine tests completed!');
};

testQueryEngine();