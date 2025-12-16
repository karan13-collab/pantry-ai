const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 1
  },
  unit: {
    type: String,
    enum: ['kg', 'g', 'L', 'ml', 'pcs', 'pack'], // Restrict to specific units
    default: 'pcs'
  },
  expiryDate: {
    type: Date,
    required: true
  },
  category: {
    type: String,
    enum: ['Vegetable', 'Fruit', 'Dairy', 'Grain', 'Meat', 'Other'],
    default: 'Other'
  },
  // The "Shared Resource" link
  household: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Household',
    required: true
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

module.exports = mongoose.model('InventoryItem', InventorySchema);