import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom"; 
import {
  User,
  Mail,
  Activity,
  Ruler,
  Weight,
  Utensils,
  AlertTriangle,
  Calendar,
  Edit3,
  ShieldCheck,
  Users,
  X,
  Save,
  Clock,
  Check,
  CheckCircle,
  XCircle,
} from "lucide-react";
import api from "../services/api";

const UserProfile = () => {
  // --- 1. LOCAL NOTIFICATION STATE ---
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // --- 2. DATA STATE ---
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  const [isRenamingHousehold, setIsRenamingHousehold] = useState(false);
  const [newHouseholdName, setNewHouseholdName] = useState("");

  // --- 3. FETCH DATA ---
  const fetchProfile = async () => {
    try {
      const res = await api.get("/user/profile");
      setUser(res.data);
      setFormData({
        weight: res.data.weight,
        height: res.data.height,
        age: res.data.age,
        activityLevel: res.data.activityLevel,
        dietaryPreferences: res.data.dietaryPreferences,
        allergies: res.data.allergies.join(", "),
      });

      if (res.data.household) {
        setNewHouseholdName(res.data.household.name);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Could not load profile data.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

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
        allergies: safeAllergies
          .split(",")
          .map((a) => a.trim())
          .filter((a) => a),
      };

      await api.put("/user/profile", updatedData);
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

      const res = await api.put("/household/rename", {
        name: newHouseholdName,
      });

      setUser({
        ...user,
        household: { ...user.household, name: res.data.name },
      });

      setIsRenamingHousehold(false);
      showToast("Household renamed!", "success");
    } catch (err) {
      let errorMsg = "Failed to rename household";
      if (err.response && err.response.data && err.response.data.msg) {
        errorMsg = err.response.data.msg;
      }
      showToast(errorMsg, "error");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-red-400 border border-red-500/20 bg-red-900/20 rounded-xl m-4 flex items-center gap-2 backdrop-blur-sm">
        <AlertTriangle className="w-5 h-5" /> {error}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-5xl mx-auto text-slate-200">
      
      {/* 🔴 PORTAL NOTIFICATION (Dark Theme) */}
      {toast &&
        createPortal(
          <div
            className={`fixed top-10 left-1/2 transform -translate-x-1/2 z-[99999] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border backdrop-blur-xl transition-all animate-bounce-in ${
              toast.type === "error"
                ? "bg-black/80 border-red-500/30 text-red-400"
                : "bg-black/80 border-emerald-500/30 text-emerald-400"
            }`}
          >
            <div
              className={`p-2 rounded-full ${
                toast.type === "error" ? "bg-red-500/10" : "bg-emerald-500/10"
              }`}
            >
              {toast.type === "error" ? (
                <XCircle className="w-5 h-5" />
              ) : (
                <CheckCircle className="w-5 h-5" />
              )}
            </div>
            <span className="font-bold text-sm whitespace-nowrap">
              {toast.msg}
            </span>
            <button
              onClick={() => setToast(null)}
              className="ml-4 hover:opacity-70 text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>,
          document.body 
        )}

      {/* EDIT MODAL (Dark Theme) */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/20">
              <h3 className="font-bold text-white text-lg">Edit Profile</h3>
              <button
                onClick={() => setIsEditing(false)}
                className="text-slate-500 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    className="w-full p-3 bg-black/40 border border-slate-700 rounded-xl text-white focus:border-emerald-500 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    className="w-full p-3 bg-black/40 border border-slate-700 rounded-xl text-white focus:border-emerald-500 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full p-3 bg-black/40 border border-slate-700 rounded-xl text-white focus:border-emerald-500 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">
                    Activity Level
                  </label>
                  <select
                    name="activityLevel"
                    value={formData.activityLevel}
                    onChange={handleChange}
                    className="w-full p-3 bg-black/40 border border-slate-700 rounded-xl text-white focus:border-emerald-500 focus:outline-none transition-all"
                  >
                    <option value="sedentary">0-1 Days (Sedentary)</option>
                    <option value="light">2-3 Days (Light)</option>
                    <option value="moderate">4-5 Days (Moderate)</option>
                    <option value="active">6-7 Days (Active)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">
                  Dietary Preference
                </label>
                <select
                  name="dietaryPreferences"
                  value={formData.dietaryPreferences}
                  onChange={handleChange}
                  className="w-full p-3 bg-black/40 border border-slate-700 rounded-xl text-white focus:border-emerald-500 focus:outline-none transition-all"
                >
                  <option value="None">None</option>
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Vegan">Vegan</option>
                  <option value="Keto">Keto</option>
                  <option value="Paleo">Paleo</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">
                  Allergies (comma separated)
                </label>
                <input
                  type="text"
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleChange}
                  placeholder="Peanuts, Shellfish..."
                  className="w-full p-3 bg-black/40 border border-slate-700 rounded-xl text-white focus:border-emerald-500 focus:outline-none transition-all"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-500 flex justify-center gap-2 shadow-lg shadow-emerald-900/20 transition-all transform hover:scale-[1.02]"
                >
                  <Save className="w-5 h-5" /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROFILE HEADER (Glassmorphism) */}
      <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl shadow-xl border border-white/10 p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
        {/* Decorative Gradient Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-emerald-500"></div>
        
        <div className="w-24 h-24 bg-gradient-to-br from-slate-800 to-slate-900 rounded-full flex items-center justify-center text-4xl font-bold text-white border-4 border-slate-700 shadow-xl">
          {user.username.charAt(0).toUpperCase()}
        </div>
        
        <div className="text-center md:text-left flex-1">
          <h2 className="text-3xl font-black text-white tracking-tight">
            {user.username}
          </h2>
          <div className="flex items-center justify-center md:justify-start gap-2 text-slate-400 mt-1 font-medium">
            <Mail className="w-4 h-4" /> <span>{user.email}</span>
          </div>
          <div className="flex items-center justify-center md:justify-start gap-2 text-emerald-400 text-sm font-bold mt-3 bg-emerald-500/10 w-fit mx-auto md:mx-0 px-3 py-1 rounded-full border border-emerald-500/20">
            <ShieldCheck className="w-4 h-4" /> Verified Member
          </div>
        </div>
        
        <button
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-2 px-5 py-2.5 border border-white/10 bg-white/5 text-slate-300 rounded-xl hover:bg-white/10 hover:text-white transition-colors text-sm font-bold shadow-lg"
        >
          <Edit3 className="w-4 h-4" /> Edit Profile
        </button>
      </div>

      {/* STATS (Dark Translucent) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Calendar className="w-5 h-5 text-purple-400" />}
          label="Age"
          value={`${user.age} yrs`}
          color="bg-purple-500/10 border-purple-500/20"
        />
        <StatCard
          icon={<Ruler className="w-5 h-5 text-blue-400" />}
          label="Height"
          value={`${user.height} cm`}
          color="bg-blue-500/10 border-blue-500/20"
        />
        <StatCard
          icon={<Weight className="w-5 h-5 text-orange-400" />}
          label="Weight"
          value={`${user.weight} kg`}
          color="bg-orange-500/10 border-orange-500/20"
        />
        <StatCard
          icon={<Activity className="w-5 h-5 text-pink-400" />}
          label="Activity"
          value={user.activityLevel}
          color="bg-pink-500/10 border-pink-500/20"
        />
      </div>

      {/* HOUSEHOLD (Glassmorphism) */}
      <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/10">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500/20 p-2 rounded-lg border border-indigo-500/20">
              <Users className="w-5 h-5 text-indigo-400" />
            </div>

            {/* RENAME INPUT */}
            {isRenamingHousehold ? (
              <div className="flex items-center gap-2 animate-fade-in">
                <input
                  type="text"
                  value={newHouseholdName}
                  onChange={(e) => setNewHouseholdName(e.target.value)}
                  className="bg-black/40 border border-indigo-500/50 rounded-lg px-3 py-1 text-lg font-bold text-white focus:outline-none min-w-[200px]"
                  placeholder="Enter household name..."
                  autoFocus
                />
                <button
                  onClick={handleSaveHouseholdName}
                  className="bg-emerald-500/20 p-2 rounded-lg text-emerald-400 hover:bg-emerald-500/30 transition-colors border border-emerald-500/20"
                  title="Save"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsRenamingHousehold(false)}
                  className="bg-red-500/20 p-2 rounded-lg text-red-400 hover:bg-red-500/30 transition-colors border border-red-500/20"
                  title="Cancel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <h3 className="text-xl font-bold text-white flex items-center gap-2 group">
                {user.household ? user.household.name : "My Household"}
                {user.household && (
                  <button
                    onClick={() => setIsRenamingHousehold(true)}
                    className="text-slate-600 hover:text-indigo-400 transition-colors p-1 rounded-md opacity-0 group-hover:opacity-100"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}
              </h3>
            )}
          </div>

          {user.household ? (
            <div className="flex items-center gap-3 mt-4 md:mt-0 bg-black/20 px-4 py-2 rounded-xl border border-white/5">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                Join Code
              </span>
              <span className="text-indigo-400 text-sm font-mono font-bold tracking-widest">
                {user.household.joinCode}
              </span>
            </div>
          ) : (
            <span className="text-xs text-slate-500 bg-white/5 px-3 py-1 rounded-full border border-white/5">
              No household joined
            </span>
          )}
        </div>

        {user.members && user.members.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {user.members.map((member) => (
              <div
                key={member._id}
                className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-black/20 hover:bg-white/5 transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-sm border border-slate-700 shadow-sm group-hover:border-indigo-500/50 group-hover:text-white transition-colors">
                  {member.username.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-slate-200 flex items-center gap-2 group-hover:text-white">
                    {member.username}
                    {member._id === user._id && (
                      <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 rounded-full font-bold border border-indigo-500/20">
                        YOU
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-slate-500 truncate w-full group-hover:text-slate-400">
                    {member.email}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 bg-black/20 rounded-xl border border-dashed border-slate-700 text-center">
            <Users className="w-8 h-8 text-slate-600 mb-2" />
            <p className="text-slate-400 text-sm font-medium">
              You haven't joined a household yet.
            </p>
            <p className="text-xs text-slate-600 mt-1">
              Share your join code to add family members to this dashboard.
            </p>
          </div>
        )}
      </div>

      {/* DETAILS (Glassmorphism) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/10">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
            <Utensils className="w-5 h-5 text-emerald-400" /> Dietary Preferences
          </h3>
          <p className="font-medium text-slate-200 mb-4 flex items-center justify-between bg-black/20 p-3 rounded-xl border border-white/5">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">
              Type
            </span>
            <span>{user.dietaryPreferences}</span>
          </p>
          <div>
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-3 ml-1">
              Allergies
            </span>
            <div className="flex flex-wrap gap-2">
              {user.allergies && user.allergies.length > 0 ? (
                user.allergies.map((a, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 bg-red-500/10 text-red-400 rounded-full text-xs font-bold border border-red-500/20 flex items-center gap-1"
                  >
                    <AlertTriangle className="w-3 h-3" /> {a}
                  </span>
                ))
              ) : (
                <span className="text-slate-600 text-sm italic px-1">
                  No allergies listed
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/10">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-blue-400" /> Account Details
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between py-3 border-b border-white/5">
              <span className="text-slate-500 text-sm font-medium">Gender</span>
              <span className="font-bold text-slate-200 capitalize text-sm">
                {user.gender}
              </span>
            </div>
            <div className="flex justify-between py-3 border-b border-white/5">
              <span className="text-slate-500 text-sm font-medium">Member Since</span>
              <span className="font-bold text-slate-200 text-sm flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-600" />
                {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between py-2 mt-2">
              <span className="text-slate-500 text-sm font-medium">Status</span>
              <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded font-bold uppercase tracking-wide border border-emerald-500/20">
                Active
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Updated StatCard for Dark Mode
const StatCard = ({ icon, label, value, color }) => (
  <div
    className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center transition-transform hover:scale-105 ${color} bg-opacity-50`}
  >
    <div className="mb-2 p-2 bg-slate-900 rounded-full shadow-sm border border-white/5">{icon}</div>
    <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">
      {label}
    </div>
    <div className="text-xl font-black text-white mt-1 capitalize">
      {value}
    </div>
  </div>
);

export default UserProfile;