import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Users, Home, Activity, AlertTriangle, ArrowRight, ChefHat, 
  User, Mail, Loader, Ruler, Weight
} from 'lucide-react'; 
import api from '../services/api'; 
import '../css/register.css'; // Importing the separate CSS file

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
      setError(err.response?.data?.msg || "Registration failed. Please check inputs.");
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
    <div className="register-page">
      
      {/* --- BACKGROUND EFFECTS --- */}
      <div className="blob blob-emerald"></div>
      <div className="blob blob-blue"></div>
      <div className="bg-pattern"></div>

      {/* --- CENTERED CARD --- */}
      <div className="register-card">
        
        {/* Header */}
        <div className="header-container">
          <div className="logo-wrapper">
            <div className="logo-icon">
                <ChefHat className="w-8 h-8 text-white" />
            </div>
            <h1 className="app-title">PantryAI</h1>
          </div>
          <h2 className="step-title">
            {step === 1 ? "Create Account" : "Verify Email"}
          </h2>
          <p className="step-subtitle">
            {step === 1 ? "Join the smart kitchen revolution." : `Enter the code sent to ${formData.email}`}
          </p>
        </div>
        
        {error && (
          <div className="error-box">
            <AlertTriangle className="w-4 h-4 shrink-0"/> {error}
          </div>
        )}
        
        {/* --- STEP 1: REGISTRATION FORM --- */}
        {step === 1 && (
          <form onSubmit={onRegisterSubmit}>
            
            {/* 1. HOUSEHOLD SETUP */}
            <div className="section-group">
                <label className="section-label">Household Setup</label>
                <div className="form-grid-2">
                  <button 
                    type="button" 
                    onClick={() => setFormData({ ...formData, householdAction: 'create' })}
                    className={`household-btn ${formData.householdAction === 'create' ? 'active-create' : ''}`}
                  >
                    <Home className="w-6 h-6"/><span>New Pantry</span>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setFormData({ ...formData, householdAction: 'join' })}
                    className={`household-btn ${formData.householdAction === 'join' ? 'active-join' : ''}`}
                  >
                    <Users className="w-6 h-6"/><span>Join Existing</span>
                  </button>
                </div>

                <div style={{ marginTop: '1rem' }}>
                  {formData.householdAction === 'create' ? (
                      <div className="animate-fade-in">
                        <label className="section-label" style={{color: '#34d399', marginBottom: '0.25rem'}}>Pantry Name</label>
                        <input 
                          type="text" 
                          name="householdName" 
                          placeholder="e.g. The Penthouse" 
                          onChange={onChange} 
                          className="form-input no-icon" 
                          required={formData.householdAction === 'create'}
                        />
                      </div>
                  ) : (
                      <div className="animate-fade-in">
                        <label className="section-label" style={{color: '#60a5fa', marginBottom: '0.25rem'}}>Enter Join Code</label>
                        <input 
                          type="text" 
                          name="joinCode" 
                          placeholder="Enter 6-Digit Code" 
                          onChange={onChange} 
                          className="form-input no-icon code-input" 
                          maxLength={6} 
                          required={formData.householdAction === 'join'}
                        />
                      </div>
                  )}
                </div>
            </div>

            {/* 2. PERSONAL DETAILS */}
            <div className="section-group">
                <label className="section-label">Personal Details</label>
                
                {/* User/Pass Fields */}
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  <div className="input-group">
                    <User className="input-icon"/>
                    <input type="text" name="username" placeholder="Username" onChange={onChange} className="form-input" required />
                  </div>
                  <div className="input-group">
                    <Mail className="input-icon"/>
                    <input type="email" name="email" placeholder="Email Address" onChange={onChange} className="form-input" required />
                  </div>
                  <div className="input-group">
                    {/* Reusing Lock icon concept or simple input for password */}
                    <input type="password" name="password" placeholder="Password" onChange={onChange} className="form-input no-icon" required />
                  </div>
                </div>

                {/* Age / Gender */}
                <div className="form-grid-2" style={{ marginTop: '0.75rem' }}>
                  <input type="number" name="age" placeholder="Age" onChange={onChange} className="form-input no-icon" required />
                  <select name="gender" onChange={onChange} className="form-input form-select no-icon">
                    <option value="male">Male</option><option value="female">Female</option>
                  </select>
                </div>
                
                {/* Height / Weight */}
                <div className="form-grid-2" style={{ marginTop: '0.75rem' }}>
                  <div className="input-group">
                    <div className="input-icon"><Ruler className="w-4 h-4"/></div>
                    <input type="number" name="height" placeholder="Height (cm)" onChange={onChange} className="form-input" required />
                  </div>
                  <div className="input-group">
                    <div className="input-icon"><Weight className="w-4 h-4"/></div>
                    <input type="number" name="weight" placeholder="Weight (kg)" onChange={onChange} className="form-input" required />
                  </div>
                </div>
            </div>

            {/* 3. HEALTH & FITNESS */}
            <div className="section-group">
              <label className="section-label">Health Profile</label>
              
              {/* Slider */}
              <div className="health-card">
                  <h3 className="health-title orange"><Activity className="w-4 h-4"/> Activity Level</h3>
                  <div>
                    <div className="slider-labels">
                      <span className="text-xs text-slate-400 font-semibold">Weekly Workouts</span>
                      <span className="text-sm font-bold text-white">{formData.workoutDays} Days</span>
                    </div>
                    <input 
                      type="range" min="0" max="7" 
                      name="workoutDays" value={formData.workoutDays} 
                      onChange={onChange} 
                      className="slider-range"
                    />
                  </div>
              </div>

              {/* Allergies */}
              <div className="health-card">
                  <h3 className="health-title red"><AlertTriangle className="w-4 h-4"/> Allergies</h3>
                  <div className="tags-container">
                    {commonAllergens.map(allergen => (
                      <button
                        key={allergen}
                        type="button"
                        onClick={() => toggleAllergy(allergen)}
                        className={`allergy-tag ${formData.allergies.includes(allergen) ? 'selected' : ''}`}
                      >
                        {allergen}
                      </button>
                    ))}
                  </div>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="action-btn">
              {isLoading ? <Loader className="w-5 h-5 animate-spin"/> : <>Complete Registration <ArrowRight className="w-5 h-5"/></>}
            </button>
          </form>
        )}

        {/* --- STEP 2: OTP VERIFICATION FORM --- */}
        {step === 2 && (
          <form onSubmit={onVerifySubmit} className="otp-section animate-fade-in" style={{ padding: '2rem 0' }}>
            <div className="otp-icon-container">
                <Mail className="w-10 h-10 text-emerald-400" />
            </div>
            
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <p style={{ color: '#cbd5e1' }}>We sent a verification code to:</p>
                <p className="otp-target-email">{formData.email}</p>
            </div>

            <div className="otp-input-container">
                <input 
                  type="text" 
                  placeholder="000000" 
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="otp-input" 
                  required 
                  autoFocus
                />
            </div>
            
            <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                <button type="submit" disabled={isLoading} className="otp-verify-btn">
                  {isLoading ? <Loader className="w-5 h-5 animate-spin"/> : "Verify & Login"}
                </button>
                
                <button type="button" onClick={() => setStep(1)} className="back-link">
                  Mistyped email? Go back
                </button>
            </div>
          </form>
        )}

        {step === 1 && (
          <p className="login-redirect">
            Already have an account? <Link to="/" className="login-link">Login here</Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default Register;