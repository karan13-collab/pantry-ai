import React, { useState, useEffect } from 'react';
// Added 'Users' icon 👇
import { 
  User, Mail, Activity, Ruler, Weight, Utensils, 
  AlertTriangle, Calendar, Edit3, ShieldCheck, Users 
} from 'lucide-react';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5002/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) throw new Error('Failed to fetch profile');
        const data = await response.json();
        setUser(data);
      } catch (err) {
        setError('Could not load profile data.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl flex items-center gap-2">
      <AlertTriangle className="w-5 h-5" /> {error}
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* 1. Header Card (Avatar & Basic Info) */}
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
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 hover:text-green-600 transition-colors text-sm font-semibold">
          <Edit3 className="w-4 h-4" /> Edit Profile
        </button>
      </div>

      {/* 2. Vital Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<Calendar className="w-5 h-5 text-purple-500" />} label="Age" value={`${user.age} yrs`} color="bg-purple-50 border-purple-100"/>
        <StatCard icon={<Ruler className="w-5 h-5 text-blue-500" />} label="Height" value={`${user.height} cm`} color="bg-blue-50 border-blue-100"/>
        <StatCard icon={<Weight className="w-5 h-5 text-orange-500" />} label="Weight" value={`${user.weight} kg`} color="bg-orange-50 border-orange-100"/>
        <StatCard icon={<Activity className="w-5 h-5 text-pink-500" />} label="Activity" value={user.activityLevel} subtext="Daily Burn" color="bg-pink-50 border-pink-100"/>
      </div>

      {/* 3. Detailed Info Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Household Members Section (NEW) 👇 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 md:col-span-2">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-indigo-600" /> My Household
          </h3>
          
          {user.members && user.members.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {user.members.map((member) => (
                <div key={member._id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:shadow-md transition-all bg-gray-50">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                    {member.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">
                      {member.username} 
                      {member._id === user._id && <span className="text-xs text-gray-400 font-normal ml-1">(You)</span>}
                    </p>
                    <p className="text-xs text-gray-500 truncate w-32">{member.email}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-6 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-500">You haven't joined a household yet.</p>
              <p className="text-xs text-gray-400 mt-1">Share your Join Code to add members!</p>
            </div>
          )}
        </div>

        {/* Dietary Preferences */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
            <Utensils className="w-5 h-5 text-green-600" /> Dietary Preferences
          </h3>
          <div className="space-y-4">
            <div>
              <span className="text-sm text-gray-400 font-bold uppercase tracking-wider">Diet Type</span>
              <p className="text-lg font-medium text-gray-700 mt-1">
                {user.dietaryPreferences === "None" ? "Standard Diet" : user.dietaryPreferences}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-400 font-bold uppercase tracking-wider">Allergies</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {user.allergies.length > 0 ? (
                  user.allergies.map((allergy, index) => (
                    <span key={index} className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-sm font-medium border border-red-100 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> {allergy}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 italic">No known allergies</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-blue-600" /> Account Details
          </h3>
          <div className="space-y-3">
             <div className="flex justify-between py-2 border-b border-gray-50">
               <span className="text-gray-500">Gender</span>
               <span className="font-medium text-gray-700 capitalize">{user.gender}</span>
             </div>
             <div className="flex justify-between py-2 border-b border-gray-50">
               <span className="text-gray-500">Member Since</span>
               <span className="font-medium text-gray-700">
                 {new Date(user.createdAt).toLocaleDateString()}
               </span>
             </div>
             <div className="flex justify-between py-2">
               <span className="text-gray-500">Household ID</span>
               <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                 {user.household || "No Household"}
               </span>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color, subtext }) => (
  <div className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center transition-transform hover:scale-105 ${color}`}>
    <div className="mb-2 p-2 bg-white rounded-full shadow-sm">{icon}</div>
    <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">{label}</div>
    <div className="text-xl font-extrabold text-gray-800 mt-1 capitalize">{value}</div>
    {subtext && <div className="text-[10px] text-gray-500">{subtext}</div>}
  </div>
);

export default UserProfile;