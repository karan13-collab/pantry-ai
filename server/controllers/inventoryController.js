const mongoose = require('mongoose');
const InventoryItem = require('../models/Inventory');
const User = require('../models/User'); 
const axios = require('axios');

// --- 1. GET INVENTORY (With Auto-Cleanup) ---
const getInventory = async (req, res) => {
  try {
    let query = {};
    if (req.user && req.user.household) query.household = req.user.household;

    // --- AUTO-DELETE LOGIC ---
    // Create a date object for "Start of Today" (00:00:00)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Delete anything that expired BEFORE today (strictly less than today)
    // This ensures items expiring TODAY are still kept.
    const cleanupResult = await InventoryItem.deleteMany({
      ...query,
      expiryDate: { $lt: today }
    });

    if (cleanupResult.deletedCount > 0) {
      console.log(`🧹 Auto-Cleanup: Removed ${cleanupResult.deletedCount} expired items.`);
    }


    const items = await InventoryItem.find(query).sort({ expiryDate: 1 });
    res.status(200).json(items);

  } catch (error) { 
    console.error("Fetch Error:", error);
    res.status(500).json({ message: error.message }); 
  }
};

const addItem = async (req, res) => {
  try {
    console.log("📥 Add Item Request:", req.body);

 
    if (!req.user || !req.user.id) {
      console.error("❌ Error: User authentication missing.");
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
      addedBy: req.user.id
    });

    console.log("✅ Item Created:", newItem._id);
    res.status(201).json(newItem);

  } catch (error) { 
    console.error("🔥 Add Item Error:", error);
    res.status(500).json({ message: error.message }); 
  }
};

const deleteItem = async (req, res) => {
  try {
    const item = await InventoryItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    await item.deleteOne();
    res.json({ message: 'Item deleted' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// --- RECIPE GENERATOR (Matches your latest robust version) ---
const generateRecipe = async (req, res) => {
  try {
    const { strategy } = req.body; 
    
    let userProfile = {
      age: 25, weight: 70, height: 175, gender: 'male', 
      activityLevel: 'sedentary', allergies: [], dietaryPreferences: 'None'
    };
    if (req.user && req.user.id) {
      const dbUser = await User.findById(req.user.id);
      if (dbUser) userProfile = { ...userProfile, ...dbUser.toObject() };
    }

    const baseCalc = (10 * userProfile.weight) + (6.25 * userProfile.height) - (5 * userProfile.age);
    let bmr = (userProfile.gender === 'male') ? baseCalc + 5 : baseCalc - 161;
    if (userProfile.gender === 'other') bmr = baseCalc - 78;
    const multiplier = { 'sedentary': 1.2, 'light': 1.375, 'moderate': 1.55, 'active': 1.725 }[userProfile.activityLevel] || 1.2;
    const targetCalories = Math.round((bmr * multiplier) * 0.35);

    const inventory = await InventoryItem.find().sort({ expiryDate: 1 });
    if (inventory.length === 0) return res.status(400).json({ error: "Pantry is empty!" });
    const expiringIngredients = inventory.slice(0, 10).map(item => item.name).join(',+');
    const apiKey = process.env.SPOONACULAR_API_KEY;

    let apiParams = {
      apiKey, includeIngredients: expiringIngredients, number: 1,
      addRecipeNutrition: true, fillIngredients: true, instructionsRequired: true,
      intolerances: userProfile.allergies.join(','),
      diet: (userProfile.dietaryPreferences !== 'None') ? userProfile.dietaryPreferences.toLowerCase() : undefined
    };

    console.log(`👨‍🍳 Strategy: ${strategy?.toUpperCase() || 'WASTE'}`);

    if (strategy === 'health') {
      apiParams.sort = 'max-used-ingredients';
      apiParams.maxCalories = targetCalories; 
      apiParams.minProtein = 20; 
    } else {
      apiParams.sort = 'max-used-ingredients';
      apiParams.maxCalories = targetCalories + 600;
      apiParams.minProtein = 0; 
      apiParams.diet = undefined; 
    }

    const response = await axios.get(`https://api.spoonacular.com/recipes/complexSearch`, { params: apiParams });

    if (!response.data.results || response.data.results.length === 0) {
      return res.status(404).json({ error: "No recipes found. Try a different strategy." });
    }

    const recipe = response.data.results[0];

    const getNutrient = (name) => {
      const n = recipe.nutrition?.nutrients?.find(n => n.name === name);
      return n ? `${Math.round(n.amount)}${n.unit}` : "N/A";
    };

    let finalInstructions = "No detailed instructions provided.";
    if (recipe.analyzedInstructions?.length > 0) {
        finalInstructions = recipe.analyzedInstructions[0].steps.map((s, i) => `Step ${i+1}: ${s.step}`).join('\n\n');
    } else if (recipe.summary) {
        finalInstructions = recipe.summary.replace(/<[^>]*>?/gm, '');
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

module.exports = { getInventory, addItem, deleteItem, generateRecipe };