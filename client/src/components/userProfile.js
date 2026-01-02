import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom'; // <--- NEW IMPORT
import { 
  User, Mail, Activity, Ruler, Weight, Utensils, AlertTriangle, 
  Calendar, Edit3, ShieldCheck, Users, X, Save, Clock, Check,
  CheckCircle, XCircle 
} from 'lucide-react';
import api from '../services/api'; 

const UserProfile = () => {
  
  // --- 1. LOCAL NOTIFICATION STATE ---
  const [toast, setToast] = useState(null); 

  const showToast = (msg, type = 'success') => {
    console.log(`🔔 TOAST STATE UPDATED: ${msg}`); 
    setToast({ msg, type });
    // Auto hide after 3 seconds
    setTimeout(() => setToast(null), 3000);
  };

  // --- 2. DATA STATE ---
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  const [isRenamingHousehold, setIsRenamingHousehold] = useState(false);
  const [newHouseholdName, setNewHouseholdName] = useState('');

  // --- 3. FETCH DATA ---
  const fetchProfile = async () => {
    try {
      const res = await api.get('/user/profile');
      setUser(res.data);
      setFormData({
        weight: res.data.weight,
        height: res.data.height,
        age: res.data.age,
        activityLevel: res.data.activityLevel,
        dietaryPreferences: res.data.dietaryPreferences,
        allergies: res.data.allergies.join(', ') 
      });

      if (res.data.household) {
        setNewHouseholdName(res.data.household.name);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Could not load profile data.');
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- 4. SAVE PROFILE ---
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const safeAllergies = formData.allergies || ""; 
      const updatedData = {
        ...formData,
        allergies: safeAllergies.split(',').map(a => a.trim()).filter(a => a)
      };

      await api.put('/user/profile', updatedData);
      await fetchProfile(); 
      setIsEditing(false);
      showToast("Profile updated successfully!", "success");
    } catch (err) {
      console.error("Save failed:", err);
      showToast("Failed to update profile.", "error");
    }
  };

  // --- 5. RENAME HOUSEHOLD ---
  const handleSaveHouseholdName = async () => {
    try {
      if (!newHouseholdName.trim()) return;

      const res = await api.put('/household/rename', { name: newHouseholdName });
      
      setUser({ 
        ...user, 
        household: { ...user.household, name: res.data.name } 
      });
      
      setIsRenamingHousehold(false);
      showToast("Household renamed!", "success");

    } catch (err) {
      console.log("❌ Catch block entered inside UserProfile"); 
      
      let errorMsg = "Failed to rename household";
      if (err.response && err.response.data && err.response.data.msg) {
        errorMsg = err.response.data.msg;
      }
      showToast(errorMsg, "error");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mb-4"></div>
         <p>Loading your profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-red-500 border border-red-200 bg-red-50 rounded-xl m-4 flex items-center gap-2">
        <AlertTriangle className="w-5 h-5"/> {error}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-5xl mx-auto">
      
      {/* 🔴 PORTAL NOTIFICATION 
          This renders the Toast directly into document.body, escaping 
          all CSS clipping issues from parent components.
      */}
      {toast && createPortal(
        <div className={`fixed top-10 left-1/2 transform -translate-x-1/2 z-[99999] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border-2 transition-all animate-bounce-in ${
          toast.type === 'error' 
            ? 'bg-white border-red-100 text-red-600' 
            : 'bg-white border-green-100 text-green-700'
        }`}>
          <div className={`p-2 rounded-full ${toast.type === 'error' ? 'bg-red-50' : 'bg-green-50'}`}>
            {toast.type === 'error' ? <XCircle className="w-6 h-6" /> : <CheckCircle className="w-6 h-6" />}
          </div>
          <span className="font-bold text-sm whitespace-nowrap">{toast.msg}</span>
          <button onClick={() => setToast(null)} className="ml-4 hover:opacity-70">
            <X className="w-4 h-4" />
          </button>
        </div>,
        document.body // <--- Renders outside the root app div
      )}

      {/* EDIT MODAL */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 text-lg">Edit Profile</h3>
              <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Weight (kg)</label>
                  <input type="number" name="weight" value={formData.weight} onChange={handleChange} className="w-full p-2 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-green-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Height (cm)</label>
                  <input type="number" name="height" value={formData.height} onChange={handleChange} className="w-full p-2 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-green-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Age</label>
                  <input type="number" name="age" value={formData.age} onChange={handleChange} className="w-full p-2 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-green-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Activity</label>
                  <select name="activityLevel" value={formData.activityLevel} onChange={handleChange} className="w-full p-2 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all">
                    <option value="sedentary">Sedentary</option>
                    <option value="light">Light</option>
                    <option value="moderate">Moderate</option>
                    <option value="active">Active</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Dietary Preference</label>
                <select name="dietaryPreferences" value={formData.dietaryPreferences} onChange={handleChange} className="w-full p-2 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all">
                  <option value="None">None</option>
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Vegan">Vegan</option>
                  <option value="Keto">Keto</option>
                  <option value="Paleo">Paleo</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Allergies (comma separated)</label>
                <input type="text" name="allergies" value={formData.allergies} onChange={handleChange} placeholder="Peanuts, Shellfish..." className="w-full p-2 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-green-500 outline-none transition-all" />
              </div>

              <div className="pt-2">
                <button type="submit" className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 flex justify-center gap-2 shadow-lg shadow-green-200 transition-all transform hover:scale-[1.02]">
                  <Save className="w-5 h-5" /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROFILE HEADER */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-emerald-600"></div>
        <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-200 rounded-full flex items-center justify-center text-4xl font-bold text-green-700 border-4 border-white shadow-lg">
          {user.username.charAt(0).toUpperCase()}
        </div>
        <div className="text-center md:text-left flex-1">
          <h2 className="text-3xl font-extrabold text-gray-800">{user.username}</h2>
          <div className="flex items-center justify-center md:justify-start gap-2 text-gray-500 mt-1">
            <Mail className="w-4 h-4" /> <span>{user.email}</span>
          </div>
          <div className="flex items-center justify-center md:justify-start gap-2 text-green-600 text-sm font-semibold mt-2 bg-green-50 w-fit mx-auto md:mx-0 px-3 py-1 rounded-full border border-green-100">
            <ShieldCheck className="w-4 h-4" /> Verified Member
          </div>
        </div>
        <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 hover:text-green-600 transition-colors text-sm font-semibold shadow-sm">
          <Edit3 className="w-4 h-4" /> Edit Profile
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<Calendar className="w-5 h-5 text-purple-500" />} label="Age" value={`${user.age} yrs`} color="bg-purple-50 border-purple-100"/>
        <StatCard icon={<Ruler className="w-5 h-5 text-blue-500" />} label="Height" value={`${user.height} cm`} color="bg-blue-50 border-blue-100"/>
        <StatCard icon={<Weight className="w-5 h-5 text-orange-500" />} label="Weight" value={`${user.weight} kg`} color="bg-orange-50 border-orange-100"/>
        <StatCard icon={<Activity className="w-5 h-5 text-pink-500" />} label="Activity" value={user.activityLevel} color="bg-pink-50 border-pink-100"/>
      </div>

      {/* HOUSEHOLD */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-2 rounded-lg"><Users className="w-5 h-5 text-indigo-600" /></div>
            
            {/* RENAME INPUT */}
            {isRenamingHousehold ? (
              <div className="flex items-center gap-2 animate-fade-in">
                <input 
                  type="text" 
                  value={newHouseholdName} 
                  onChange={(e) => setNewHouseholdName(e.target.value)}
                  className="border border-indigo-300 rounded px-3 py-1 text-lg font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[200px]"
                  placeholder="Enter household name..."
                  autoFocus
                />
                <button onClick={handleSaveHouseholdName} className="bg-green-100 p-2 rounded-full text-green-700 hover:bg-green-200 transition-colors" title="Save"><Check className="w-4 h-4" /></button>
                <button onClick={() => setIsRenamingHousehold(false)} className="bg-red-100 p-2 rounded-full text-red-700 hover:bg-red-200 transition-colors" title="Cancel"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 group">
                {user.household ? user.household.name : 'My Household'}
                {user.household && (
                  <button onClick={() => setIsRenamingHousehold(true)} className="text-gray-300 hover:text-indigo-600 transition-colors p-1 rounded-md opacity-0 group-hover:opacity-100">
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}
              </h3>
            )}
          </div>
          
          {user.household ? (
            <div className="flex items-center gap-3 mt-2 md:mt-0 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
               <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Join Code</span>
               <span className="text-indigo-600 text-sm font-mono font-bold tracking-widest">{user.household.joinCode}</span>
            </div>
          ) : (
             <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">No household joined</span>
          )}
        </div>

        {user.members && user.members.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {user.members.map((member) => (
              <div key={member._id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-indigo-50 hover:border-indigo-200 transition-all">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm border-2 border-white shadow-sm">
                  {member.username.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    {member.username} 
                    {member._id === user._id && <span className="text-[10px] bg-indigo-200 text-indigo-800 px-1.5 rounded-full font-bold">YOU</span>}
                  </p>
                  <p className="text-xs text-gray-500 truncate w-full">{member.email}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-center">
            <Users className="w-8 h-8 text-gray-300 mb-2" />
            <p className="text-gray-500 text-sm font-medium">You haven't joined a household yet.</p>
            <p className="text-xs text-gray-400 mt-1">Share your join code to add family members to this dashboard.</p>
          </div>
        )}
      </div>

      {/* DETAILS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4"><Utensils className="w-5 h-5 text-green-600" /> Dietary Preferences</h3>
          <p className="font-medium text-gray-700 mb-3 flex items-center justify-between bg-gray-50 p-3 rounded-lg">
            <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Type</span> 
            <span>{user.dietaryPreferences}</span>
          </p>
          <div>
            <span className="text-gray-500 text-xs font-bold uppercase tracking-wider block mb-2">Allergies</span>
            <div className="flex flex-wrap gap-2">
              {user.allergies && user.allergies.length > 0 ? (
                user.allergies.map((a, i) => (
                  <span key={i} className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold border border-red-100 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {a}</span>
                ))
              ) : <span className="text-gray-400 text-sm italic">No allergies listed</span>}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4"><User className="w-5 h-5 text-blue-600" /> Account Details</h3>
          <div className="space-y-3">
             <div className="flex justify-between py-2 border-b border-gray-50"><span className="text-gray-500 text-sm">Gender</span><span className="font-medium text-gray-700 capitalize text-sm">{user.gender}</span></div>
             <div className="flex justify-between py-2 border-b border-gray-50"><span className="text-gray-500 text-sm">Member Since</span><span className="font-medium text-gray-700 text-sm flex items-center gap-1"><Clock className="w-3 h-3 text-gray-400" />{new Date(user.createdAt).toLocaleDateString()}</span></div>
             <div className="flex justify-between py-2"><span className="text-gray-500 text-sm">Status</span><span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-bold uppercase tracking-wide border border-green-200">Active</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <div className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center transition-transform hover:scale-105 ${color} bg-opacity-50`}>
    <div className="mb-2 p-2 bg-white rounded-full shadow-sm">{icon}</div>
    <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">{label}</div>
    <div className="text-xl font-extrabold text-gray-800 mt-1 capitalize">{value}</div>
  </div>
);

export default UserProfile;