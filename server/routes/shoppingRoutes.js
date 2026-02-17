const express = require('express');
const router = express.Router();
const ShoppingList = require('../models/ShoppingList');
const auth = require('../middleware/authMiddleware'); 

router.get('/', auth, async (req, res) => {
  try {
    const lists = await ShoppingList.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(lists);
  } catch (err) {
    console.error(" Error fetching lists:", err.message);
    res.status(500).json({ error: "Server Error: Could not fetch lists" });
  }
});


router.post('/', auth, async (req, res) => {
  try {
    console.log(" Creating list:", req.body.name);
    
    if (!req.user || !req.user.id) {
      throw new Error("User not authenticated in request");
    }

    const newList = await ShoppingList.create({
      name: req.body.name,
      user: req.user.id,
      items: []
    });
    
    console.log("✅ List created:", newList._id);
    res.status(201).json(newList);
  } catch (err) {
    console.error(" Error creating list:", err.message);
    res.status(500).json({ error: err.message });
  }
});


router.post('/:id/items', auth, async (req, res) => {
  try {
    console.log(`➕ Adding item to list ${req.params.id}:`, req.body.name);
    
    const list = await ShoppingList.findById(req.params.id);
    if (!list) {
      console.error(" List ID not found in DB");
      return res.status(404).json({ error: "List not found" });
    }

    if (!req.body.name || req.body.amount === undefined) {
       console.error(" Invalid Item Data:", req.body);
       return res.status(400).json({ error: "Item needs a name and amount" });
    }

    const existingIndex = list.items.findIndex(i => i.name === req.body.name);
    if (existingIndex > -1) {
      list.items[existingIndex].amount += req.body.amount;
    } else {
      
      list.items.push({
        name: req.body.name,
        amount: Number(req.body.amount), 
        unit: req.body.unit || 'units',
        image: req.body.image || '',
        checked: false
      });
    }
    
    await list.save();
    console.log("✅ Item saved successfully");
    res.json(list);

  } catch (err) {
    console.error(" DB Save Error:", err.message);
    res.status(500).json({ error: "Failed to save item to database." });
  }
});


router.delete('/:id/items/:itemId', auth, async (req, res) => {
  try {
    const list = await ShoppingList.findById(req.params.id);
    if (!list) return res.status(404).json({ error: "List not found" });

    list.items = list.items.filter(item => item._id.toString() !== req.params.itemId);
    
    await list.save();
    res.json(list);
  } catch (err) {
    console.error(" Delete Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;