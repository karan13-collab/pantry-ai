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
      

      <div className="login_left">
        <div className="login_form">
          

          <div className="login_header">
            <div className="logo_box">
              <div className="logo_icon">
                 <ChefHat className="w-6 h-6 text-white" />
              </div>
              <h1 className="logo_title">PantryAI</h1>
            </div>
            <h2 className="welcome_text">Welcome back.</h2>
            <p className="welcome_subtext">Log in</p>
          </div>

          {error && (
             <div className="error_box">
               <AlertCircle className="w-5 h-5" color="#ef4444" />
               <span>{error}</span>
             </div>
          )}

          <form onSubmit={onSubmit}>

            <div className="input_group">
              <label className="input_label">Email or Username</label>
              <div className="input_box">
                <div className="input_icon">
                  <User className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  name="username"
                  value={username}
                  onChange={onChange}
                  className="input_field"
                  placeholder="Enter email or username"
                  required
                />
              </div>
            </div>


            <div className="input_group">
              <div className="password_header">
                <label className="input_label">Password</label>
                <Link to="/forgot-password" className="forgot_password">
                    Forgot Password?
               </Link>
              </div>
              <div className="input_box">
                <div className="input_icon">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={onChange}
                  className="input_field password_field"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

          
            <button type="submit" disabled={isLoading} className="login_btn">Login
              
            </button>
          </form>

     
          <p className="signup_text">
            New to PantryAI?{' '}
            <Link to="/register" className="signup_link">
              Create an account
            </Link>
          </p>
        </div>
      </div>

      <div className="login_right">
        <img
          className="bg_image"
          src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1974&auto=format&fit=crop"
          alt="Food market"
        />
        <div className="dark_overlay"></div>
        
        <div className="quote_area">
          <blockquote className="quote_box">
            <p className="quote_text">
              "The AI chef suggestions have completely changed how we shop and cook. Less waste, better meals."
            </p>
            <footer className="quote_author">— Aman</footer>
          </blockquote>
        </div>
      </div>

    </div>
  );
};

export default Login;