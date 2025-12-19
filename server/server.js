require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");
// 1. Import your SPECIFIC Schema file
// Make sure the path points to where you saved that code
const InventoryItem = require('./models/Inventory'); 

const app = express();

app.use(express.json());
app.use(cors());

// --- INVENTORY ROUTES ---
app.post('/api/generate-recipe', async (req, res) => {
    try {
      const ingredients = req.body.ingredients; // We will send this from frontend
  
      if (!ingredients || ingredients.length === 0) {
        return res.status(400).json({ error: "No ingredients provided" });
      }
  
      // 1. Setup Gemini
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
      // 2. Create the Prompt
      const prompt = `
        I have these ingredients in my pantry: ${ingredients.join(", ")}. 
        Please suggest ONE creative recipe I can make using some of these. 
        Prioritize using ingredients that usually expire fast (like veg/dairy).
        Format the response as JSON with these fields: 
        { "title": "Recipe Name", "time": "30 mins", "difficulty": "Easy", "instructions": "Step 1..." }
        Do not include markdown formatting like \`\`\`json. Just raw JSON.
      `;
  
      // 3. Get Result
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
  
      // 4. Send back to Frontend
      res.json(JSON.parse(text));
  
    } catch (err) {
      console.error("AI Error:", err);
      res.status(500).json({ error: "Failed to generate recipe" });
    }
  });
// POST: Add a new item
app.post('/api/inventory', async (req, res) => {
  try {
    const { name, quantity, unit, expiryDate, category } = req.body;
    
    // ⚠️ CRITICAL FIX: 
    // Your schema requires a 'household' ID. 
    // Since we don't have a real Household system yet, we need a fake ID 
    // or we need to remove "required: true" from your model.
    // 
    // For now, I will generate a temporary ID if one isn't found, 
    // BUT you should go to your models/Inventory.js and set "required: false" for household.
    
    const newItem = new InventoryItem({
      name,
      quantity,
      unit,
      expiryDate,
      category,
      // We are faking these for now so the database doesn't reject it.
      // Ideally, these come from your Auth Middleware (req.user.id)
      household: new mongoose.Types.ObjectId(), 
      addedBy: new mongoose.Types.ObjectId()    
    });

    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (err) {
    console.error("Error saving item:", err);
    res.status(400).json({ error: err.message });
  }
});

// GET: Get all items
app.get('/api/inventory', async (req, res) => {
  try {
    const items = await InventoryItem.find().sort({ expiryDate: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE: Remove an item
app.delete('/api/inventory/:id', async (req, res) => {
  try {
    await InventoryItem.findByIdAndDelete(req.params.id);
    res.json({ message: "Item deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- CONNECTION ---
const PORT = 5001;
// Replace with your actual MongoDB URL
mongoose.connect('mongodb://127.0.0.1:27017/pantry_app') 
  .then(() => {
    console.log('✅ MongoDB Connected');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => console.log(err));