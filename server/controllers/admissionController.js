import Admission from '../models/Admission.js';
import Patient from '../models/Patient.js';

// Get a single admission by hadmId
export const getAdmissionById = async (req, res) => {
  try {
    const { hadmId } = req.params;
    
    const admission = await Admission.findOne({ hadmId: parseInt(hadmId) }).lean();
    
    if (!admission) {
      return res.status(404).json({
        success: false,
        message: `Admission with hadmId ${hadmId} not found`
      });
    }

    // Get patient info
    const patient = await Patient.findOne({ 
      subjectId: admission.subjectId 
    }).select('subjectId gender anchorAge').lean();

    res.json({
      success: true,
      data: {
        ...admission,
        patient
      }
    });
  } catch (error) {
    console.error('Error fetching admission:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching admission',
      error: error.message
    });
  }
};

// Get all admissions (with pagination)
export const getAdmissions = async (req, res) => {
  try {
    const { limit = 50, page = 1, subjectId } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = subjectId 
      ? { subjectId: parseInt(subjectId) }
      : {};

    const [admissions, total] = await Promise.all([
      Admission.find(query)
        .sort({ admissionTime: -1 })
        .limit(parseInt(limit))
        .skip(skip)
        .lean(),
      Admission.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: admissions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching admissions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching admissions',
      error: error.message
    });
  }
};