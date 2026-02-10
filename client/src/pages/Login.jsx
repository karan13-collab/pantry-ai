import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, ArrowRight, AlertCircle, ChefHat } from 'lucide-react';

// IMPORTANT: This imports the separate CSS file
import '../css/login.css'; 

const Login = () => {
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { identifier, password } = formData;
  
  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const result = await login(identifier, password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.msg || "Login failed");
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      
      {/* === LEFT SIDE - FORM SECTION === */}
      <div className="left-section">
        
        {/* Subtle Tech Background Pattern */}
        <div className="tech-pattern"></div>

        <div className="login-content">
          
          {/* Logo Header */}
          <div className="header-section">
            <div className="logo-container">
              <div className="logo-icon-bg">
                 <ChefHat className="w-6 h-6 text-white" />
              </div>
              <h1 className="logo-text">PantryAI</h1>
            </div>
            <h2 className="welcome-title">Welcome back.</h2>
            <p className="welcome-subtitle">Log in</p>
          </div>

          {/* Error Display */}
          {error && (
             <div className="error-message">
               <AlertCircle className="w-5 h-5 shrink-0" color="#ef4444" />
               <span className="font-medium">{error}</span>
             </div>
          )}

          {/* Form */}
          <form onSubmit={onSubmit}>
            
            {/* Identifier Input */}
            <div className="form-group">
              <label className="input-label">Email or Username</label>
              <div className="input-wrapper">
                <div className="input-icon">
                  <User className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  name="identifier"
                  value={identifier}
                  onChange={onChange}
                  className="form-input"
                  placeholder="Enter email or username"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="form-group">
              <div className="label-row">
                <label className="input-label" style={{marginBottom: 0}}>Password</label>
                <Link to="/forgot-password" className="forgot-link">
                    Forgot Password?
               </Link>
              </div>
              <div className="input-wrapper">
                <div className="input-icon">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={onChange}
                  className="form-input password-font"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Submit Btn */}
            <button
              type="submit"
              disabled={isLoading}
              className="submit-btn"
            >
               {isLoading ? (
                 <div className="spinner"></div>
               ) : (
                 <>Secure Login <ArrowRight className="w-5 h-5" /></>
               )}
            </button>
          </form>

          {/* Footer */}
          <p className="footer-text">
            New to PantryAI?{' '}
            <Link to="/register" className="create-account-link">
              Create an account
            </Link>
          </p>
        </div>
      </div>

      {/* === RIGHT SIDE - VISUAL SECTION === */}
      <div className="right-section">
        <img
          className="bg-image"
          src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1974&auto=format&fit=crop"
          alt="Dark moody food market"
        />
        <div className="overlay-gradient-1"></div>
        <div className="overlay-gradient-2"></div>
        
        <div className="quote-container">
          <blockquote className="quote-box">
            <p className="quote-text">
              "The AI chef suggestions have completely changed how we shop and cook. Less waste, better meals."
            </p>
            <footer className="quote-author">
              — Aman
            </footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
};

export default Login;