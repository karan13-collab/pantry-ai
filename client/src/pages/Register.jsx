import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Users, Home, Activity, AlertTriangle, ArrowRight, ChefHat, 
  User, Mail, Loader, CheckCircle 
} from 'lucide-react'; 
import api from '../services/api'; 

const Register = () => {
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    username: '', email: '', password: '',
    age: '', height: '', weight: '', gender: 'male',
    workoutDays: 0, 
    allergies: [],  
    dietaryPreferences: 'None',
    householdAction: 'create',
    joinCode: '',       
    householdName: ''
  });

  const [otp, setOtp] = useState('');

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

  const onRegisterSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await api.post('/auth/register', formData);
      setStep(2);
      setIsLoading(false);
    } catch (err) {
      setError(err.response?.data?.msg || "Registration failed. Please check your inputs.");
      setIsLoading(false);
    }
  };

  const onVerifySubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await api.post('/auth/verify-email', { email: formData.email, otp });
      
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
      window.location.reload(); 
    } catch (err) {
      setError(err.response?.data?.msg || "Invalid or Expired OTP.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-black font-sans overflow-hidden text-gray-200">
      
      {/* === LEFT SIDE - FORM SECTION (SCROLLABLE) === */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:w-1/2 xl:w-[45%] relative z-10 border-r border-gray-800 bg-black h-screen overflow-y-auto custom-scrollbar">
        
        <div className="mx-auto w-full max-w-md relative z-20 animate-fade-in-up pb-10">
          
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 p-2.5 rounded-xl shadow-lg shadow-blue-900/40">
                 <ChefHat className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">PantryAI</h1>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {step === 1 ? "Create Account" : "Verify Email"}
            </h2>
            <p className="text-gray-400">
              {step === 1 ? "Join the smart kitchen revolution." : `Enter the code sent to ${formData.email}`}
            </p>
          </div>
          
          {error && (
            <div className="bg-red-900/20 border-l-4 border-red-500 text-red-300 p-4 mb-6 rounded-r-lg text-sm font-medium flex items-center gap-2 animate-bounce-in">
              <AlertTriangle className="w-4 h-4"/> {error}
            </div>
          )}
          
          {/* --- STEP 1: REGISTRATION FORM --- */}
          {step === 1 && (
            <form onSubmit={onRegisterSubmit} className="space-y-8 animate-fade-in">
              
              {/* 1. HOUSEHOLD SETUP */}
              <div className="space-y-4">
                 <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block ml-1">Household Setup</label>
                 <div className="grid grid-cols-2 gap-4">
                  <button type="button" onClick={() => setFormData({ ...formData, householdAction: 'create' })}
                    className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${formData.householdAction === 'create' ? 'border-emerald-500 bg-emerald-900/20 text-emerald-400' : 'border-gray-800 bg-gray-900 text-gray-500 hover:border-gray-700'}`}>
                    <Home className="w-6 h-6"/><span className="text-xs font-bold">New Pantry</span>
                  </button>
                  <button type="button" onClick={() => setFormData({ ...formData, householdAction: 'join' })}
                    className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${formData.householdAction === 'join' ? 'border-blue-500 bg-blue-900/20 text-blue-400' : 'border-gray-800 bg-gray-900 text-gray-500 hover:border-gray-700'}`}>
                    <Users className="w-6 h-6"/><span className="text-xs font-bold">Join Existing</span>
                  </button>
                </div>

                <div className="mt-6">
                  {formData.householdAction === 'create' ? (
                     <div className="animate-fade-in space-y-12">
                       <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block ml-1">Pantry Name</label>
                       <div className="relative group ">
                         <input type="text" name="householdName" placeholder="e.g. The Penthouse" onChange={onChange} className=" w-full p-3 bg-gray-900 border border-gray-800 rounded-xl text-white focus:border-emerald-500 focus:outline-none transition-all placeholder-gray-600" required={formData.householdAction === 'create'}/>
                       </div>
                     </div>
                  ) : (
                     <div className="animate-fade-in space-y-2">
                       <label className="text-xs font-bold text-blue-500 uppercase tracking-wider block ml-1">Enter Join Code</label>
                       <div className="relative group">
                         <input type="text" name="joinCode" placeholder="Enter 6-Digit Code" onChange={onChange} className="w-full p-3 bg-gray-900 border border-gray-800 rounded-xl text-white font-mono uppercase tracking-widest font-bold focus:border-blue-500 focus:outline-none transition-all placeholder-gray-600" maxLength={6} required={formData.householdAction === 'join'}/>
                       </div>
                     </div>
                  )}
                </div>
              </div>

              {/* 2. PERSONAL DETAILS */}
              <div className="space-y-4">
                 <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block ml-1">Personal Details</label>
                 <div className="grid gap-3">
                   <div className="relative group">
                      <User className="absolute left-4 top-3.5 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors"/>
                      <input type="text" name="username" placeholder="Username" onChange={onChange} className="w-full pl-12 p-3 bg-gray-900 border border-gray-800 rounded-xl text-white focus:border-blue-500 focus:outline-none transition-all placeholder-gray-600" required />
                   </div>
                   <input type="email" name="email" placeholder="Email Address" onChange={onChange} className="w-full p-3 bg-gray-900 border border-gray-800 rounded-xl text-white focus:border-blue-500 focus:outline-none transition-all placeholder-gray-600" required />
                   <input type="password" name="password" placeholder="Password" onChange={onChange} className="w-full p-3 bg-gray-900 border border-gray-800 rounded-xl text-white focus:border-blue-500 focus:outline-none transition-all placeholder-gray-600" required />
                 </div>

                 <div className="grid grid-cols-2 gap-3">
                   <input type="number" name="age" placeholder="Age" onChange={onChange} className="w-full p-3 bg-gray-900 border border-gray-800 rounded-xl text-white focus:border-blue-500 focus:outline-none transition-all placeholder-gray-600" required />
                   <select name="gender" onChange={onChange} className="w-full p-3 bg-gray-900 border border-gray-800 rounded-xl text-gray-300 focus:border-blue-500 focus:outline-none transition-all">
                      <option value="male">Male</option><option value="female">Female</option>
                   </select>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-3">
                   <div className="relative">
                      <span className="absolute right-4 top-3.5 text-xs font-bold text-gray-500">CM</span>
                      <input type="number" name="height" placeholder="Height" onChange={onChange} className="w-full p-3 bg-gray-900 border border-gray-800 rounded-xl text-white focus:border-blue-500 focus:outline-none transition-all placeholder-gray-600" required />
                   </div>
                   <div className="relative">
                      <span className="absolute right-4 top-3.5 text-xs font-bold text-gray-500">KG</span>
                      <input type="number" name="weight" placeholder="Weight" onChange={onChange} className="w-full p-3 bg-gray-900 border border-gray-800 rounded-xl text-white focus:border-blue-500 focus:outline-none transition-all placeholder-gray-600" required />
                   </div>
                 </div>
              </div>

              {/* 3. HEALTH & FITNESS */}
              <div className="space-y-4">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block ml-1">Health Profile</label>
                
                <div className="bg-gray-900 p-5 rounded-2xl border border-gray-800">
                   <h3 className="text-sm font-bold text-orange-400 mb-4 flex items-center gap-2"><Activity className="w-4 h-4"/> Activity Level</h3>
                   <div className="mb-2">
                     <div className="flex justify-between mb-2">
                        <span className="text-xs text-gray-400 font-semibold">Weekly Workouts</span>
                        <span className="text-sm font-bold text-white">{formData.workoutDays} Days</span>
                     </div>
                     <input 
                       type="range" min="0" max="7" 
                       name="workoutDays" value={formData.workoutDays} 
                       onChange={onChange} 
                       className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                     />
                   </div>
                </div>

                <div className="bg-gray-900 p-5 rounded-2xl border border-gray-800">
                   <h3 className="text-sm font-bold text-red-400 mb-4 flex items-center gap-2"><AlertTriangle className="w-4 h-4"/> Allergies</h3>
                   <div className="flex flex-wrap gap-2">
                     {commonAllergens.map(allergen => (
                       <button
                         key={allergen}
                         type="button"
                         onClick={() => toggleAllergy(allergen)}
                         className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                           formData.allergies.includes(allergen)
                           ? 'bg-red-600 text-white border-red-700 shadow-lg shadow-red-900/40'
                           : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-600 hover:text-gray-200'
                         }`}
                       >
                         {allergen}
                       </button>
                     ))}
                   </div>
                </div>
              </div>

              <button type="submit" disabled={isLoading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-emerald-900/20 transition-all hover:scale-[1.02] active:scale-[0.99] flex justify-center gap-2 items-center disabled:opacity-70 disabled:cursor-not-allowed">
                {isLoading ? <Loader className="w-5 h-5 animate-spin"/> : <>Complete Registration <ArrowRight className="w-5 h-5"/></>}
              </button>
            </form>
          )}

          {/* --- STEP 2: OTP VERIFICATION FORM --- */}
          {step === 2 && (
            <form onSubmit={onVerifySubmit} className="space-y-8 animate-fade-in text-center py-8">
              <div className="bg-emerald-500/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30 animate-pulse-slow">
                 <Mail className="w-10 h-10 text-emerald-400" />
              </div>
              
              <div className="space-y-2">
                 <p className="text-gray-300">We sent a verification code to:</p>
                 <p className="text-emerald-400 font-mono font-bold text-lg">{formData.email}</p>
              </div>

              <div className="relative group max-w-xs mx-auto">
                 <input 
                   type="text" 
                   placeholder="000000" 
                   maxLength={6}
                   value={otp}
                   onChange={(e) => setOtp(e.target.value)}
                   className="w-full text-center text-4xl tracking-[12px] font-mono py-4 bg-gray-900 border border-gray-800 rounded-2xl focus:border-emerald-500 outline-none text-white placeholder-gray-800 transition-all" 
                   required 
                   autoFocus
                 />
              </div>
              
              <div className="space-y-4 pt-4">
                 <button type="submit" disabled={isLoading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-emerald-900/20 transition-all hover:scale-[1.02] flex justify-center gap-2 items-center disabled:opacity-70">
                   {isLoading ? <Loader className="w-5 h-5 animate-spin"/> : "Verify & Login"}
                 </button>
                 
                 <button type="button" onClick={() => setStep(1)} className="text-sm text-gray-500 hover:text-white underline transition-colors">
                   Mistyped email? Go back
                 </button>
              </div>
            </form>
          )}

          {step === 1 && (
            <p className="mt-8 text-center text-sm text-gray-400">
              Already have an account? <Link to="/" className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors">Login here</Link>
            </p>
          )}
        </div>
      </div>

      {/* === RIGHT SIDE - VISUAL SECTION === */}
      <div className="hidden lg:block relative flex-1 w-0 overflow-hidden bg-black">
        <img
          className="absolute inset-0 h-full w-full object-cover opacity-80 contrast-110"
          src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=2070&auto=format&fit=crop"
          alt="Healthy food preparation"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 p-16 z-20 max-w-xl">
          <h2 className="text-4xl font-bold text-white mb-4">Your Health, Optimized.</h2>
        </div>
      </div>
    </div>
  );
};

export default Register;