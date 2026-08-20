import axios from 'axios';

const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// ============================================
// REQUEST INTERCEPTOR
// ============================================

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('patientlens_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================
// RESPONSE INTERCEPTOR
// ============================================

api.interceptors.response.use(
  (response) => response,

  (error) => {
    console.error(
      'API Error:',
      error.response?.data || error.message
    );

    if (error.response?.status === 401) {
      localStorage.removeItem('patientlens_token');
      delete api.defaults.headers.common.Authorization;

      if (
        !window.location.pathname.includes('/login') &&
        !window.location.pathname.includes('/register')
      ) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// ============================================
// PATIENT ENDPOINTS
// ============================================

export const getPatients = () =>
  api.get('/patients');

export const getPatient = (subjectId) =>
  api.get(`/patients/${subjectId}`);

export const getPatientAdmissions = (subjectId) =>
  api.get(`/patients/${subjectId}/admissions`);

// ============================================
// ADMISSION ENDPOINTS
// ============================================

export const getAdmission = (hadmId) =>
  api.get(`/admissions/${hadmId}`);

export const getAdmissionTimeline = (hadmId, params) =>
  api.get(`/admissions/${hadmId}/timeline`, { params });

export const getTimeline = getAdmissionTimeline;

// ============================================
// QUERY
// ============================================

export const postQuery = (data) =>
  api.post('/query', data);

export const naturalLanguageQuery = postQuery;

// ============================================
// EVALUATION
// ============================================

export const getEvaluationResults = () =>
  api.get('/evaluation/results');

export const getEvaluationSummary = () =>
  api.get('/evaluation/summary');

// ============================================
// EVIDENCE
// ============================================

export const getEvidence = (eventId) =>
  api.get(`/evidence/${eventId}`);

// ============================================
// AUTH
// ============================================

export const registerUser = (userData) =>
  api.post('/auth/register', userData);

export const loginUser = (credentials) =>
  api.post('/auth/login', credentials);

export const getCurrentUser = () =>
  api.get('/auth/me');

export const updateUserProfile = (data) =>
  api.put('/auth/profile', data);

export const changeUserPassword = (data) =>
  api.put('/auth/change-password', data);

export const logoutUser = () =>
  api.post('/auth/logout');

export default api;