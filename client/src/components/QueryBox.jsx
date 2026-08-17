// import React, { useState } from "react";
// import { Send, Loader2, AlertCircle } from "lucide-react";
// import { naturalLanguageQuery } from "../services/api";

// const QueryBox = ({ hadmId, onQueryResult }) => {
//   const [question, setQuestion] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!question.trim() || !hadmId) return;

//     setLoading(true);
//     setError(null);

//     try {
//       const response = await naturalLanguageQuery({
//         hadmId,
//         question: question.trim(),
//       });

//       if (response.data.success) {
//         onQueryResult(response.data);
//       } else {
//         setError(response.data.message || "Query failed");
//       }
//     } catch (err) {
//       console.error("Query error:", err);
//       // Safety rejections / abstentions come back as 4xx with a usable body.
//       if (err.response?.data) {
//         onQueryResult(err.response.data);
//       } else {
//         setError("Failed to process query");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
//       <form onSubmit={handleSubmit} className="space-y-3">
//         <div className="flex items-start gap-2">
//           <div className="flex-1">
//             <input
//               type="text"
//               value={question}
//               onChange={(e) => setQuestion(e.target.value)}
//               placeholder="Ask about the patient record (e.g., 'What medications were given?')"
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//               disabled={loading || !hadmId}
//             />
//           </div>
//           <button
//             type="submit"
//             disabled={loading || !question.trim() || !hadmId}
//             className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
//           >
//             {loading ? (
//               <Loader2 className="h-4 w-4 animate-spin" />
//             ) : (
//               <Send className="h-4 w-4" />
//             )}
//             Ask
//           </button>
//         </div>

//         {error && (
//           <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
//             <AlertCircle className="h-4 w-4" />
//             <span>{error}</span>
//           </div>
//         )}

//         <div className="text-xs text-gray-400">
//           {!hadmId
//             ? "Select an admission to ask questions"
//             : "Questions must be about the structured patient record"}
//         </div>
//       </form>
//     </div>
//   );
// };

// export default QueryBox;



import React, { useState } from 'react';
import { Send, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { naturalLanguageQuery } from '../services/api';

const QueryBox = ({ hadmId, onQueryResult }) => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim() || !hadmId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await naturalLanguageQuery({ hadmId, question: question.trim() });
      if (response.data.success) {
        onQueryResult(response.data);
      } else {
        setError(response.data.message || 'Query failed');
      }
    } catch (err) {
      console.error('Query error:', err);
      if (err.response?.data) {
        onQueryResult(err.response.data);
      } else {
        setError('Failed to process query');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-gray-400" />
        <h3 className="text-sm font-semibold text-gray-700">Ask about this record</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. What medications were given?"
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 disabled:bg-gray-50"
            disabled={loading || !hadmId}
          />
          <button
            type="submit"
            disabled={loading || !question.trim() || !hadmId}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2 flex-shrink-0"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span>Ask</span>
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <p className="text-xs text-gray-400">
          {!hadmId
            ? 'Select an admission to ask questions.'
            : 'Answers are grounded only in this admission\u2019s structured records.'}
        </p>
      </form>
    </div>
  );
};

export default QueryBox;