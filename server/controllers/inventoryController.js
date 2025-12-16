const InventoryItem = require('../models/Inventory');

// @desc    Get all items for the user's household
// @route   GET /api/inventory
const getInventory = async (req, res) => {
  try {
    // We will get req.user from the Auth Middleware later
    // For now, we assume the user is logged in
    const items = await InventoryItem.find({ household: req.user.household })
      .sort({ expiryDate: 1 }); // Sort by expiring soonest
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a new item
// @route   POST /api/inventory
const addItem = async (req, res) => {
  try {
    const { name, quantity, unit, expiryDate, category } = req.body;

    const newItem = await InventoryItem.create({
      name,
      quantity,
      unit,
      expiryDate,
      category,
      household: req.user.household, // Link to shared household
      addedBy: req.user.id
    });

    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getInventory, addItem };