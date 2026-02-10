import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Key, ArrowRight, Loader, CheckCircle, AlertTriangle } from 'lucide-react';
import api from '../services/api';
import '../css/ForgotPassword.css'; // Import the CSS file

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
    <div className="forgot-password-page">
      
      {/* Background FX */}
      <div className="bg-gradient"></div>
      <div className="bg-texture"></div>

      <div className="password-card">
        
        <div className="card-header">
          <div className="icon-wrapper">
             {step === 1 ? <Key className="w-8 h-8 text-emerald-400" /> : <Lock className="w-8 h-8 text-emerald-400" />}
          </div>
          <h2 className="title">
            {step === 1 ? "Forgot Password?" : "Reset Password"}
          </h2>
          <p className="subtitle">
            {step === 1 ? "No worries, we'll send you OTP to reset password." : "Create a new secure password."}
          </p>
        </div>

        {error && (
          <div className="alert-box alert-error">
            <AlertTriangle className="w-4 h-4"/> {error}
          </div>
        )}

        {successMsg && step === 2 && !error && (
          <div className="alert-box alert-success">
            <CheckCircle className="w-4 h-4"/> {successMsg}
          </div>
        )}

        {/* --- FORM STEP 1: ENTER EMAIL --- */}
        {step === 1 && (
          <form onSubmit={handleRequestOtp}>
            <div className="form-group">
               <label className="input-label">Email Address</label>
               <div className="input-wrapper">
                  <Mail className="input-icon"/>
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input" 
                    required 
                  />
               </div>
            </div>

            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? <Loader className="w-5 h-5 animate-spin"/> : <>Send Reset Code <ArrowRight className="w-5 h-5"/></>}
            </button>
          </form>
        )}

        {/* --- FORM STEP 2: VERIFY & NEW PASS --- */}
        {step === 2 && (
          <form onSubmit={handleResetPassword}>
             <div className="form-group">
               <label className="input-label">Verification Code</label>
               <input 
                  type="text" 
                  placeholder="000000" 
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="otp-input" 
                  required 
                />
             </div>

             <div className="form-group">
               <label className="input-label">New Password</label>
               <div className="input-wrapper">
                  <Lock className="input-icon"/>
                  <input 
                    type="password" 
                    placeholder="Enter new password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="form-input" 
                    required 
                  />
               </div>
             </div>

             <button type="submit" disabled={loading} className="submit-btn">
               {loading ? <Loader className="w-5 h-5 animate-spin"/> : "Reset Password"}
             </button>
          </form>
        )}

        <div className="footer-link-container">
          <Link to="/" className="back-link">
            ← Back to Login
          </Link>
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;