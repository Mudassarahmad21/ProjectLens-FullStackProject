// import React from 'react';
// import { User, Calendar as CalendarIcon, Activity } from 'lucide-react';

// const PatientHeader = ({ patient, admission }) => {
//   if (!patient) return null;

//   const formatDate = (date) => {
//     if (!date) return 'N/A';
//     return new Date(date).toLocaleDateString('en-US', {
//       month: 'short',
//       day: 'numeric',
//       year: 'numeric',
//     });
//   };

//   return (
//     <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
//       <div className="flex flex-wrap items-center gap-4">
//         <div className="flex items-center gap-3">
//           <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
//             <User className="h-6 w-6 text-indigo-600" />
//           </div>
//           <div>
//             <h2 className="text-xl font-semibold text-gray-800">
//               Patient #{patient.subjectId}
//             </h2>
//             <div className="flex items-center gap-3 text-sm text-gray-500">
//               <span>{patient.gender}</span>
//               <span>•</span>
//               <span>{patient.anchorAge} years</span>
//               <span>•</span>
//               <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
//                 {patient.anchorYearGroup}
//               </span>
//             </div>
//           </div>
//         </div>

//         {admission && (
//           <div className="ml-auto border-l border-gray-200 pl-4">
//             <div className="flex items-center gap-2 text-sm">
//               <CalendarIcon className="h-4 w-4 text-gray-400" />
//               <span className="text-gray-600">
//                 Admission #{admission.hadmId}
//               </span>
//             </div>
//             <div className="flex items-center gap-2 text-sm text-gray-500">
//               <Activity className="h-4 w-4 text-gray-400" />
//               <span>{admission.admissionType}</span>
//               <span>•</span>
//               <span>{formatDate(admission.admissionTime)}</span>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default PatientHeader;


import React from 'react';
import { User, Calendar as CalendarIcon, Activity } from 'lucide-react';

const PatientHeader = ({ patient, admission }) => {
  if (!patient) return null;

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
            <User className="h-5 w-5 text-gray-500" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Patient <span className="font-mono">#{patient.subjectId}</span>
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{patient.gender}</span>
              <span className="text-gray-300">·</span>
              <span>{patient.anchorAge} yrs</span>
              {patient.anchorYearGroup && (
                <>
                  <span className="text-gray-300">·</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {patient.anchorYearGroup}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {admission && (
          <div className="sm:ml-auto sm:border-l sm:border-gray-200 sm:pl-4 text-sm">
            <div className="flex items-center gap-1.5 text-gray-700 font-medium">
              <CalendarIcon className="h-3.5 w-3.5 text-gray-400" />
              <span className="font-mono">#{admission.hadmId}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-500 mt-0.5">
              <Activity className="h-3.5 w-3.5 text-gray-400" />
              <span>{admission.admissionType}</span>
              <span className="text-gray-300">·</span>
              <span>{formatDate(admission.admissionTime)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientHeader;