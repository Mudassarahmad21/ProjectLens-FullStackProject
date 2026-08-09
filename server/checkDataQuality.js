import { connectDB } from './config/db.js';
import Transfer from './models/Transfer.js';
import Lab from './models/Lab.js';
import Medication from './models/Medication.js';
import Procedure from './models/Procedure.js';
import Admission from './models/Admission.js';
import TimelineEvent from './models/TimelineEvent.js'; // Add this import

const checkDataQuality = async () => {
  await connectDB();
  
  console.log('\n📊 Data Quality Check:\n');
  
  // Check Transfers
  const transferCount = await Transfer.countDocuments();
  const transferWithHadm = await Transfer.countDocuments({ hadmId: { $exists: true, $ne: null } });
  // Use the actual field name from your data (inTime instead of eventtime)
  const transferWithInTime = await Transfer.countDocuments({ inTime: { $exists: true, $ne: null } });
  console.log(`Transfers:`);
  console.log(`  Total: ${transferCount}`);
  console.log(`  With hadmId: ${transferWithHadm}`);
  console.log(`  With inTime: ${transferWithInTime}`);
  
  const sampleTransfer = await Transfer.findOne();
  if (sampleTransfer) {
    console.log(`  Sample transfer fields:`, Object.keys(sampleTransfer._doc || sampleTransfer));
  }
  
  console.log('\n' + '-'.repeat(50));
  
  // Check Labs
  const labCount = await Lab.countDocuments();
  const labWithHadm = await Lab.countDocuments({ hadmId: { $exists: true, $ne: null } });
  // Use the actual field name from your data (chartTime instead of charttime)
  const labWithChartTime = await Lab.countDocuments({ chartTime: { $exists: true, $ne: null } });
  console.log(`Labs:`);
  console.log(`  Total: ${labCount}`);
  console.log(`  With hadmId: ${labWithHadm}`);
  console.log(`  With chartTime: ${labWithChartTime}`);
  
  const sampleLab = await Lab.findOne();
  if (sampleLab) {
    console.log(`  Sample lab fields:`, Object.keys(sampleLab._doc || sampleLab));
  }
  
  console.log('\n' + '-'.repeat(50));
  
  // Check Medications
  const medCount = await Medication.countDocuments();
  const medWithHadm = await Medication.countDocuments({ hadmId: { $exists: true, $ne: null } });
  // Use the actual field name from your data (startTime instead of starttime)
  const medWithStartTime = await Medication.countDocuments({ startTime: { $exists: true, $ne: null } });
  console.log(`Medications:`);
  console.log(`  Total: ${medCount}`);
  console.log(`  With hadmId: ${medWithHadm}`);
  console.log(`  With startTime: ${medWithStartTime}`);
  
  const sampleMed = await Medication.findOne();
  if (sampleMed) {
    console.log(`  Sample medication fields:`, Object.keys(sampleMed._doc || sampleMed));
  }
  
  console.log('\n' + '-'.repeat(50));
  
  // Check Procedures
  const procCount = await Procedure.countDocuments();
  const procWithHadm = await Procedure.countDocuments({ hadmId: { $exists: true, $ne: null } });
  // Use the actual field name from your data (chartDate instead of chartdate)
  const procWithChartDate = await Procedure.countDocuments({ chartDate: { $exists: true, $ne: null } });
  console.log(`Procedures:`);
  console.log(`  Total: ${procCount}`);
  console.log(`  With hadmId: ${procWithHadm}`);
  console.log(`  With chartDate: ${procWithChartDate}`);
  
  const sampleProc = await Procedure.findOne();
  if (sampleProc) {
    console.log(`  Sample procedure fields:`, Object.keys(sampleProc._doc || sampleProc));
  }
  
  // Check timeline events
  const timelineCount = await TimelineEvent.countDocuments();
  const eventTypes = await TimelineEvent.distinct('eventType');
  console.log(`\n📋 Timeline Events:`);
  console.log(`  Total: ${timelineCount}`);
  console.log(`  Event Types:`, eventTypes);
  
  // Check admission coverage
  const admissionsWithEvents = await TimelineEvent.distinct('hadmId');
  const allAdmissions = await Admission.distinct('hadmId');
  console.log(`\n📋 Coverage Summary:`);
  console.log(`  Total admissions: ${allAdmissions.length}`);
  console.log(`  Admissions with timeline events: ${admissionsWithEvents.length}`);
  console.log(`  Admissions without events: ${allAdmissions.length - admissionsWithEvents.length}`);
  
  process.exit(0);
};

checkDataQuality();