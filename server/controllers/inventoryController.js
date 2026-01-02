const mongoose = require('mongoose');
const InventoryItem = require('../models/Inventory');
const User = require('../models/User'); 
const axios = require('axios');

// --- 1. GET INVENTORY ---
const getInventory = async (req, res) => {
  try {
    if (!req.user || !req.user.id) return res.status(200).json([]); 

    const query = { household: req.user.household, addedBy: req.user.id };
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Auto-Cleanup Expired Items
    await InventoryItem.deleteMany({ ...query, expiryDate: { $lt: today } });

    const items = await InventoryItem.find(query).sort({ expiryDate: 1 });
    res.status(200).json(items);
  } catch (error) { 
    res.status(500).json({ message: error.message }); 
  }
};

// --- 2. ADD ITEM ---
const addItem = async (req, res) => {
  try {
    if (!req.user || !req.user.id) return res.status(401).json({ message: "User not authenticated." });
    const { name, quantity, unit, expiryDate, category } = req.body;
    if (!name || !quantity || !expiryDate) return res.status(400).json({ message: "Required fields missing." });

    const dbUser = await User.findById(req.user.id);
    const householdId = dbUser.household || dbUser._id;

    const newItem = await InventoryItem.create({
      name, quantity, unit: unit || 'pcs', expiryDate, category: category || 'Other',
      household: householdId, addedBy: req.user.id
    });
    res.status(201).json(newItem);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// --- 3. DELETE ITEM ---
const deleteItem = async (req, res) => {
  try {
    const item = await InventoryItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.addedBy.toString() !== req.user.id) return res.status(403).json({ message: "Not authorized." });

    await item.deleteOne();
    res.json({ message: 'Item deleted' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// --- 4. GENERATE RECIPE (SMART MATCHING VERSION) ---
const generateRecipe = async (req, res) => {
  try {
    const { strategy } = req.body; 
    
    // A. Setup User Profile
    let userProfile = { age: 25, weight: 70, height: 175, gender: 'male', activityLevel: 'sedentary', allergies: [], dietaryPreferences: 'None' };
    if (req.user && req.user.id) {
      const dbUser = await User.findById(req.user.id);
      if (dbUser) userProfile = { ...userProfile, ...dbUser.toObject() };
    }

    // B. Calculate Calorie Targets
    const baseCalc = (10 * userProfile.weight) + (6.25 * userProfile.height) - (5 * userProfile.age);
    let bmr = (userProfile.gender === 'male') ? baseCalc + 5 : baseCalc - 161;
    if (userProfile.gender === 'other') bmr = baseCalc - 78;

    const activityMultipliers = { 'sedentary': 1.2, 'light': 1.375, 'moderate': 1.55, 'active': 1.725 };
    const proteinMultipliers = { 'sedentary': 0.8, 'light': 1.0, 'moderate': 1.2, 'active': 1.6 };
    
    const dailyCalories = Math.round(bmr * (activityMultipliers[userProfile.activityLevel] || 1.2));
    const dailyProtein = Math.round(userProfile.weight * (proteinMultipliers[userProfile.activityLevel] || 0.8));

    const targetCalories = Math.round(dailyCalories * 0.35); 
    const targetProtein = Math.round(dailyProtein * 0.35);

    // C. Fetch Inventory
    const inventory = await InventoryItem.find({ 
      household: req.user.household, 
      addedBy: req.user.id 
    }).sort({ expiryDate: 1 });

    if (inventory.length === 0) return res.status(400).json({ error: "Your pantry is empty!" });
    
    const expiringIngredients = inventory.slice(0, 15).map(item => item.name).join(',+');

    // D. Call API
    let apiParams = {
      apiKey: process.env.SPOONACULAR_API_KEY, 
      includeIngredients: expiringIngredients, 
      number: 5, 
      addRecipeNutrition: true, 
      fillIngredients: true, 
      instructionsRequired: true,
      ignorePantry: false, // Tell API to respect our pantry
      intolerances: userProfile.allergies ? userProfile.allergies.join(',') : undefined,
      diet: (userProfile.dietaryPreferences !== 'None') ? userProfile.dietaryPreferences.toLowerCase() : undefined
    };

    if (strategy === 'health') {
      apiParams.sort = 'max-used-ingredients';
      apiParams.maxCalories = targetCalories; 
      apiParams.minProtein = Math.max(10, targetProtein - 5); 
      apiParams.maxProtein = targetProtein + 20; 
    } else {
      apiParams.sort = 'max-used-ingredients';
      apiParams.maxCalories = targetCalories + 800; 
      apiParams.minProtein = 0; 
    }

    const response = await axios.get(`https://api.spoonacular.com/recipes/complexSearch`, { params: apiParams });
    if (!response.data.results || response.data.results.length === 0) return res.status(404).json({ error: "No recipes found." });

    const results = response.data.results;
    const randomIndex = Math.floor(Math.random() * results.length);
    const recipe = results[randomIndex];

    console.log(`Selected Recipe: ${recipe.title}`);

    // --- 5. SMART INGREDIENT MATCHING (THE FIX) ---
    // The API is strict (pcs vs lb). We will manually fix "Missed" items
    // if you actually have them in your inventory.
    
    let usedIngredients = recipe.usedIngredients || [];
    let missedIngredients = recipe.missedIngredients || [];
    let finalMissedList = [];

    // Loop through missing items and check if we actually have them
    missedIngredients.forEach(missed => {
        // Does the user have this item? (Fuzzy Check)
        const foundInPantry = inventory.find(pantryItem => 
            pantryItem.name.toLowerCase().includes(missed.name.toLowerCase()) || 
            missed.name.toLowerCase().includes(pantryItem.name.toLowerCase())
        );

        if (foundInPantry) {
            // ✅ FOUND IT! Move from "Missing" to "Used"
            console.log(`🔧 Fixed: Moved '${missed.name}' to Used list (Matched pantry: '${foundInPantry.name}')`);
            
            // Add user's quantity info to the item so frontend can show "You have 1 pcs"
            missed.originalName = `${missed.name} (You have: ${foundInPantry.quantity} ${foundInPantry.unit})`;
            usedIngredients.push(missed);
        } else {
            // ❌ REALLY MISSING. Keep in "To Buy"
            finalMissedList.push(missed);
        }
    });

    // --- 6. Formatting Response ---
    const getNutrient = (name) => {
      const n = recipe.nutrition?.nutrients?.find(n => n.name === name);
      return n ? `${Math.round(n.amount)}${n.unit}` : "N/A";
    };

    let finalInstructions = recipe.summary ? recipe.summary.replace(/<[^>]*>?/gm, '') : "No instructions.";
    if (recipe.analyzedInstructions?.length > 0) {
        finalInstructions = recipe.analyzedInstructions[0].steps.map((s, i) => `Step ${i+1}: ${s.step}`).join('\n\n');
    }

    res.json({
      title: recipe.title,
      image: recipe.image,
      time: `${recipe.readyInMinutes || 30} mins`,
      difficulty: "Easy",
      missedIngredientsCount: finalMissedList.length, // Update counts
      usedIngredientCount: usedIngredients.length,
      nutrition: {
        calories: getNutrient("Calories"),
        protein: getNutrient("Protein"),
        carbs: getNutrient("Carbohydrates"),
        fat: getNutrient("Fat")
      },
      instructions: finalInstructions,
      usedIngredients: usedIngredients.map(item => ({
          name: item.name,
          amount: item.amount,
          unit: item.unitShort,
          image: item.image,
          original: item.originalName // Extra info if available
      })),
      shoppingList: finalMissedList.map(item => ({
          name: item.name,
          amount: item.amount,
          unit: item.unitShort,
          image: item.image
      }))
    });

  } catch (error) {
    console.error("Algorithm Error:", error.message);
    res.status(500).json({ error: "Failed to generate recipe." });
  }
};

module.exports = { getInventory, addItem, deleteItem, generateRecipe };