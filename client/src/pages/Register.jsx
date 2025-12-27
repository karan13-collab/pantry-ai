import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Users, Home } from 'lucide-react';

const Register = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: '', email: '', password: '',
    age: '', height: '', weight: '', gender: 'male', activityLevel: 'moderate',
    householdAction: 'create', // Default to creating new
    joinCode: '',       // <--- Replaced householdId with joinCode
    householdName: ''   // <--- Added for naming the pantry
  });

  const [error, setError] = useState('');

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    const result = await register(formData);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-10 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg border border-gray-100">
        <h2 className="text-3xl font-extrabold mb-6 text-center text-gray-800">
          Join Pantry<span className="text-green-600">AI</span>
        </h2>
        
        {error && <div className="bg-red-50 border border-red-200 text-red-600 p-3 mb-6 rounded-lg text-sm font-medium">{error}</div>}
        
        <form onSubmit={onSubmit} className="space-y-5">
          
          {/* --- HOUSEHOLD TOGGLE SECTION --- */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, householdAction: 'create' })}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                formData.householdAction === 'create' 
                ? 'border-green-500 bg-green-50 text-green-700' 
                : 'border-gray-200 text-gray-400 hover:border-gray-300'
              }`}
            >
              <Home className="w-6 h-6"/>
              <span className="text-sm font-bold">New Pantry</span>
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, householdAction: 'join' })}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                formData.householdAction === 'join' 
                ? 'border-blue-500 bg-blue-50 text-blue-700' 
                : 'border-gray-200 text-gray-400 hover:border-gray-300'
              }`}
            >
              <Users className="w-6 h-6"/>
              <span className="text-sm font-bold">Join Existing</span>
            </button>
          </div>

          {/* --- DYNAMIC INPUTS --- */}

          {/* OPTION A: Create New -> Show Name Input */}
          {formData.householdAction === 'create' && (
            <div className="animate-fade-in bg-green-50 p-4 rounded-lg border border-green-100">
              <label className="text-xs font-bold text-green-800 uppercase mb-1 block">Pantry Name</label>
              <input 
                type="text" 
                name="householdName" 
                placeholder="e.g. The Penthouse, Chaos Kitchen..." 
                onChange={onChange} 
                className="w-full p-2 border border-green-200 rounded focus:ring-2 focus:ring-green-500 outline-none bg-white" 
              />
            </div>
          )}

          {/* OPTION B: Join -> Show Code Input */}
          {formData.householdAction === 'join' && (
            <div className="animate-fade-in bg-blue-50 p-4 rounded-lg border border-blue-100">
              <label className="text-xs font-bold text-blue-800 uppercase mb-1 block">Enter Join Code</label>
              <input 
                type="text" 
                name="joinCode" 
                placeholder="e.g. X9Z2A1" 
                onChange={onChange} 
                className="w-full p-2 border border-blue-200 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white uppercase tracking-widest font-bold" 
                required 
                maxLength={6}
              />
              <p className="text-[10px] text-blue-600 mt-1">Ask your housemate for the 6-character code.</p>
            </div>
          )}

          {/* --- BASIC FIELDS --- */}
          <div className="space-y-3">
             <input type="text" name="username" placeholder="Username" onChange={onChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white transition-colors" required />
             <input type="email" name="email" placeholder="Email Address" onChange={onChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white transition-colors" required />
             <input type="password" name="password" placeholder="Password" onChange={onChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white transition-colors" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input type="number" name="age" placeholder="Age" onChange={onChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg" required />
            <select name="gender" onChange={onChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <option value="male">Male</option>
                <option value="female">Female</option>
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <input type="number" name="height" placeholder="Height (cm)" onChange={onChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg" required />
            <input type="number" name="weight" placeholder="Weight (kg)" onChange={onChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg" required />
          </div>

          <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-green-700 shadow-lg shadow-green-200 transition-all transform active:scale-95">
            {formData.householdAction === 'create' ? 'Create Account & Pantry' : 'Join Household'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account? <Link to="/" className="text-green-600 font-bold hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;