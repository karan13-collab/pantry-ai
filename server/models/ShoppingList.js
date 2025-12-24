const mongoose = require('mongoose');

const ShoppingListSchema = new mongoose.Schema({
  name: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    unit: { type: String },
    image: { type: String },
    checked: { type: Boolean, default: false }
  }]
}, { timestamps: true });

module.exports = mongoose.model('ShoppingList', ShoppingListSchema);