import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import Admission from '../models/Admission.js';
import Transfer from '../models/Transfer.js';
import Lab from '../models/Lab.js';
import Medication from '../models/Medication.js';
import Procedure from '../models/Procedure.js';
import Diagnosis from '../models/Diagnosis.js';
import TimelineEvent from '../models/TimelineEvent.js';

dotenv.config();

const buildTimeline = async () => {
  try {
    await connectDB();
    console.log('🚀 Building timeline events from raw collections...');

    // Check what data we have
    const admissionCount = await Admission.countDocuments();

    console.log('\n📊 Available data:');
    console.log(`  Admissions:   ${admissionCount}`);
    console.log(`  Transfers:    ${await Transfer.countDocuments()}`);
    console.log(`  Labs:         ${await Lab.countDocuments()}`);
    console.log(`  Medications:  ${await Medication.countDocuments()}`);
    console.log(`  Procedures:   ${await Procedure.countDocuments()}`);
    console.log(`  Diagnoses:    ${await Diagnosis.countDocuments()}`);

    if (admissionCount === 0) {
      console.log('❌ No admissions found. Please import admissions first.');
      process.exit(1);
    }

    // Clear existing timeline events
    const deleted = await TimelineEvent.deleteMany({});
    console.log(`\n🧹 Cleared ${deleted.deletedCount} existing timeline events`);

    const allAdmissions = await Admission.find().lean();
    console.log(`\n📋 Processing ${allAdmissions.length} admissions...`);

    let totalEvents = 0;
    let processedAdmissions = 0;
    let skippedRecords = 0;

    for (const admission of allAdmissions) {
      const { subjectId, hadmId, admissionTime, admissionType, admissionLocation } = admission;
      
      const events = [];

      // 1. Admission event
      if (admissionTime) {
        events.push({
          subjectId,
          hadmId,
          eventType: 'ADMISSION',
          eventTime: admissionTime,
          title: `Admission: ${admissionType || 'Unknown'}`,
          value: admissionLocation || 'Unknown',
          unit: null,
          source: {
            table: 'admissions',
            rowId: hadmId ? hadmId.toString() : 'unknown',
            field: 'admissionType',
            timestampField: 'admissionTime'
          }
        });
      }

      // 2. Transfers - Using inTime from your schema
      try {
        const transfers = await Transfer.find({ hadmId }).lean();
        for (const transfer of transfers) {
          // Use inTime as the event time
          const eventTime = transfer.inTime || transfer.outTime;
          if (!eventTime) {
            skippedRecords++;
            continue;
          }
          
          events.push({
            subjectId,
            hadmId,
            eventType: 'TRANSFER',
            eventTime: eventTime,
            title: `Transfer: ${transfer.eventType || 'Transfer'}`,
            value: transfer.careUnit || 'Unknown Unit',
            unit: null,
            source: {
              table: 'transfers',
              rowId: transfer.transferId ? transfer.transferId.toString() : `transfer_${Date.now()}`,
              field: 'eventType',
              timestampField: 'inTime'
            }
          });
        }
      } catch (error) {
        console.error(`  ⚠️ Error processing transfers for admission ${hadmId}:`, error.message);
      }

      // 3. Labs - Using chartTime from your schema
      try {
        const labs = await Lab.find({ hadmId }).lean();
        for (const lab of labs) {
          if (!lab.chartTime) {
            skippedRecords++;
            continue;
          }
          
          events.push({
            subjectId,
            hadmId,
            eventType: 'LAB',
            eventTime: lab.chartTime,
            title: lab.title || `Lab: ${lab.itemId || 'Unknown'}`,
            value: lab.value || (lab.valueNum !== null && lab.valueNum !== undefined ? lab.valueNum.toString() : 'No value'),
            unit: lab.unit || '',
            source: {
              table: 'labevents',
              rowId: lab.labeventId ? lab.labeventId.toString() : lab._id.toString(),
              field: 'value',
              timestampField: 'chartTime'
            }
          });
        }
      } catch (error) {
        console.error(`  ⚠️ Error processing labs for admission ${hadmId}:`, error.message);
      }

      // 4. Medications - Using startTime from your schema
      try {
        const medications = await Medication.find({ hadmId }).lean();
        for (const med of medications) {
          if (!med.startTime) {
            skippedRecords++;
            continue;
          }
          
          events.push({
            subjectId,
            hadmId,
            eventType: 'MEDICATION',
            eventTime: med.startTime,
            title: `Medication: ${med.drug || 'Unknown'}`,
            value: med.doseValRx ? `${med.doseValRx} ${med.doseUnitRx || ''}` : 'Prescribed',
            unit: med.doseUnitRx || null,
            source: {
              table: 'prescriptions',
              rowId: med.pharmacyId ? med.pharmacyId.toString() : med._id.toString(),
              field: 'drug',
              timestampField: 'startTime'
            }
          });
        }
      } catch (error) {
        console.error(`  ⚠️ Error processing medications for admission ${hadmId}:`, error.message);
      }

      // 5. Procedures - Using chartDate from your schema
      try {
        const procedures = await Procedure.find({ hadmId }).lean();
        for (const proc of procedures) {
          if (!proc.chartDate) {
            skippedRecords++;
            continue;
          }
          
          events.push({
            subjectId,
            hadmId,
            eventType: 'PROCEDURE',
            eventTime: proc.chartDate,
            title: `Procedure: ${proc.title || proc.icdCode || 'Unknown'}`,
            value: proc.icdCode || 'Unknown',
            unit: null,
            source: {
              table: 'procedures_icd',
              rowId: proc._id.toString(),
              field: 'icdCode',
              timestampField: 'chartDate'
            }
          });
        }
      } catch (error) {
        console.error(`  ⚠️ Error processing procedures for admission ${hadmId}:`, error.message);
      }

      // 6. Diagnoses
      try {
        const diagnoses = await Diagnosis.find({ hadmId }).lean();
        for (const diag of diagnoses) {
          events.push({
            subjectId,
            hadmId,
            eventType: 'DIAGNOSIS',
            eventTime: admissionTime || new Date(),
            title: `Diagnosis: ${diag.title || diag.icdCode || 'Unknown'}`,
            value: diag.icdCode || 'Unknown',
            unit: null,
            source: {
              table: 'diagnoses_icd',
              rowId: diag._id.toString(),
              field: 'icdCode',
              timestampField: null
            }
          });
        }
      } catch (error) {
        console.error(`  ⚠️ Error processing diagnoses for admission ${hadmId}:`, error.message);
      }

      // Sort events chronologically
      events.sort((a, b) => a.eventTime - b.eventTime);

      // Insert events
      if (events.length > 0) {
        try {
          await TimelineEvent.insertMany(events);
          totalEvents += events.length;
          processedAdmissions++;
          
          if (processedAdmissions % 10 === 0) {
            console.log(`  Processed ${processedAdmissions}/${allAdmissions.length} admissions, ${totalEvents} events so far...`);
          }
        } catch (error) {
          console.error(`  ❌ Error inserting events for admission ${hadmId}:`, error.message);
        }
      }
    }

    console.log(`\n✅ Successfully built ${totalEvents} timeline events from ${processedAdmissions} admissions`);
    if (skippedRecords > 0) {
      console.log(`⚠️ Skipped ${skippedRecords} records due to missing data`);
    }

    // Verify
    const count = await TimelineEvent.countDocuments();
    const types = await TimelineEvent.aggregate([
      { $group: { _id: '$eventType', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    console.log('\n📊 Timeline event distribution:');
    if (types.length === 0) {
      console.log('  No events found!');
    } else {
      types.forEach(t => console.log(`  ${t._id}: ${t.count}`));
    }

    const sample = await TimelineEvent.findOne();
    if (sample) {
      console.log('\n📄 Sample timeline event:');
      console.log(JSON.stringify(sample, null, 2));
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error building timeline:', error);
    console.error(error.stack);
    process.exit(1);
  }
};

buildTimeline();