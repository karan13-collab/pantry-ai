const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  age: { type: Number, required: true },
  height: { type: Number, required: true },
  weight: { type: Number, required: true },
  gender: { type: String, required: true },
  
  workoutDays: { type: Number, required: true, default: 0 },
  activityLevel: { type: String, default: 'sedentary' },
  allergies: [{ type: String }],
  
  dietaryPreferences: { type: String, default: 'None' },
 
  household: { type: mongoose.Schema.Types.ObjectId, ref: 'Household' },
  
  role: { type: String, default: 'member' },

  isVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpires: { type: Date },

  loginAttempts: { 
    type: Number, 
    required: true, 
    default: 0 
  },
  lockoutUntil: { 
    type: Date, 
    default: null 
  }

}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);