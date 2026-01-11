import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, ArrowRight, AlertCircle, ChefHat } from 'lucide-react';

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
    <div className="min-h-screen flex bg-gray-950 font-sans overflow-hidden">
      
      {/* === LEFT SIDE - FORM SECTION === */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:w-1/2 xl:w-[45%] relative z-10 border-r border-gray-800/50">
        
        {/* Subtle Tech Background Pattern for Left Side */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}></div>

        <div className="mx-auto w-full max-w-sm lg:w-96 relative z-20 animate-fade-in-up">
          
          {/* Logo Header */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-tr from-emerald-500 to-teal-400 p-2.5 rounded-xl shadow-lg shadow-emerald-900/30">
                 <ChefHat className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">PantryAI</h1>
            </div>
            <h2 className="text-4xl font-bold text-white mb-3">Welcome back.</h2>
            <p className="text-gray-400 text-lg">
              Log in
            </p>
          </div>

          {/* Error Display */}
          {error && (
             <div className="bg-red-500/10 border-l-4 border-red-500 text-red-200 p-4 mb-6 rounded-r-lg flex items-center gap-3 text-sm animate-shake">
               <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
               <span className="font-medium">{error}</span>
             </div>
          )}

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-6">
            
            {/* 3. Identifier Input (Username or Email) */}
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2 ml-1">Email or Username</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
                </div>
                <input
                  type="text"
                  name="identifier"
                  value={identifier}
                  onChange={onChange}
                  className="block w-full pl-11 pr-4 py-4 bg-gray-900 border-2 border-gray-800 rounded-2xl text-gray-100 placeholder-gray-600 focus:outline-none focus:border-emerald-500 focus:bg-gray-900/80 transition-all font-medium"
                  placeholder="Enter email or username"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2 ml-1">
                <label className="block text-sm font-bold text-gray-300">Password</label>
                <Link to="/forgot-password" className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors">
                    Forgot Password?
               </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={onChange}
                  className="block w-full pl-11 pr-4 py-4 bg-gray-900 border-2 border-gray-800 rounded-2xl text-gray-100 placeholder-gray-600 focus:outline-none focus:border-emerald-500 focus:bg-gray-900/80 transition-all font-medium font-mono"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Submit Btn */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-3 py-4 px-4 border border-transparent rounded-2xl shadow-sm text-lg font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 focus:ring-offset-gray-900 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed mt-8"
            >
               {isLoading ? (
                 <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
               ) : (
                 <>Secure Login <ArrowRight className="w-5 h-5" /></>
               )}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-8 text-center text-base text-gray-400">
            New to PantryAI?{' '}
            <Link to="/register" className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors">
              Create an account
            </Link>
          </p>
        </div>
      </div>

      {/* === RIGHT SIDE - VISUAL SECTION (Hidden on mobile) === */}
      <div className="hidden lg:block relative flex-1 w-0 overflow-hidden bg-gray-900">
        <img
          className="absolute inset-0 h-full w-full object-cover scale-105 contrast-110 opacity-900  grayscale-[30%]"
          src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1974&auto=format&fit=crop"
          alt="Dark moody food market"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/60 to-emerald-900/20 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-l from-gray-950 via-transparent to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 p-16 z-20 max-w-xl">
          <blockquote className="border-l-4 border-emerald-500 pl-6">
            <p className="text-2xl font-medium text-gray-200 italic mb-4">
              "The AI chef suggestions have completely changed how we shop and cook. Less waste, better meals."
            </p>
            <footer className="text-emerald-400 font-bold">
              — Aman
            </footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
};

export default Login;