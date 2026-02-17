import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Key, ArrowRight, Loader, CheckCircle, AlertTriangle } from 'lucide-react';
import api from '../services/api';
import '../css/ForgotPassword.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' }); 

  const [formData, setFormData] = useState({ email: '', otp: '', newPassword: '' });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      await api.post('/auth/forgot-password', { email: formData.email });
      setStep(2);
      setMessage({ type: 'success', text: `Code sent to ${formData.email}` });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.msg || "Failed to send code" });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await api.post('/auth/reset-password', formData);
      setMessage({ type: 'success', text: "Password reset successfully! Redirecting..." });
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.msg || "Failed to reset password" });
      setLoading(false);
    }
  };

  return (
    <div className="fp-container">
      <div className="fp-bg-gradient"></div>
      <div className="fp-bg-texture"></div>

      <div className="fp-card">
        
        <div className="fp-header">
          <div className="fp-icon-wrapper">
             {step === 1 ? <Key className="text-emerald-400" size={32} /> : <Lock className="text-emerald-400" size={32} />}
          </div>
          <h2 className="fp-title">{step === 1 ? "Forgot Password?" : "Reset Password"}</h2>
          <p className="fp-subtitle">
            {step === 1 ? "We'll send you an OTP to reset your password." : "Create a new secure password."}
          </p>
        </div>

        {message.text && (
          <div className={`fp-alert ${message.type === 'error' ? 'fp-alert-error' : 'fp-alert-success'}`}>
            {message.type === 'error' ? <AlertTriangle size={16}/> : <CheckCircle size={16}/>} 
            {message.text}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleRequestOtp}>
            <div className="mb-6">
               <label className="fp-label">Email Address</label>
               <div className="fp-input-group">
                  <Mail className="fp-input-icon"/>
                  <input 
                    name="email"
                    type="email" 
                    placeholder="Enter your email" 
                    value={formData.email}
                    onChange={handleChange}
                    className="fp-input" 
                    required 
                  />
               </div>
            </div>

            <button type="submit" disabled={loading} className="fp-btn">
              {loading ? <Loader className="animate-spin" size={20}/> : <>Send Reset Code <ArrowRight size={20}/></>}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleResetPassword}>
             <div className="mb-6">
               <label className="fp-label">Verification Code</label>
               <input 
                  name="otp"
                  type="text" 
                  placeholder="000000" 
                  maxLength={6}
                  value={formData.otp}
                  onChange={handleChange}
                  className="fp-input fp-input-otp" 
                  required 
                />
             </div>

             <div className="mb-6">
               <label className="fp-label">New Password</label>
               <div className="fp-input-group">
                  <Lock className="fp-input-icon"/>
                  <input 
                    name="newPassword"
                    type="password" 
                    placeholder="Enter new password" 
                    value={formData.newPassword}
                    onChange={handleChange}
                    className="fp-input" 
                    required 
                  />
               </div>
             </div>

             <button type="submit" disabled={loading} className="fp-btn">
               {loading ? <Loader className="animate-spin" size={20}/> : "Reset Password"}
             </button>
          </form>
        )}

        <div className="mt-8 text-center">
          <Link to="/" className="text-sm text-gray-500 hover:text-white transition-colors">
            ← Back to Login
          </Link>
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;