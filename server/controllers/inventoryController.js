const mongoose = require('mongoose');
const InventoryItem = require('../models/Inventory');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const getInventory = async (req, res) => {
  try {
    let query = {};

   
    if (req.user && req.user.household) {
      query.household = req.user.household;
    } 

    const items = await InventoryItem.find(query).sort({ expiryDate: 1 });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addItem = async (req, res) => {
  try {
    const { name, quantity, unit, expiryDate, category } = req.body;

    const householdId = req.user ? req.user.household : new mongoose.Types.ObjectId();
    const userId = req.user ? req.user.id : new mongoose.Types.ObjectId();

    const newItem = await InventoryItem.create({
      name,
      quantity,
      unit,       
      expiryDate,
      category,   
      household: householdId,
      addedBy: userId
    });

    res.status(201).json(newItem);
  } catch (error) {
    console.error("Error adding item:", error);
    res.status(500).json({ message: error.message });
  }
};

const deleteItem = async (req, res) => {
  try {
    const item = await InventoryItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (req.user && item.household.toString() !== req.user.household.toString()) {
       return res.status(401).json({ message: 'Not authorized' });
   }

    await item.deleteOne();
    res.json({ message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const generateRecipe = async (req, res) => {
  try {
    const { ingredients } = req.body;

    if (!ingredients || ingredients.length === 0) {
      return res.status(400).json({ error: "No ingredients provided" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "Server missing Gemini API Key" });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      I have these ingredients: ${ingredients.join(", ")}. 
      Suggest ONE recipe. Format as raw JSON: 
      { "title": "...", "time": "...", "difficulty": "...", "instructions": "..." }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonStr = text.replace(/```json|```/g, '').trim();
    
    res.json(JSON.parse(jsonStr));

  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ error: "Failed to generate recipe" });
  }
};

module.exports = {
  getInventory,
  addItem,
  deleteItem,
  generateRecipe
};