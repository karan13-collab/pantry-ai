const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
 
  age: {
    type: Number,
    required: true
  },
  height: {
    type: Number, 
    required: true
  },
  weight: {
    type: Number, 
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  activityLevel: {
    type: String,
    enum: ['sedentary', 'light', 'moderate', 'active'],
    default: 'sedentary'
  },

  allergies: [{
    type: String,
    default: []
  }],
  dietaryPreferences: {
    type: String,
    default: "None"
  },
 
  household: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Household',
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);