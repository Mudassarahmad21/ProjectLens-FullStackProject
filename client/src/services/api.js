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
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (r) => r,
  (e) => { console.error('API Error:', e.response?.data || e.message); return Promise.reject(e); }
);

export const getPatients = (params) => api.get('/patients', { params });
export const getPatient = (subjectId) => api.get(`/patients/${subjectId}`);
export const getPatientAdmissions = (subjectId) => api.get(`/patients/${subjectId}/admissions`);
export const getAdmission = (hadmId) => api.get(`/admissions/${hadmId}`);

export const getTimeline = (hadmId, params) => api.get(`/admissions/${hadmId}/timeline`, { params });
export const getAdmissionTimeline = getTimeline;

export const getEvidence = (eventId) => api.get(`/evidence/${eventId}`);

export const naturalLanguageQuery = (data) => api.post('/query', data);
export const postQuery = naturalLanguageQuery;

export const getEvaluationResults = () => api.get('/evaluation/results');
export const getEvaluationSummary = () => api.get('/evaluation/summary');

export default api;