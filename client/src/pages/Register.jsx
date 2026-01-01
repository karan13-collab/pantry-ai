import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Users, Home, Activity, AlertTriangle } from 'lucide-react'; 

const Register = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: '', email: '', password: '',
    age: '', height: '', weight: '', gender: 'male',
    workoutDays: 0, 
    allergies: [],  
    householdAction: 'create',
    joinCode: '',       
    householdName: ''
  });

  const [error, setError] = useState('');

  const commonAllergens = ["Peanuts", "Dairy", "Gluten", "Soy", "Eggs", "Shellfish"];

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const toggleAllergy = (allergen) => {
    setFormData(prev => {
      const current = prev.allergies;
      if (current.includes(allergen)) {
        return { ...prev, allergies: current.filter(a => a !== allergen) };
      } else {
        return { ...prev, allergies: [...current, allergen] };
      }
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const result = await register(formData);
    if (result.success) navigate('/dashboard');
    else setError(result.msg);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-10 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg border border-gray-100">
        <h2 className="text-3xl font-extrabold mb-6 text-center text-gray-800">
          Join Pantry<span className="text-green-600">AI</span>
        </h2>
        
        {error && <div className="bg-red-50 border border-red-200 text-red-600 p-3 mb-6 rounded-lg text-sm font-medium">{error}</div>}
        
        <form onSubmit={onSubmit} className="space-y-6">
          
          {/* 1. HOUSEHOLD SECTION */}
          <div className="grid grid-cols-2 gap-4">
            <button type="button" onClick={() => setFormData({ ...formData, householdAction: 'create' })}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${formData.householdAction === 'create' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-400'}`}>
              <Home className="w-6 h-6"/><span className="text-xs font-bold">New Pantry</span>
            </button>
            <button type="button" onClick={() => setFormData({ ...formData, householdAction: 'join' })}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${formData.householdAction === 'join' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-400'}`}>
              <Users className="w-6 h-6"/><span className="text-xs font-bold">Join Existing</span>
            </button>
          </div>

          {formData.householdAction === 'create' ? (
             <div className="bg-green-50 p-3 rounded-lg border border-green-100"><label className="text-xs font-bold text-green-800 uppercase block">Pantry Name</label><input type="text" name="householdName" placeholder="e.g. The Penthouse" onChange={onChange} className="w-full p-2 border border-green-200 rounded mt-1 bg-white" /></div>
          ) : (
             <div className="bg-blue-50 p-3 rounded-lg border border-blue-100"><label className="text-xs font-bold text-blue-800 uppercase block">Join Code</label><input type="text" name="joinCode" placeholder="e.g. X9Z2A1" onChange={onChange} className="w-full p-2 border border-blue-200 rounded mt-1 bg-white uppercase font-bold tracking-widest" maxLength={6} /></div>
          )}

          {/* 2. PERSONAL DETAILS */}
          <div className="space-y-3">
             <input type="text" name="username" placeholder="Username" onChange={onChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg" required />
             <input type="email" name="email" placeholder="Email" onChange={onChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg" required />
             <input type="password" name="password" placeholder="Password" onChange={onChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input type="number" name="age" placeholder="Age" onChange={onChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg" required />
            <select name="gender" onChange={onChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <option value="male">Male</option><option value="female">Female</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input type="number" name="height" placeholder="Height (cm)" onChange={onChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg" required />
            <input type="number" name="weight" placeholder="Weight (kg)" onChange={onChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg" required />
          </div>

          {/* 3. HEALTH & FITNESS (NEW) */}
          <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
             <h3 className="text-sm font-bold text-orange-800 mb-3 flex items-center gap-2"><Activity className="w-4 h-4"/> Activity Level</h3>
             
             {/* Workout Slider */}
             <div className="mb-4">
               <label className="text-xs text-orange-600 font-semibold mb-1 block">Workouts per week: <span className="text-lg font-bold text-orange-800">{formData.workoutDays} days</span></label>
               <input 
                 type="range" min="0" max="7" 
                 name="workoutDays" value={formData.workoutDays} 
                 onChange={onChange} 
                 className="w-full h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
               />
               <div className="flex justify-between text-[10px] text-orange-400 mt-1"><span>Sedentary</span><span>Active</span></div>
             </div>
          </div>

          <div className="bg-red-50 p-4 rounded-xl border border-red-100">
             <h3 className="text-sm font-bold text-red-800 mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4"/> Allergies</h3>
             <div className="flex flex-wrap gap-2">
               {commonAllergens.map(allergen => (
                 <button
                   key={allergen}
                   type="button"
                   onClick={() => toggleAllergy(allergen)}
                   className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                     formData.allergies.includes(allergen)
                     ? 'bg-red-500 text-white border-red-600 shadow-sm'
                     : 'bg-white text-gray-500 border-gray-200 hover:border-red-300'
                   }`}
                 >
                   {allergen}
                 </button>
               ))}
             </div>
          </div>

          <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-200">
            Create Profile
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">Already have an account? <Link to="/" className="text-green-600 font-bold hover:underline">Login</Link></p>
      </div>
    </div>
  );
};

export default Register;