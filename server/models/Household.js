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
    unique: true  
  },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  admin: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  currency: { type: String, default: 'EUR' }
}, { timestamps: true });

module.exports = mongoose.model('Household', HouseholdSchema);