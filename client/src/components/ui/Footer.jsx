// // client/src/components/ui/Footer.jsx

// import React from 'react';
// import { Link } from 'react-router-dom';
// import { Home, BarChart3, Shield} from 'lucide-react';

// const Footer = () => {
//   const year = new Date().getFullYear();

//   const navItems = [
//     { path: '/', label: 'Dashboard', icon: Home },
//     { path: '/evaluation', label: 'Evaluation', icon: BarChart3 },
//   ];

//   return (
//     <footer className="bg-white border-t border-gray-200 mt-auto">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-6 md:space-y-0">
//           {/* Brand */}
//           <div className="flex items-center space-x-3">
//             <div className="relative">
//               <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-md">
//                 <span className="text-white font-bold text-sm tracking-tight">PL</span>
//               </div>
//               <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
//             </div>
//             <div className="flex items-center">
//               <span className="text-lg font-bold text-gray-900 tracking-tight">PatientLens</span>
             
//             </div>
//           </div>

          
//           <span className="flex text-xs text-gray-500 gap-2">
//             © {year} All Rights are reserved By <p className='text-blue-600'>Mudassar & Muzammil</p> 
//           </span>
         
//         </div>
  
//       </div>
//     </footer>
//   );
// };

// export default Footer;

// client/src/components/ui/Footer.jsx
import React from 'react';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-semibold text-[10px] tracking-wide">PL</span>
            </div>
            <span className="text-sm font-semibold text-gray-800 tracking-tight">PatientLens</span>
          </div>

          <p className="text-xs text-gray-500">
            &copy; {year} PatientLens. Built by{' '}
            <span className="text-gray-700 font-medium">Mudassar &amp; Muzammil</span>.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;