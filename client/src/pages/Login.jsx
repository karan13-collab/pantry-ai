import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, ArrowRight, AlertCircle, ChefHat } from 'lucide-react';

import '../css/login.css'; 

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { username, password } = formData;
  
  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const result = await login(username, password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.msg || "Login failed");
      setIsLoading(false);
    }
  };

  return (
    <div className="login_page">

      <div className="login_left_part">

        <div className="login_box">
          

          <div className="header_space">
            <div className="logo_container">
              <div className="logo_icon_bg">
                 <ChefHat className="w-6 h-6 text-white" />
              </div>
              <h1 className="logo_text">PantryAI</h1>
            </div>
            <h2 className="welcome_title">Welcome back.</h2>
            <p className="welcome_subtitle">Log in</p>
          </div>

      
          {error && (
             <div className="error_message">
               <AlertCircle className="w-5 h-5 shrink-0" color="#ef4444" />
               <span className="font-medium">{error}</span>
             </div>
          )}

          <form onSubmit={onSubmit}>
            
       
            <div className="email_box_margin">
              <label className="input">Email or Username</label>
              <div className="input-wrapper">
                <div className="input-icon">
                  <User className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  name="username"
                  value={username}
                  onChange={onChange}
                  className="form_input"
                  placeholder="Enter email or username"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="form-group">
              <div className="label-row">
                <label className="input" style={{marginBottom: 0}}>Password</label>
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