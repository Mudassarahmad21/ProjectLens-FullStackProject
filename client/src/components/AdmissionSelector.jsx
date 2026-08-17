// import React from 'react';
// import { Calendar, ChevronRight } from 'lucide-react';

// const AdmissionSelector = ({ admissions, selectedHadmId, onSelectAdmission, loading }) => {
//   if (loading) {
//     return (
//       <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
//         <div className="flex items-center gap-2 mb-3">
//           <Calendar className="h-5 w-5 text-indigo-600" />
//           <h3 className="font-semibold text-gray-700">Admissions</h3>
//         </div>
//         <div className="text-center text-gray-500 text-sm py-4">Loading admissions...</div>
//       </div>
//     );
//   }

//   if (!admissions || admissions.length === 0) {
//     return (
//       <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
//         <div className="flex items-center gap-2 mb-3">
//           <Calendar className="h-5 w-5 text-indigo-600" />
//           <h3 className="font-semibold text-gray-700">Admissions</h3>
//         </div>
//         <div className="text-center text-gray-500 text-sm py-4">No admissions found</div>
//       </div>
//     );
//   }

//   const formatDate = (date) => {
//     return new Date(date).toLocaleDateString('en-US', {
//       month: 'short',
//       day: 'numeric',
//       year: 'numeric',
//     });
//   };

//   return (
//     <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
//       <div className="flex items-center gap-2 mb-3">
//         <Calendar className="h-5 w-5 text-indigo-600" />
//         <h3 className="font-semibold text-gray-700">
//           Admissions <span className="text-sm font-normal text-gray-500">({admissions.length})</span>
//         </h3>
//       </div>

//       <div className="space-y-2 max-h-60 overflow-y-auto">
//         {admissions.map((admission) => (
//           <button
//             key={admission.hadmId}
//             onClick={() => onSelectAdmission(admission.hadmId)}
//             className={`w-full text-left px-3 py-2 rounded-lg transition-colors border ${
//               selectedHadmId === admission.hadmId
//                 ? 'border-indigo-500 bg-indigo-50'
//                 : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
//             }`}
//           >
//             <div className="flex justify-between items-center">
//               <div>
//                 <div className="font-mono text-sm font-medium">#{admission.hadmId}</div>
//                 <div className="text-xs text-gray-500">
//                   {formatDate(admission.admissionTime)}
//                 </div>
//               </div>
//               <div className="text-right">
//                 <div className="text-xs font-medium text-gray-600">
//                   {admission.admissionType}
//                 </div>
//                 <ChevronRight className={`h-4 w-4 ${
//                   selectedHadmId === admission.hadmId ? 'text-indigo-600' : 'text-gray-400'
//                 }`} />
//               </div>
//             </div>
//           </button>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default AdmissionSelector;

import React from 'react';
import { Calendar, ChevronRight } from 'lucide-react';

const AdmissionSelector = ({ admissions, selectedHadmId, onSelectAdmission, loading }) => {
  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="h-4 w-4 text-gray-400" />
        <h3 className="text-sm font-semibold text-gray-700">
          Admissions
          {admissions?.length > 0 && (
            <span className="ml-1.5 font-normal text-gray-400">({admissions.length})</span>
          )}
        </h3>
      </div>

      {loading && (
        <div className="text-center text-sm text-gray-400 py-4">Loading admissions…</div>
      )}

      {!loading && (!admissions || admissions.length === 0) && (
        <div className="text-center text-sm text-gray-400 py-4">No admissions found</div>
      )}

      {!loading && admissions && admissions.length > 0 && (
        <div className="space-y-1.5 max-h-60 overflow-y-auto -mx-1 px-1">
          {admissions.map((admission) => {
            const selected = selectedHadmId === admission.hadmId;
            return (
              <button
                key={admission.hadmId}
                onClick={() => onSelectAdmission(admission.hadmId)}
                className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${
                  selected
                    ? 'border-indigo-300 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-center gap-3">
                  <div className="min-w-0">
                    <div className="font-mono text-sm font-medium text-gray-800 truncate">
                      #{admission.hadmId}
                    </div>
                    <div className="text-xs text-gray-500">{formatDate(admission.admissionTime)}</div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="text-xs text-gray-500">{admission.admissionType}</span>
                    <ChevronRight className={`h-4 w-4 ${selected ? 'text-indigo-600' : 'text-gray-300'}`} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdmissionSelector;