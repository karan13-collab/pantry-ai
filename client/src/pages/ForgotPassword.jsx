import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Key, ArrowRight, Loader, CheckCircle, AlertTriangle } from 'lucide-react';
import api from '../services/api';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setStep(2);
      setSuccessMsg(`Code sent to ${email}`);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to send code");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/reset-password', { email, otp, newPassword });
      setSuccessMsg("Password reset successfully! Redirecting...");
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to reset password");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black font-sans px-4 relative overflow-hidden">
      
      {/* Background FX */}
      <div className="absolute inset-0 z-0">
         <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-emerald-950/20"></div>
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
      </div>

      <div className="bg-gray-900/60 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/10 relative z-10 animate-fade-in-up">
        
        <div className="text-center mb-8">
          <div className="bg-emerald-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/20 shadow-lg shadow-emerald-900/20">
             {step === 1 ? <Key className="w-8 h-8 text-emerald-400" /> : <Lock className="w-8 h-8 text-emerald-400" />}
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {step === 1 ? "Forgot Password?" : "Reset Password"}
          </h2>
          <p className="text-gray-400 text-sm">
            {step === 1 ? "No worries, we'll send you OTP to reset password." : "Create a new secure password."}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-3 mb-6 rounded-xl text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4"/> {error}
          </div>
        )}

        {successMsg && step === 2 && !error && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 p-3 mb-6 rounded-xl text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4"/> {successMsg}
          </div>
        )}

        {/* --- FORM STEP 1: ENTER EMAIL --- */}
        {step === 1 && (
          <form onSubmit={handleRequestOtp} className="space-y-6">
            <div className="space-y-2">
               <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email Address</label>
               <div className="relative group">
                  <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-500 group-focus-within:text-emerald-400 transition-colors"/>
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 p-3 bg-black/40 border border-white/10 rounded-xl text-white focus:border-emerald-500 focus:outline-none transition-all placeholder-gray-600" 
                    required 
                  />
               </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-emerald-900/30 transition-all flex items-center justify-center gap-2">
              {loading ? <Loader className="w-5 h-5 animate-spin"/> : <>Send Reset Code <ArrowRight className="w-5 h-5"/></>}
            </button>
          </form>
        )}

        {/* --- FORM STEP 2: VERIFY & NEW PASS --- */}
        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-6">
             <div className="space-y-2">
               <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Verification Code</label>
               <input 
                  type="text" 
                  placeholder="000000" 
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full text-center text-2xl tracking-[8px] font-mono p-3 bg-black/40 border border-white/10 rounded-xl text-white focus:border-emerald-500 focus:outline-none transition-all placeholder-gray-700" 
                  required 
                />
             </div>

             <div className="space-y-2">
               <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">New Password</label>
               <div className="relative group">
                  <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-500 group-focus-within:text-emerald-400 transition-colors"/>
                  <input 
                    type="password" 
                    placeholder="Enter new password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-12 p-3 bg-black/40 border border-white/10 rounded-xl text-white focus:border-emerald-500 focus:outline-none transition-all placeholder-gray-600" 
                    required 
                  />
               </div>
             </div>

             <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-emerald-900/30 transition-all flex items-center justify-center gap-2">
               {loading ? <Loader className="w-5 h-5 animate-spin"/> : "Reset Password"}
             </button>
          </form>
        )}

        <div className="mt-8 text-center">
          <Link to="/" className="text-sm text-gray-500 hover:text-white transition-colors flex items-center justify-center gap-2">
            ← Back to Login
          </Link>
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;