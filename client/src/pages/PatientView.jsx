// // // client/src/pages/PatientView.jsx

// // import React, { useState, useEffect } from 'react';
// // import { useParams, useNavigate } from 'react-router-dom';
// // import {
// //   ArrowLeft,
// //   Clock,
// //   Filter,
// //   AlertCircle,
// //   Activity,
// //   Pill,
// //   Syringe,
// //   MoveHorizontal,
// //   FileText,
// //   Stethoscope,
// //   ExternalLink,
// //   ChevronDown,
// //   ChevronRight,
// //   Search,
// //   X,
// //   Database,
// //   Shield
// // } from 'lucide-react';
// // import api from '../services/api';

// // // Event type configuration
// // const EVENT_TYPES = {
// //   ADMISSION: { label: 'Admission', icon: FileText, color: 'blue' },
// //   LAB: { label: 'Lab', icon: Activity, color: 'green' },
// //   MEDICATION: { label: 'Medication', icon: Pill, color: 'purple' },
// //   PROCEDURE: { label: 'Procedure', icon: Syringe, color: 'indigo' },
// //   TRANSFER: { label: 'Transfer', icon: MoveHorizontal, color: 'orange' },
// //   DIAGNOSIS: { label: 'Diagnosis', icon: FileText, color: 'red' },
// //   ICU: { label: 'ICU', icon: Stethoscope, color: 'pink' },
// // };

// // const FILTERS = ['All', 'LAB', 'MEDICATION', 'PROCEDURE', 'TRANSFER', 'DIAGNOSIS', 'ICU'];

// // const PatientView = () => {
// //   const { subjectId } = useParams();
// //   const navigate = useNavigate();
// //   const [patient, setPatient] = useState(null);
// //   const [admissions, setAdmissions] = useState([]);
// //   const [selectedAdmission, setSelectedAdmission] = useState(null);
// //   const [timeline, setTimeline] = useState([]);
// //   const [filter, setFilter] = useState('All');
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState(null);
// //   const [expandedEvents, setExpandedEvents] = useState(new Set());

// //   useEffect(() => {
// //     fetchPatientData();
// //   }, [subjectId]);

// //   const fetchPatientData = async () => {
// //     try {
// //       setLoading(true);
// //       const [patientRes, admissionsRes] = await Promise.all([
// //         api.get(`/patients/${subjectId}`),
// //         api.get(`/patients/${subjectId}/admissions`)
// //       ]);
// //       setPatient(patientRes.data.data);
// //       setAdmissions(admissionsRes.data.data || []);
// //       if (admissionsRes.data.data?.length > 0) {
// //         setSelectedAdmission(admissionsRes.data.data[0]);
// //       }
// //     } catch (err) {
// //       console.error('Error fetching patient data:', err);
// //       setError('Failed to load patient data');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     if (selectedAdmission) {
// //       fetchTimeline();
// //     }
// //   }, [selectedAdmission, filter]);

// //   const fetchTimeline = async () => {
// //     try {
// //       const response = await api.get(`/admissions/${selectedAdmission.hadmId}/timeline`, {
// //         params: { eventType: filter !== 'All' ? filter : undefined }
// //       });
// //       setTimeline(response.data.data || []);
// //     } catch (err) {
// //       console.error('Error fetching timeline:', err);
// //       setTimeline([]);
// //     }
// //   };

// //   const toggleEventExpand = (eventId) => {
// //     setExpandedEvents(prev => {
// //       const newSet = new Set(prev);
// //       if (newSet.has(eventId)) {
// //         newSet.delete(eventId);
// //       } else {
// //         newSet.add(eventId);
// //       }
// //       return newSet;
// //     });
// //   };

// //   const formatTime = (timestamp) => {
// //     if (!timestamp) return '';
// //     const date = new Date(timestamp);
// //     return date.toLocaleString();
// //   };

// //   const getEventIcon = (type) => {
// //     const config = EVENT_TYPES[type] || EVENT_TYPES.LAB;
// //     const Icon = config.icon;
// //     return <Icon className={`w-4 h-4 text-${config.color}-600`} />;
// //   };

// //   const getEventColor = (type) => {
// //     const config = EVENT_TYPES[type] || EVENT_TYPES.LAB;
// //     return config.color;
// //   };

// //   if (loading) {
// //     return (
// //       <div className="flex items-center justify-center min-h-[400px]">
// //         <div className="text-center">
// //           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
// //           <p className="text-gray-500 mt-4">Loading patient data...</p>
// //         </div>
// //       </div>
// //     );
// //   }

// //   if (error || !patient) {
// //     return (
// //       <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
// //         <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
// //         <p className="text-red-600">{error || 'Patient not found'}</p>
// //         <button
// //           onClick={() => navigate('/')}
// //           className="mt-4 text-sm text-red-600 hover:text-red-800"
// //         >
// //           Return to Dashboard
// //         </button>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="space-y-6">
// //       {/* Back button */}
// //       <button
// //         onClick={() => navigate('/')}
// //         className="flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
// //       >
// //         <ArrowLeft className="w-4 h-4 mr-1" />
// //         Back to Dashboard
// //       </button>

// //       {/* Patient Header */}
// //       <div className="bg-white rounded-lg border border-gray-200 p-6">
// //         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
// //           <div className="flex items-center space-x-4">
// //             <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-2xl">
// //               {patient.gender === 'F' ? '👩' : '👨'}
// //             </div>
// //             <div>
// //               <h1 className="text-2xl font-bold text-gray-900">Patient {patient.subjectId}</h1>
// //               <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
// //                 <span>Gender: {patient.gender}</span>
// //                 <span>•</span>
// //                 <span>Age: {patient.anchorAge}</span>
// //                 <span>•</span>
// //                 <span>{admissions.length} admissions</span>
// //               </div>
// //             </div>
// //           </div>
// //           <div className="flex items-center space-x-2 text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full">
// //             <Shield className="w-3 h-3" />
// //             <span>Not for Clinical Use</span>
// //           </div>
// //         </div>
// //       </div>

// //       {/* Admission Selector */}
// //       <div className="bg-white rounded-lg border border-gray-200 p-4">
// //         <div className="flex flex-wrap items-center gap-2">
// //           <span className="text-sm font-medium text-gray-700 mr-2">Admission:</span>
// //           {admissions.map((admission) => (
// //             <button
// //               key={admission.hadmId}
// //               onClick={() => setSelectedAdmission(admission)}
// //               className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
// //                 selectedAdmission?.hadmId === admission.hadmId
// //                   ? 'bg-indigo-600 text-white'
// //                   : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
// //               }`}
// //             >
// //               {new Date(admission.admissionTime).toLocaleDateString()}
// //             </button>
// //           ))}
// //         </div>
// //       </div>

// //       {/* Timeline */}
// //       <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
// //         {/* Timeline Header */}
// //         <div className="p-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
// //           <div className="flex items-center space-x-2">
// //             <Clock className="w-5 h-5 text-gray-400" />
// //             <h2 className="font-semibold text-gray-900">Timeline</h2>
// //             <span className="text-sm text-gray-400">{timeline.length} events</span>
// //           </div>
// //           <div className="flex flex-wrap items-center gap-2">
// //             <Filter className="w-4 h-4 text-gray-400" />
// //             {FILTERS.map((f) => (
// //               <button
// //                 key={f}
// //                 onClick={() => setFilter(f)}
// //                 className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
// //                   filter === f
// //                     ? 'bg-indigo-600 text-white'
// //                     : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
// //                 }`}
// //               >
// //                 {f}
// //               </button>
// //             ))}
// //           </div>
// //         </div>

// //         {/* Timeline Events */}
// //         <div className="divide-y divide-gray-100">
// //           {timeline.length === 0 ? (
// //             <div className="p-8 text-center text-gray-500">
// //               <Database className="w-12 h-12 text-gray-300 mx-auto mb-3" />
// //               <p>No events found</p>
// //               <p className="text-sm">Try selecting a different admission or filter</p>
// //             </div>
// //           ) : (
// //             timeline.map((event, index) => {
// //               const isExpanded = expandedEvents.has(event._id || index);
// //               const color = getEventColor(event.eventType);
              
// //               return (
// //                 <div
// //                   key={event._id || index}
// //                   className="hover:bg-gray-50 transition-colors"
// //                 >
// //                   <button
// //                     onClick={() => toggleEventExpand(event._id || index)}
// //                     className="w-full text-left p-4 flex items-start space-x-4"
// //                   >
// //                     {/* Timeline line */}
// //                     <div className="relative flex flex-col items-center">
// //                       <div className={`w-3 h-3 rounded-full bg-${color}-500 mt-1.5`} />
// //                       {index < timeline.length - 1 && (
// //                         <div className="w-0.5 flex-1 bg-gray-200 mt-1" />
// //                       )}
// //                     </div>

// //                     {/* Event content */}
// //                     <div className="flex-1 min-w-0">
// //                       <div className="flex flex-wrap items-center gap-2">
// //                         <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-${color}-100 text-${color}-700`}>
// //                           {EVENT_TYPES[event.eventType]?.label || event.eventType}
// //                         </span>
// //                         <span className="text-sm text-gray-500">
// //                           {formatTime(event.eventTime)}
// //                         </span>
// //                       </div>
// //                       <p className="text-gray-900 font-medium mt-0.5">{event.title}</p>
// //                       {event.value && (
// //                         <p className="text-sm text-gray-600">
// //                           {event.value} {event.unit || ''}
// //                         </p>
// //                       )}
// //                     </div>

// //                     <div className="flex items-center space-x-2">
// //                       {event.source && (
// //                         <span className="text-xs text-gray-400 flex items-center">
// //                           <Database className="w-3 h-3 mr-1" />
// //                           {event.source.table}
// //                         </span>
// //                       )}
// //                       {isExpanded ? (
// //                         <ChevronDown className="w-4 h-4 text-gray-400" />
// //                       ) : (
// //                         <ChevronRight className="w-4 h-4 text-gray-400" />
// //                       )}
// //                     </div>
// //                   </button>

// //                   {/* Expanded evidence */}
// //                   {isExpanded && event.source && (
// //                     <div className="px-4 pb-4 pl-16">
// //                       <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
// //                         <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
// //                           Source Evidence
// //                         </h4>
// //                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
// //                           <div>
// //                             <span className="text-gray-500">Table</span>
// //                             <p className="font-medium text-gray-900">{event.source.table}</p>
// //                           </div>
// //                           <div>
// //                             <span className="text-gray-500">Row ID</span>
// //                             <p className="font-medium text-gray-900 font-mono">{event.source.rowId}</p>
// //                           </div>
// //                           <div>
// //                             <span className="text-gray-500">Field</span>
// //                             <p className="font-medium text-gray-900">{event.source.field}</p>
// //                           </div>
// //                           <div>
// //                             <span className="text-gray-500">Timestamp</span>
// //                             <p className="font-medium text-gray-900">{event.source.timestampField}</p>
// //                           </div>
// //                         </div>
// //                       </div>
// //                     </div>
// //                   )}
// //                 </div>
// //               );
// //             })
// //           )}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default PatientView;

// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import {
//   ArrowLeft, Clock, Filter, AlertCircle, Activity, Pill, Syringe,
//   MoveHorizontal, FileText, Stethoscope, ExternalLink, Shield, Database,
// } from 'lucide-react';
// import {
//   getPatient, getPatientAdmissions, getTimeline,
// } from '../services/api';
// import QueryBox from '../components/QueryBox';
// import AIResponse from '../components/AIResponse';
// import EvidencePanel from '../components/EvidencePanel';

// // Full literal class strings — Tailwind keeps these; `bg-${x}-100` gets purged.
// const EVENT_STYLES = {
//   ADMISSION:  { label: 'Admission',  dot: 'bg-blue-500',   badge: 'bg-blue-100 text-blue-700',     icon: FileText },
//   LAB:        { label: 'Lab',        dot: 'bg-green-500',  badge: 'bg-green-100 text-green-700',   icon: Activity },
//   MEDICATION: { label: 'Medication', dot: 'bg-purple-500', badge: 'bg-purple-100 text-purple-700', icon: Pill },
//   PROCEDURE:  { label: 'Procedure',  dot: 'bg-indigo-500', badge: 'bg-indigo-100 text-indigo-700', icon: Syringe },
//   TRANSFER:   { label: 'Transfer',   dot: 'bg-orange-500', badge: 'bg-orange-100 text-orange-700', icon: MoveHorizontal },
//   DIAGNOSIS:  { label: 'Diagnosis',  dot: 'bg-red-500',    badge: 'bg-red-100 text-red-700',       icon: FileText },
//   ICU:        { label: 'ICU',        dot: 'bg-pink-500',   badge: 'bg-pink-100 text-pink-700',     icon: Stethoscope },
// };

// const FILTERS = ['All', 'LAB', 'MEDICATION', 'PROCEDURE', 'TRANSFER', 'DIAGNOSIS', 'ICU'];

// const PatientView = () => {
//   const { subjectId } = useParams();
//   const navigate = useNavigate();

//   const [patient, setPatient] = useState(null);
//   const [admissions, setAdmissions] = useState([]);
//   const [selectedAdmission, setSelectedAdmission] = useState(null);
//   const [timeline, setTimeline] = useState([]);
//   const [filter, setFilter] = useState('All');
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const [queryResult, setQueryResult] = useState(null);
//   const [evidenceEventId, setEvidenceEventId] = useState(null);
//   const [showEvidence, setShowEvidence] = useState(false);

//   useEffect(() => {
//     const load = async () => {
//       try {
//         setLoading(true);
//         const [pRes, aRes] = await Promise.all([
//           getPatient(subjectId),
//           getPatientAdmissions(subjectId),
//         ]);
//         setPatient(pRes.data.data);
//         const adms = aRes.data.data || [];
//         setAdmissions(adms);
//         if (adms.length > 0) setSelectedAdmission(adms[0]);
//       } catch (err) {
//         console.error(err);
//         setError('Failed to load patient data');
//       } finally {
//         setLoading(false);
//       }
//     };
//     load();
//   }, [subjectId]);

//   useEffect(() => {
//     if (!selectedAdmission) return;
//     setQueryResult(null); // reset AI answer when admission changes
//     const load = async () => {
//       try {
//         const res = await getTimeline(selectedAdmission.hadmId, {
//           eventType: filter !== 'All' ? filter : undefined,
//         });
//         // backend returns { events } (timelineController)
//         setTimeline(res.data.events || res.data.data || []);
//       } catch (err) {
//         console.error(err);
//         setTimeline([]);
//       }
//     };
//     load();
//   }, [selectedAdmission, filter]);

//   const openEvidence = (eventId) => {
//     setEvidenceEventId(eventId);
//     setShowEvidence(true);
//   };

//   const formatTime = (t) => (t ? new Date(t).toLocaleString() : '');

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-[400px]">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
//           <p className="text-gray-500 mt-4">Loading patient data...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error || !patient) {
//     return (
//       <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
//         <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
//         <p className="text-red-600">{error || 'Patient not found'}</p>
//         <button onClick={() => navigate('/')} className="mt-4 text-sm text-red-600 hover:text-red-800">
//           Return to Dashboard
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <button
//         onClick={() => navigate('/')}
//         className="flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
//       >
//         <ArrowLeft className="w-4 h-4 mr-1" />
//         Back to Dashboard
//       </button>

//       {/* Patient header */}
//       <div className="bg-white rounded-lg border border-gray-200 p-6">
//         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//           <div className="flex items-center space-x-4">
//             <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center">
//               <Activity className="w-6 h-6 text-indigo-600" />
//             </div>
//             <div>
//               <h1 className="text-2xl font-bold text-gray-900">Patient {patient.subjectId}</h1>
//               <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
//                 <span>Gender: {patient.gender}</span>
//                 <span>•</span>
//                 <span>Age: {patient.anchorAge}</span>
//                 <span>•</span>
//                 <span>{admissions.length} admissions</span>
//               </div>
//             </div>
//           </div>
//           <div className="flex items-center space-x-2 text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full">
//             <Shield className="w-3 h-3" />
//             <span>Not for Clinical Use</span>
//           </div>
//         </div>
//       </div>

//       {/* Admission selector */}
//       <div className="bg-white rounded-lg border border-gray-200 p-4">
//         <div className="flex flex-wrap items-center gap-2">
//           <span className="text-sm font-medium text-gray-700 mr-2">Admission:</span>
//           {admissions.map((a) => (
//             <button
//               key={a.hadmId}
//               onClick={() => setSelectedAdmission(a)}
//               className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
//                 selectedAdmission?.hadmId === a.hadmId
//                   ? 'bg-indigo-600 text-white'
//                   : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//               }`}
//             >
//               #{a.hadmId} · {new Date(a.admissionTime).toLocaleDateString()}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Timeline */}
//       <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
//         <div className="p-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
//           <div className="flex items-center space-x-2">
//             <Clock className="w-5 h-5 text-gray-400" />
//             <h2 className="font-semibold text-gray-900">Timeline</h2>
//             <span className="text-sm text-gray-400">{timeline.length} events</span>
//           </div>
//           <div className="flex flex-wrap items-center gap-2">
//             <Filter className="w-4 h-4 text-gray-400" />
//             {FILTERS.map((f) => (
//               <button
//                 key={f}
//                 onClick={() => setFilter(f)}
//                 className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
//                   filter === f ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
//                 }`}
//               >
//                 {f}
//               </button>
//             ))}
//           </div>
//         </div>

//         <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
//           {timeline.length === 0 ? (
//             <div className="p-8 text-center text-gray-500">
//               <Database className="w-12 h-12 text-gray-300 mx-auto mb-3" />
//               <p>No events found</p>
//               <p className="text-sm">Try a different admission or filter</p>
//             </div>
//           ) : (
//             timeline.map((event, i) => {
//               const style = EVENT_STYLES[event.eventType] || EVENT_STYLES.LAB;
//               const Icon = style.icon;
//               return (
//                 <div key={event._id || i} className="p-4 flex items-start gap-4 hover:bg-gray-50">
//                   <div className="flex flex-col items-center">
//                     <div className={`w-3 h-3 rounded-full ${style.dot} mt-1.5`} />
//                     {i < timeline.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 mt-1" />}
//                   </div>

//                   <div className="flex-1 min-w-0">
//                     <div className="flex flex-wrap items-center gap-2">
//                       <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${style.badge}`}>
//                         <Icon className="w-3 h-3 inline mr-1" />
//                         {style.label}
//                       </span>
//                       <span className="text-sm text-gray-500">{formatTime(event.eventTime)}</span>
//                     </div>
//                     <p className="text-gray-900 font-medium mt-0.5">{event.title}</p>
//                     {event.value && (
//                       <p className="text-sm text-gray-600">{event.value} {event.unit || ''}</p>
//                     )}
//                   </div>

//                   <button
//                     onClick={() => openEvidence(event._id)}
//                     className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
//                   >
//                     <ExternalLink className="w-3 h-3" />
//                     View Source
//                   </button>
//                 </div>
//               );
//             })
//           )}
//         </div>
//       </div>

//       {/* AI query */}
//       <div className="space-y-4">
//         <QueryBox
//           hadmId={selectedAdmission?.hadmId}
//           onQueryResult={setQueryResult}
//         />
//         {queryResult && <AIResponse result={queryResult} />}
//       </div>

//       {/* Evidence modal for timeline "View Source" */}
//       <EvidencePanel
//         isOpen={showEvidence}
//         onClose={() => setShowEvidence(false)}
//         eventId={evidenceEventId}
//       />
//     </div>
//   );
// };

// export default PatientView;

// client/src/pages/PatientView.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Clock, Filter, AlertCircle, Activity, Pill, Syringe,
  MoveHorizontal, FileText, Stethoscope, ExternalLink, Shield, Database,
} from 'lucide-react';
import { getPatient, getPatientAdmissions, getTimeline } from '../services/api';
import QueryBox from '../components/QueryBox';
import AIResponse from '../components/AIResponse';
import EvidencePanel from '../components/EvidencePanel';

// Full literal class strings — Tailwind keeps these; `bg-${x}-100` gets purged.
const EVENT_STYLES = {
  ADMISSION:  { label: 'Admission',  dot: 'bg-blue-500',    badge: 'bg-blue-50 text-blue-700',       icon: FileText },
  LAB:        { label: 'Lab',        dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700', icon: Activity },
  MEDICATION: { label: 'Medication', dot: 'bg-purple-500',  badge: 'bg-purple-50 text-purple-700',   icon: Pill },
  PROCEDURE:  { label: 'Procedure',  dot: 'bg-amber-500',   badge: 'bg-amber-50 text-amber-700',     icon: Syringe },
  TRANSFER:   { label: 'Transfer',   dot: 'bg-cyan-500',    badge: 'bg-cyan-50 text-cyan-700',       icon: MoveHorizontal },
  DIAGNOSIS:  { label: 'Diagnosis',  dot: 'bg-red-500',     badge: 'bg-red-50 text-red-700',         icon: FileText },
  ICU:        { label: 'ICU',        dot: 'bg-indigo-500',  badge: 'bg-indigo-50 text-indigo-700',   icon: Stethoscope },
};

const FILTERS = ['All', 'LAB', 'MEDICATION', 'PROCEDURE', 'TRANSFER', 'DIAGNOSIS', 'ICU'];

const PatientView = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [admissions, setAdmissions] = useState([]);
  const [selectedAdmission, setSelectedAdmission] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [queryResult, setQueryResult] = useState(null);
  const [evidenceEventId, setEvidenceEventId] = useState(null);
  const [showEvidence, setShowEvidence] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [pRes, aRes] = await Promise.all([getPatient(subjectId), getPatientAdmissions(subjectId)]);
        setPatient(pRes.data.data);
        const adms = aRes.data.data || [];
        setAdmissions(adms);
        if (adms.length > 0) setSelectedAdmission(adms[0]);
      } catch (err) {
        console.error(err);
        setError('Failed to load patient data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [subjectId]);

  useEffect(() => {
    if (!selectedAdmission) return;
    setQueryResult(null);
    const load = async () => {
      try {
        const res = await getTimeline(selectedAdmission.hadmId, {
          eventType: filter !== 'All' ? filter : undefined,
        });
        setTimeline(res.data.events || res.data.data || []);
      } catch (err) {
        console.error(err);
        setTimeline([]);
      }
    };
    load();
  }, [selectedAdmission, filter]);

  const openEvidence = (eventId) => {
    setEvidenceEventId(eventId);
    setShowEvidence(true);
  };

  const formatTime = (t) => (t ? new Date(t).toLocaleString() : '');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-indigo-600 mx-auto"></div>
          <p className="text-sm text-gray-400 mt-3">Loading patient data…</p>
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
        <p className="text-sm text-red-600">{error || 'Patient not found'}</p>
        <button onClick={() => navigate('/')} className="mt-3 text-sm font-medium text-red-600 hover:text-red-800">
          Return to dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <button
        onClick={() => navigate('/')}
        className="flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to dashboard
      </button>

      {/* Patient header */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              <Activity className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Patient <span className="font-mono">#{patient.subjectId}</span>
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                <span>{patient.gender}</span>
                <span className="text-gray-300">·</span>
                <span>{patient.anchorAge}y</span>
                <span className="text-gray-300">·</span>
                <span>{admissions.length} admissions</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-100 px-2.5 py-1.5 rounded-full flex-shrink-0">
            <Shield className="w-3 h-3" />
            <span>Not for clinical use</span>
          </div>
        </div>
      </div>

      {/* Admission selector */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-500 mr-1">Admission</span>
          {admissions.map((a) => {
            const selected = selectedAdmission?.hadmId === a.hadmId;
            return (
              <button
                key={a.hadmId}
                onClick={() => setSelectedAdmission(a)}
                className={`px-3 py-1.5 rounded-lg text-sm font-mono transition-colors ${
                  selected ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                #{a.hadmId} · {new Date(a.admissionTime).toLocaleDateString()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-800">Timeline</h2>
            <span className="text-xs text-gray-400">{timeline.length} events</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-gray-400 mr-0.5" />
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                  filter === f ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
          {timeline.length === 0 ? (
            <div className="p-10 text-center">
              <Database className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No events found</p>
              <p className="text-xs text-gray-400 mt-0.5">Try a different admission or filter</p>
            </div>
          ) : (
            timeline.map((event, i) => {
              const style = EVENT_STYLES[event.eventType] || EVENT_STYLES.LAB;
              const Icon = style.icon;
              return (
                <div key={event._id || i} className="p-4 flex items-start gap-3 hover:bg-gray-50">
                  <div className="flex flex-col items-center pt-1.5">
                    <div className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium ${style.badge}`}>
                        <Icon className="w-3 h-3" />
                        {style.label}
                      </span>
                      <span className="text-xs font-mono text-gray-400">{formatTime(event.eventTime)}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mt-1">{event.title}</p>
                    {event.value && (
                      <p className="text-sm text-gray-500">{event.value} {event.unit || ''}</p>
                    )}
                  </div>

                  <button
                    onClick={() => openEvidence(event._id)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 flex-shrink-0"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Source
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* AI query */}
      <div className="space-y-4">
        <QueryBox hadmId={selectedAdmission?.hadmId} onQueryResult={setQueryResult} />
        {queryResult && <AIResponse result={queryResult} />}
      </div>

      <EvidencePanel isOpen={showEvidence} onClose={() => setShowEvidence(false)} eventId={evidenceEventId} />
    </div>
  );
};

export default PatientView;