import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

const testAPI = async () => {
  console.log('🧪 Testing PatientLens API...\n');

  try {
    // 1. Get all patients
    console.log('1. GET /patients');
    const patientsRes = await axios.get(`${BASE_URL}/patients?limit=5`);
    console.log(`   ✅ Found ${patientsRes.data.data.length} patients`);
    console.log(`   Total: ${patientsRes.data.pagination.total}\n`);

    // 2. Get a specific patient
    const firstPatient = patientsRes.data.data[0];
    console.log(`2. GET /patients/${firstPatient.subjectId}`);
    const patientRes = await axios.get(`${BASE_URL}/patients/${firstPatient.subjectId}`);
    console.log(`   ✅ Patient ${patientRes.data.data.subjectId} found`);
    console.log(`   Gender: ${patientRes.data.data.gender}, Age: ${patientRes.data.data.anchorAge}`);
    console.log(`   Admissions: ${patientRes.data.data.admissionCount}\n`);

    // 3. Get patient admissions
    console.log(`3. GET /patients/${firstPatient.subjectId}/admissions`);
    const admissionsRes = await axios.get(`${BASE_URL}/patients/${firstPatient.subjectId}/admissions`);
    console.log(`   ✅ Found ${admissionsRes.data.count} admissions\n`);

    // 4. Get a specific admission
    if (admissionsRes.data.data.length > 0) {
      const firstAdmission = admissionsRes.data.data[0];
      console.log(`4. GET /admissions/${firstAdmission.hadmId}`);
      const admissionRes = await axios.get(`${BASE_URL}/admissions/${firstAdmission.hadmId}`);
      console.log(`   ✅ Admission ${admissionRes.data.data.hadmId} found`);
      console.log(`   Type: ${admissionRes.data.data.admissionType}\n`);

      // 5. Get timeline
      console.log(`5. GET /admissions/${firstAdmission.hadmId}/timeline`);
      const timelineRes = await axios.get(`${BASE_URL}/admissions/${firstAdmission.hadmId}/timeline`);
      console.log(`   ✅ Found ${timelineRes.data.total} timeline events`);
      
      // Show stats
      console.log('   Event types:');
      Object.entries(timelineRes.data.stats).forEach(([type, count]) => {
        console.log(`     - ${type}: ${count}`);
      });
      console.log();

      // 6. Get evidence for first event
      if (timelineRes.data.events.length > 0) {
        const firstEvent = timelineRes.data.events[0];
        console.log(`6. GET /evidence/${firstEvent._id}`);
        const evidenceRes = await axios.get(`${BASE_URL}/evidence/${firstEvent._id}`);
        console.log(`   ✅ Evidence found for event`);
        console.log(`   Source table: ${evidenceRes.data.data.source.table}`);
        console.log(`   Traceability:`, evidenceRes.data.data.traceability.join(' → '));
        console.log();
      }
    }

    // 7. Get event types
    console.log('7. GET /timeline/event-types');
    const typesRes = await axios.get(`${BASE_URL}/timeline/event-types`);
    console.log(`   ✅ Event types: ${typesRes.data.eventTypes.join(', ')}\n`);

    // 8. Test invalid patient
    console.log('8. GET /patients/99999 (invalid)');
    try {
      await axios.get(`${BASE_URL}/patients/99999`);
    } catch (error) {
      console.log(`   ✅ 404 Not Found: ${error.response.data.message}\n`);
    }

    console.log('✅ All API tests passed!');
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
};

testAPI();