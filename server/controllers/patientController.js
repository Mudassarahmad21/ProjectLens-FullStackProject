// server/controllers/patientController.js
import Patient from '../models/Patient.js';
import Admission from '../models/Admission.js';

export const getPatients = async (req, res) => {
  try {
    const patients = await Patient.find().lean();
    
    // Get admission counts for each patient
    const patientsWithCounts = await Promise.all(
      patients.map(async (patient) => {
        const admissionCount = await Admission.countDocuments({ subjectId: patient.subjectId });
        return {
          ...patient,
          admissionCount
        };
      })
    );
    
    res.json({
      success: true,
      data: patientsWithCounts
    });
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch patients'
    });
  }
};

export const getPatient = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const patient = await Patient.findOne({ subjectId }).lean();
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
    }
    
    res.json({
      success: true,
      data: patient
    });
  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch patient'
    });
  }
};

export const getPatientAdmissions = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const admissions = await Admission.find({ subjectId })
      .sort({ admissionTime: -1 })
      .lean();
    
    res.json({
      success: true,
      data: admissions
    });
  } catch (error) {
    console.error('Error fetching admissions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch admissions'
    });
  }
};