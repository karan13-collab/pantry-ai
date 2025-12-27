const mongoose = require('mongoose');

const HouseholdSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  joinCode: { 
    type: String, 
    required: true, 
    unique: true // Ensures no duplicate codes
  },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // Keep admin required, our Auth Controller handles the "Chicken-Egg" issue
  admin: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  currency: { type: String, default: 'EUR' }
}, { timestamps: true });

module.exports = mongoose.model('Household', HouseholdSchema);