const mongoose = require('mongoose');
const InventoryItem = require('../models/Inventory');
const User = require('../models/User'); 
const axios = require('axios');

// --- 1. GET INVENTORY (STRICT ROOMMATE MODE) ---
const getInventory = async (req, res) => {
  try {
    // 🔒 SECURITY: User must be authenticated
    if (!req.user || !req.user.id) {
      return res.status(200).json([]); 
    }

    // 🔒 PRIVACY FIX: 
    // Filter by Household AND 'addedBy'.
    // This ensures I only see items *I* personally added.
    const query = { 
      household: req.user.household,
      addedBy: req.user.id 
    };

    // --- AUTO-DELETE LOGIC ---
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const cleanupResult = await InventoryItem.deleteMany({
      ...query,
      expiryDate: { $lt: today }
    });

    if (cleanupResult.deletedCount > 0) {
      console.log(`🧹 Auto-Cleanup: Removed ${cleanupResult.deletedCount} items.`);
    }

    // --- FETCH ITEMS ---
    const items = await InventoryItem.find(query).sort({ expiryDate: 1 });
    res.status(200).json(items);

  } catch (error) { 
    console.error("Fetch Error:", error);
    res.status(500).json({ message: error.message }); 
  }
};

// --- 2. ADD ITEM ---
const addItem = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User not authenticated." });
    }

    const { name, quantity, unit, expiryDate, category } = req.body;

    if (!name || !quantity || !expiryDate) {
      return res.status(400).json({ message: "Required fields missing." });
    }

    const dbUser = await User.findById(req.user.id);
    const householdId = dbUser.household || dbUser._id;

    const newItem = await InventoryItem.create({
      name, 
      quantity, 
      unit: unit || 'pcs', 
      expiryDate, 
      category: category || 'Other',
      household: householdId, 
      addedBy: req.user.id // Stamp with owner ID
    });

    console.log("✅ Item Created:", newItem._id);
    res.status(201).json(newItem);

  } catch (error) { 
    console.error("🔥 Add Item Error:", error);
    res.status(500).json({ message: error.message }); 
  }
};

// --- 3. DELETE ITEM ---
const deleteItem = async (req, res) => {
  try {
    const item = await InventoryItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    // 🔒 OWNERSHIP CHECK:
    if (item.addedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this item." });
    }

    await item.deleteOne();
    res.json({ message: 'Item deleted' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// --- 4. GENERATE RECIPE (AI) ---
const generateRecipe = async (req, res) => {
  try {
    const { strategy } = req.body; 
    
    // 1. SETUP USER PROFILE
    let userProfile = {
      age: 25, weight: 70, height: 175, gender: 'male', 
      activityLevel: 'sedentary', allergies: [], dietaryPreferences: 'None'
    };

    if (req.user && req.user.id) {
      const dbUser = await User.findById(req.user.id);
      if (dbUser) userProfile = { ...userProfile, ...dbUser.toObject() };
    }

    // 2. CALCULATE TARGETS
    const baseCalc = (10 * userProfile.weight) + (6.25 * userProfile.height) - (5 * userProfile.age);
    let bmr = (userProfile.gender === 'male') ? baseCalc + 5 : baseCalc - 161;
    if (userProfile.gender === 'other') bmr = baseCalc - 78;
    const multiplier = { 'sedentary': 1.2, 'light': 1.375, 'moderate': 1.55, 'active': 1.725 }[userProfile.activityLevel] || 1.2;
    const targetCalories = Math.round((bmr * multiplier) * 0.35); 
    const targetProtein = Math.round((userProfile.weight * 1.2) / 3);

    // 3. FETCH YOUR INVENTORY ONLY
    const inventory = await InventoryItem.find({ 
      household: req.user.household,
      addedBy: req.user.id 
    }).sort({ expiryDate: 1 });

    if (inventory.length === 0) return res.status(400).json({ error: "Your pantry is empty!" });
    
    const expiringIngredients = inventory.slice(0, 15).map(item => item.name).join(',+');
    const apiKey = process.env.SPOONACULAR_API_KEY;

    let apiParams = {
      apiKey, 
      includeIngredients: expiringIngredients, 
      number: 5, // 🎲 Get 5 options
      addRecipeNutrition: true, 
      fillIngredients: true, 
      instructionsRequired: true,
      intolerances: userProfile.allergies.join(','),
      diet: (userProfile.dietaryPreferences !== 'None') ? userProfile.dietaryPreferences.toLowerCase() : undefined
    };

    if (strategy === 'health') {
      apiParams.sort = 'max-used-ingredients';
      apiParams.maxCalories = targetCalories; 
      apiParams.minProtein = Math.max(10, targetProtein - 5); 
      apiParams.maxProtein = targetProtein + 15; 
    } else {
      apiParams.sort = 'max-used-ingredients';
      apiParams.maxCalories = targetCalories + 800; 
      apiParams.minProtein = 0; 
      apiParams.diet = undefined; 
    }

    const response = await axios.get(`https://api.spoonacular.com/recipes/complexSearch`, { params: apiParams });

    if (!response.data.results || response.data.results.length === 0) {
      return res.status(404).json({ error: "No recipes found. Try adding more items." });
    }

    // 🎲 RANDOM PICKER
    const results = response.data.results;
    const randomIndex = Math.floor(Math.random() * results.length);
    const recipe = results[randomIndex];

    console.log(`🎲 Selected Recipe: ${recipe.title}`);

    // ... Formatting ...
    const getNutrient = (name) => {
      const n = recipe.nutrition?.nutrients?.find(n => n.name === name);
      return n ? `${Math.round(n.amount)}${n.unit}` : "N/A";
    };

    let finalInstructions = recipe.summary ? recipe.summary.replace(/<[^>]*>?/gm, '') : "No instructions.";
    if (recipe.analyzedInstructions?.length > 0) {
        finalInstructions = recipe.analyzedInstructions[0].steps.map((s, i) => `Step ${i+1}: ${s.step}`).join('\n\n');
    }

    const shoppingList = recipe.missedIngredients.map(item => ({
      name: item.name,
      amount: item.amount,
      unit: item.unitShort,
      image: item.image
    }));

    res.json({
      title: recipe.title,
      image: recipe.image,
      time: `${recipe.readyInMinutes || 30} mins`,
      difficulty: "Easy",
      missedIngredientsCount: recipe.missedIngredientCount,
      usedIngredientCount: recipe.usedIngredientCount,
      nutrition: {
        calories: getNutrient("Calories"),
        protein: getNutrient("Protein"),
        carbs: getNutrient("Carbohydrates"),
        fat: getNutrient("Fat")
      },
      instructions: finalInstructions,
      shoppingList: shoppingList 
    });

  } catch (error) {
    console.error("Algorithm Error:", error.message);
    res.status(500).json({ error: "Failed to generate recipe." });
  }
};

// 👇 EXPORTS (Must include ALL functions)
module.exports = { getInventory, addItem, deleteItem, generateRecipe };