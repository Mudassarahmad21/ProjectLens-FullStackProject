// // // client/src/services/api.js

// // import axios from 'axios';

// // const API_BASE = '/api';

// // const api = axios.create({
// //   baseURL: API_BASE,
// //   headers: {
// //     'Content-Type': 'application/json',
// //   },
// // });

// // // Response interceptor for consistent data handling
// // api.interceptors.response.use(
// //   (response) => {
// //     // If the response has a data property, unwrap it
// //     if (response.data && response.data.data !== undefined) {
// //       return response;
// //     }
// //     return response;
// //   },
// //   (error) => {
// //     console.error('API Error:', error.response?.data || error.message);
// //     return Promise.reject(error);
// //   }
// // );

// // // Patient endpoints
// // export const getPatients = () => api.get('/patients');
// // export const getPatient = (subjectId) => api.get(`/patients/${subjectId}`);
// // export const getPatientAdmissions = (subjectId) => api.get(`/patients/${subjectId}/admissions`);

// // // Admission endpoints
// // export const getAdmission = (hadmId) => api.get(`/admissions/${hadmId}`);
// // export const getAdmissionTimeline = (hadmId, params) => 
// //   api.get(`/admissions/${hadmId}/timeline`, { params });

// // // Query endpoint
// // export const postQuery = (data) => api.post('/query', data);

// // // Evaluation endpoints
// // export const getEvaluationResults = () => api.get('/evaluation/results');
// // export const getEvaluationSummary = () => api.get('/evaluation/summary');

// // export default api;

// // client/src/services/api.js

// import axios from 'axios';

// const API_BASE = '/api';

// const api = axios.create({
//   baseURL: API_BASE,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // Response interceptor for consistent data handling
// api.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   (error) => {
//     console.error('API Error:', error.response?.data || error.message);
//     return Promise.reject(error);
//   }
// );

// // Patient endpoints
// export const getPatients = () => api.get('/patients');
// export const getPatient = (subjectId) => api.get(`/patients/${subjectId}`);
// export const getPatientAdmissions = (subjectId) => api.get(`/patients/${subjectId}/admissions`);

// // Admission endpoints
// export const getAdmission = (hadmId) => api.get(`/admissions/${hadmId}`);
// export const getAdmissionTimeline = (hadmId, params) => 
//   api.get(`/admissions/${hadmId}/timeline`, { params });

// // Query endpoint
// export const postQuery = (data) => api.post('/query', data);

// // Evaluation endpoints
// export const getEvaluationResults = () => api.get('/evaluation/results');
// export const getEvaluationSummary = () => api.get('/evaluation/summary');

// export default api;
// import axios from 'axios';

// const api = axios.create({
//   baseURL: '/api',
//   headers: { 'Content-Type': 'application/json' },
// });

// api.interceptors.response.use(
//   (r) => r,
//   (e) => { console.error('API Error:', e.response?.data || e.message); return Promise.reject(e); }
// );

// export const getPatients = (params) => api.get('/patients', { params });
// export const getPatient = (subjectId) => api.get(`/patients/${subjectId}`);
// export const getPatientAdmissions = (subjectId) => api.get(`/patients/${subjectId}/admissions`);
// export const getAdmission = (hadmId) => api.get(`/admissions/${hadmId}`);

// export const getTimeline = (hadmId, params) => api.get(`/admissions/${hadmId}/timeline`, { params });
// export const getAdmissionTimeline = getTimeline;

// export const getEvidence = (eventId) => api.get(`/evidence/${eventId}`);

// export const naturalLanguageQuery = (data) => api.post('/query', data);
// export const postQuery = naturalLanguageQuery;

// export const getEvaluationResults = () => api.get('/evaluation/results');
// export const getEvaluationSummary = () => api.get('/evaluation/summary');

// export default api;

// client/src/services/api.js
// client/src/services/api.js
import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('patientlens_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('patientlens_token');
      delete api.defaults.headers.common['Authorization'];
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ============================================
// PATIENT ENDPOINTS
// ============================================
export const getPatients = () => api.get('/patients');
export const getPatient = (subjectId) => api.get(`/patients/${subjectId}`);
export const getPatientAdmissions = (subjectId) => api.get(`/patients/${subjectId}/admissions`);

// ============================================
// ADMISSION ENDPOINTS
// ============================================
export const getAdmission = (hadmId) => api.get(`/admissions/${hadmId}`);
export const getAdmissionTimeline = (hadmId, params) => 
  api.get(`/admissions/${hadmId}/timeline`, { params });

// Alias for getAdmissionTimeline (for compatibility)
export const getTimeline = getAdmissionTimeline;

// ============================================
// QUERY ENDPOINT
// ============================================
export const postQuery = (data) => api.post('/query', data);
export const naturalLanguageQuery = postQuery; // Alias for backward compatibility

// ============================================
// EVALUATION ENDPOINTS
// ============================================
export const getEvaluationResults = () => api.get('/evaluation/results');
export const getEvaluationSummary = () => api.get('/evaluation/summary');

// ============================================
// EVIDENCE ENDPOINT
// ============================================
export const getEvidence = (eventId) => api.get(`/evidence/${eventId}`);

// ============================================
// AUTH ENDPOINTS
// ============================================
export const registerUser = (userData) => api.post('/auth/register', userData);
export const loginUser = (credentials) => api.post('/auth/login', credentials);
export const getCurrentUser = () => api.get('/auth/me');
export const updateUserProfile = (data) => api.put('/auth/profile', data);
export const changeUserPassword = (data) => api.put('/auth/change-password', data);
export const logoutUser = () => api.post('/auth/logout');

// ============================================
// DEFAULT EXPORT
// ============================================
export default api;