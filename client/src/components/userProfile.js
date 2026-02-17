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
import "./userProfile.css"; 

const UserProfile = () => {
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  const [isRenamingHousehold, setIsRenamingHousehold] = useState(false);
  const [newHouseholdName, setNewHouseholdName] = useState("");

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
      <div className="profile-loading">
        <div className="profile-spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-error">
        <AlertTriangle className="w-5 h-5" /> {error}
      </div>
    );
  }

  return (
    <div className="profile-container">
      
      {toast &&
        createPortal(
          <div className={`profile-toast ${toast.type === 'error' ? 'toast-error' : 'toast-success'}`}>
            <div className={`toast-icon ${toast.type}`}>
              {toast.type === "error" ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
            </div>
            <span style={{fontWeight: 'bold', fontSize: '0.875rem'}}>{toast.msg}</span>
            <button onClick={() => setToast(null)} className="toast-close">
              <X className="w-4 h-4" />
            </button>
          </div>,
          document.body 
        )}

      {isEditing && (
        <div className="profile-modal-overlay">
          <div className="profile-modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Edit Profile</h3>
              <button onClick={() => setIsEditing(false)} className="btn-close-modal">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="profile-form">
              <div className="form-grid-2">
                <div>
                  <label className="input">Weight (kg)</label>
                  <input type="number" name="weight" value={formData.weight} onChange={handleChange} className="profile-input" />
                </div>
                <div>
                  <label className="input">Height (cm)</label>
                  <input type="number" name="height" value={formData.height} onChange={handleChange} className="profile-input" />
                </div>
                <div>
                  <label className="input">Age</label>
                  <input type="number" name="age" value={formData.age} onChange={handleChange} className="profile-input" />
                </div>
                <div>
                  <label className="input">Activity Level</label>
                  <select name="activityLevel" value={formData.activityLevel} onChange={handleChange} className="profile-input">
                    <option value="sedentary">0-1 Days (Sedentary)</option>
                    <option value="light">2-3 Days (Light)</option>
                    <option value="moderate">4-5 Days (Moderate)</option>
                    <option value="active">6-7 Days (Active)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="input">Dietary Preference</label>
                <select name="dietaryPreferences" value={formData.dietaryPreferences} onChange={handleChange} className="profile-input">
                  <option value="None">None</option>
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Vegan">Vegan</option>
                  <option value="Keto">Keto</option>
                  <option value="Paleo">Paleo</option>
                </select>
              </div>

              <div>
                <label className="input">Allergies (comma separated)</label>
                <input type="text" name="allergies" value={formData.allergies} onChange={handleChange} placeholder="Peanuts, Shellfish..." className="profile-input" />
              </div>

              <div style={{paddingTop: '0.5rem'}}>
                <button type="submit" className="profile-btn-primary">
                  <Save className="w-5 h-5" /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="profile-header">
        <div className="header-accent"></div>
        
        <div className="profile-avatar">
          {user.username.charAt(0).toUpperCase()}
        </div>
        
        <div className="profile-info">
          <h2 className="profile-name">{user.username}</h2>
          <div className="profile-email">
            <Mail className="w-4 h-4" /> <span>{user.email}</span>
          </div>
          <div className="profile-badge">
            <ShieldCheck className="w-4 h-4" /> Verified Member
          </div>
        </div>
        
        <button onClick={() => setIsEditing(true)} className="btn-edit-profile">
          <Edit3 className="w-4 h-4" /> Edit Profile
        </button>
      </div>

      <div className="profile-stats-grid">
        <StatCard variant="purple" icon={<Calendar className="w-5 h-5 stat-icon" />} label="Age" value={`${user.age} yrs`} />
        <StatCard variant="blue" icon={<Ruler className="w-5 h-5 stat-icon" />} label="Height" value={`${user.height} cm`} />
        <StatCard variant="orange" icon={<Weight className="w-5 h-5 stat-icon" />} label="Weight" value={`${user.weight} kg`} />
        <StatCard variant="pink" icon={<Activity className="w-5 h-5 stat-icon" />} label="Activity" value={user.activityLevel} />
      </div>

      <div className="profile-card">
        <div className="household-header">
          <div className="household-title-group">
            <div className="household-icon"><Users className="w-5 h-5" /></div>

            {isRenamingHousehold ? (
              <div className="rename-group">
                <input
                  type="text"
                  value={newHouseholdName}
                  onChange={(e) => setNewHouseholdName(e.target.value)}
                  className="rename-input"
                  placeholder="Enter household name..."
                  autoFocus
                />
                <button onClick={handleSaveHouseholdName} className="btn-save-rename"><Check className="w-4 h-4" /></button>
                <button onClick={() => setIsRenamingHousehold(false)} className="btn-cancel-rename"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <h3 className="household-name">
                {user.household ? user.household.name : "My Household"}
                {user.household && (
                  <button onClick={() => setIsRenamingHousehold(true)} className="btn-rename-icon">
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}
              </h3>
            )}
          </div>

          {user.household ? (
            <div className="join-code-box">
              <span className="join-label">Join Code</span>
              <span className="join-value">{user.household.joinCode}</span>
            </div>
          ) : (
            <span className="no-household">No household joined</span>
          )}
        </div>

        {user.members && user.members.length > 0 ? (
          <div className="members-grid">
            {user.members.map((member) => (
              <div key={member._id} className="member-card">
                <div className="member-avatar">
                  {member.username.charAt(0).toUpperCase()}
                </div>
                <div style={{overflow: 'hidden'}}>
                  <p className="member-name">
                    {member.username}
                    {member._id === user._id && <span className="you-tag">YOU</span>}
                  </p>
                  <p className="member-email">{member.email}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-household">
            <Users className="w-8 h-8 text-slate-600 mb-2" />
            <p style={{color: '#94a3b8', fontSize: '0.875rem', fontWeight: 500}}>You haven't joined a household yet.</p>
            <p style={{color: '#475569', fontSize: '0.75rem', marginTop: '0.25rem'}}>Share your join code to add family members.</p>
          </div>
        )}
      </div>

      <div className="details-grid">
        <div className="profile-card">
          <h3 className="card-title">
            <Utensils className="w-5 h-5 text-emerald-400" /> Dietary Preferences
          </h3>
          <div className="pref-row">
            <span className="pref-label">Type</span>
            <span className="pref-value">{user.dietaryPreferences}</span>
          </div>
          <div>
            <span className="pref-label" style={{display: 'block', marginBottom: '0.75rem'}}>Allergies</span>
            <div className="allergy-tags">
              {user.allergies && user.allergies.length > 0 ? (
                user.allergies.map((a, i) => (
                  <span key={i} className="allergy-tag">
                    <AlertTriangle className="w-3 h-3" /> {a}
                  </span>
                ))
              ) : (
                <span style={{color: '#475569', fontSize: '0.875rem', fontStyle: 'italic'}}>No allergies listed</span>
              )}
            </div>
          </div>
        </div>

        <div className="profile-card">
          <h3 className="card-title">
            <User className="w-5 h-5 text-blue-400" /> Account Details
          </h3>
          <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
            <div className="detail-row">
              <span className="detail-label">Gender</span>
              <span className="detail-val">{user.gender}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Member Since</span>
              <span className="detail-val">
                <Clock className="w-3 h-3 text-slate-500" />
                {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="detail-row" style={{border: 'none', paddingTop: '0.5rem'}}>
              <span className="detail-label">Status</span>
              <span className="status-active">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, variant }) => (
  <div className={`stat-card stat-${variant}`}>
    <div className="stat-icon-wrapper">{icon}</div>
    <div className="stat-label">{label}</div>
    <div className="stat-value">{value}</div>
  </div>
);

export default UserProfile;