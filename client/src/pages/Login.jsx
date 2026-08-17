// // client/src/pages/Login.jsx
// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { Mail, Lock, LogIn, Eye, EyeOff, AlertCircle, Shield } from 'lucide-react';
// import { useAuth } from '../context/AuthContext';

// const Login = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const navigate = useNavigate();
//   const { login } = useAuth();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);

//     const result = await login(email, password);
//     if (result.success) {
//       navigate('/');
//     } else {
//       setError(result.error);
//     }
//     setLoading(false);
//   };

//   return (
//     <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
//         {/* Logo */}
//         <div className="text-center mb-8">
//           <div className="flex justify-center">
//             <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
//               <span className="text-2xl font-bold text-white">PL</span>
//             </div>
//           </div>
//           <h2 className="mt-4 text-2xl font-bold text-gray-900">Welcome Back</h2>
//           <p className="text-sm text-gray-500">Sign in to explore patient journeys</p>
//         </div>

//         {/* Error Message */}
//         {error && (
//           <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
//             <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
//             <p className="text-sm text-red-600">{error}</p>
//           </div>
//         )}

//         {/* Form */}
//         <form onSubmit={handleSubmit} className="space-y-5">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Email Address
//             </label>
//             <div className="relative">
//               <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//               <input
//                 type="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//                 className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
//                 placeholder="researcher@hospital.org"
//               />
//             </div>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Password
//             </label>
//             <div className="relative">
//               <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//               <input
//                 type={showPassword ? 'text' : 'password'}
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//                 className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
//                 placeholder="••••••••"
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//                 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
//               >
//                 {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//               </button>
//             </div>
//           </div>

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//           >
//             {loading ? (
//               <>
//                 <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
//                 Signing in...
//               </>
//             ) : (
//               <>
//                 <LogIn className="w-4 h-4" />
//                 Sign In
//               </>
//             )}
//           </button>
//         </form>

//         {/* Divider */}
//         <div className="my-6 flex items-center gap-4">
//           <div className="flex-1 border-t border-gray-200"></div>
//           <span className="text-xs text-gray-400">OR</span>
//           <div className="flex-1 border-t border-gray-200"></div>
//         </div>

//         {/* Demo Credentials */}
//         <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
//           <p className="text-xs text-gray-500 text-center mb-2">
//             🔬 Demo Credentials
//           </p>
//           <div className="text-xs text-gray-400 space-y-1">
//             <p className="flex justify-between">
//               <span>Email:</span>
//               <code className="text-gray-600">demo@patientlens.org</code>
//             </p>
//             <p className="flex justify-between">
//               <span>Password:</span>
//               <code className="text-gray-600">demo123456</code>
//             </p>
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="mt-6 text-center">
//           <p className="text-sm text-gray-500">
//             Don't have an account?{' '}
//             <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
//               Create one
//             </Link>
//           </p>
//           <div className="mt-3 flex items-center justify-center gap-1 text-xs text-gray-400">
//             <Shield className="w-3 h-3" />
//             <span>Research Prototype — Not for Clinical Use</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;

// client/src/pages/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, Eye, EyeOff, AlertCircle, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
          <div className="inline-flex w-11 h-11 bg-indigo-600 rounded-xl items-center justify-center">
            <span className="text-lg font-semibold text-white">PL</span>
          </div>
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Welcome back</h2>
          <p className="text-sm text-gray-500 mt-0.5">Sign in to explore patient journeys</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400"
                  placeholder="researcher@hospital.org"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-11 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Signing in…
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign in
                </>
              )}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="text-xs text-gray-400">or</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <p className="text-xs font-medium text-gray-500 mb-1.5">Demo credentials</p>
            <div className="text-xs text-gray-500 space-y-1">
              <p className="flex justify-between">
                <span>Email</span>
                <code className="text-gray-700 font-mono">demo@patientlens.org</code>
              </p>
              <p className="flex justify-between">
                <span>Password</span>
                <code className="text-gray-700 font-mono">demo123456</code>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 text-center">
          <p className="text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-700">
              Create one
            </Link>
          </p>
          <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-gray-400">
            <Shield className="w-3 h-3" />
            <span>Research prototype — not for clinical use</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;