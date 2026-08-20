// client/src/pages/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail, Lock, User, Building2, FlaskConical, LogIn, Eye, EyeOff, AlertCircle, CheckCircle, Shield,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '', institution: '', researchInterest: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'password') checkPasswordStrength(value);
  };

  const checkPasswordStrength = (password) => {
    if (password.length === 0) setPasswordStrength('');
    else if (password.length < 6) setPasswordStrength('weak');
    else if (password.length < 10) setPasswordStrength('medium');
    else setPasswordStrength('strong');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const { confirmPassword, ...userData } = formData;
    const result = await register(userData);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const strengthColor = { weak: 'bg-red-500', medium: 'bg-amber-500', strong: 'bg-emerald-500' }[passwordStrength] || 'bg-gray-200';
  const strengthWidth = { weak: '33%', medium: '66%', strong: '100%' }[passwordStrength] || '0%';
  const strengthLabel = { weak: 'Weak', medium: 'Medium', strong: 'Strong' }[passwordStrength] || '';

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-sm w-full">
        <div className="text-center mb-6">
          <div className="inline-flex w-11 h-11 bg-indigo-600 rounded-xl items-center justify-center">
            <span className="text-lg font-semibold text-white">PL</span>
          </div>
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Create account</h2>
          <p className="text-sm text-gray-500 mt-0.5">Join the PatientLens research community</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text" name="name" value={formData.name} onChange={handleChange} required
                  className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400"
                  placeholder="Dr. Jane Smith"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email" name="email" value={formData.email} onChange={handleChange} required
                  className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400"
                  placeholder="researcher@hospital.org"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} required
                  className="w-full pl-10 pr-11 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400"
                  placeholder="Min 6 characters"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {formData.password && (
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full ${strengthColor} transition-all duration-300`} style={{ width: strengthWidth }} />
                  </div>
                  <span className="text-xs text-gray-500 min-w-[42px]">{strengthLabel}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required
                  className={`w-full pl-10 pr-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 ${
                    formData.confirmPassword && formData.password !== formData.confirmPassword
                      ? 'border-red-300'
                      : formData.confirmPassword && formData.password === formData.confirmPassword
                      ? 'border-emerald-300'
                      : 'border-gray-300'
                  }`}
                  placeholder="Confirm password"
                />
                {formData.confirmPassword && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {formData.password === formData.confirmPassword ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Institution <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text" name="institution" value={formData.institution} onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400"
                  placeholder="Your institution or organization"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Research interest <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <FlaskConical className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text" name="researchInterest" value={formData.researchInterest} onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400"
                  placeholder="e.g. ICU outcomes, medication adherence"
                />
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full py-2.5 px-4 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Creating account…
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Create account
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-5 text-center">
          <p className="text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-700">Sign in</Link>
          </p>
          <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-gray-400">
            <Shield className="w-3 h-3" />
            <span>Research prototype — not for clinical use</span>
          </div>
          <p className="mt-2 text-[11px] text-gray-400">
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;