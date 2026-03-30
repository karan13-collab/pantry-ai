const mongoose = require('mongoose');
const InventoryItem = require('../models/Inventory');
const User = require('../models/User'); 
const axios = require('axios');

const getInventory = async (req, res) => {
  try {
    if (!req.user || !req.user.id) return res.status(200).json([]); 

    const query = { household: req.user.household, addedBy: req.user.id };
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await InventoryItem.deleteMany({ ...query, expiryDate: { $lt: today } });

    const items = await InventoryItem.find(query).sort({ expiryDate: 1 });
    res.status(200).json(items);
  } catch (error) { 
    res.status(500).json({ message: error.message }); 
  }
};

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

const deleteItem = async (req, res) => {
  try {
    const item = await InventoryItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.addedBy.toString() !== req.user.id) return res.status(403).json({ message: "Not authorized." });

    await item.deleteOne();
    res.json({ message: 'Item deleted' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const generateRecipe = async (req, res) => {
  try {
    const { strategy } = req.body; 
    const userId = req.user.id;

    const inventory = await InventoryItem.find({ 
      household: req.user.household, 
      addedBy: userId 
    }).sort({ expiryDate: 1 });

    if (inventory.length === 0) return res.status(400).json({ error: "Your pantry is empty!" });
    
    const allIngredients = inventory.map(item => item.name).join(',');

    let recipeId = null;
    let usedIngredients = [];
    let missedIngredients = [];

    if (strategy === 'waste') {
      const response = await axios.get(`https://api.spoonacular.com/recipes/findByIngredients`, {
        params: {
          apiKey: process.env.SPOONACULAR_API_KEY,
          ingredients: allIngredients,
          number: 3,
          ranking: 1, 
          ignorePantry: true 
        }
      });

      if (!response.data || response.data.length === 0) {
        return res.status(404).json({ error: "No recipes found matching your ingredients." });
      }

      const bestMatch = response.data[0];
      recipeId = bestMatch.id;
      usedIngredients = bestMatch.usedIngredients;
      missedIngredients = bestMatch.missedIngredients;
    } 

    else {
      let userProfile = { age: 25, weight: 70, height: 175, gender: 'male', activityLevel: 'sedentary' };
      const dbUser = await User.findById(userId);
      if (dbUser) userProfile = { ...userProfile, ...dbUser.toObject() };

      const baseCalc = (10 * userProfile.weight) + (6.25 * userProfile.height) - (5 * userProfile.age);
      let bmr = (userProfile.gender === 'male') ? baseCalc + 5 : baseCalc - 161;
      const activityMap = { 'sedentary': 1.2, 'light': 1.375, 'moderate': 1.55, 'active': 1.725 };
      const dailyCalories = Math.round(bmr * (activityMap[userProfile.activityLevel] || 1.2));
      const targetCalories = Math.round(dailyCalories * 0.35); 

      const response = await axios.get(`https://api.spoonacular.com/recipes/complexSearch`, {
        params: {
          apiKey: process.env.SPOONACULAR_API_KEY,
          includeIngredients: allIngredients,
          number: 3,
          sort: 'max-used-ingredients', 
          maxCalories: targetCalories + 100,
          minProtein: 20,
          fillIngredients: true,
          addRecipeNutrition: true
        }
      });

      if (!response.data.results || response.data.results.length === 0) {
        return res.status(404).json({ error: "No healthy recipes found with these items." });
      }

      const bestMatch = response.data.results[0];
      recipeId = bestMatch.id;
      usedIngredients = bestMatch.usedIngredients || [];
      missedIngredients = bestMatch.missedIngredients || [];
    }

    const fullInfoResponse = await axios.get(`https://api.spoonacular.com/recipes/${recipeId}/information`, {
      params: {
        apiKey: process.env.SPOONACULAR_API_KEY,
        includeNutrition: true
      }
    });

    const fullRecipe = fullInfoResponse.data;

   
    let finalMissedList = [];
    
    missedIngredients.forEach(missed => {
     
        const foundInPantry = inventory.find(pantryItem => 
            pantryItem.name.toLowerCase().includes(missed.name.toLowerCase()) || 
            missed.name.toLowerCase().includes(pantryItem.name.toLowerCase())
        );

        if (foundInPantry) {

            usedIngredients.push({
                ...missed,
                originalName: `${missed.name} (Have: ${foundInPantry.quantity} ${foundInPantry.unit})`
            });
        } else {
   
            finalMissedList.push(missed);
        }
    });


    const getNutrient = (name) => {
      const n = fullRecipe.nutrition?.nutrients?.find(n => n.name === name);
      return n ? `${Math.round(n.amount)}${n.unit}` : "0g";
    };


    let finalInstructions = fullRecipe.instructions || "No instructions provided.";
    if (fullRecipe.analyzedInstructions?.length > 0) {
       finalInstructions = fullRecipe.analyzedInstructions[0].steps.map(s => `Step ${s.number}: ${s.step}`).join('\n\n');
    } else if (fullRecipe.summary) {
       finalInstructions = fullRecipe.summary.replace(/<[^>]*>?/gm, '');
    }


    res.json({
      title: fullRecipe.title,
      image: fullRecipe.image,
      time: `${fullRecipe.readyInMinutes || 30} mins`,
      difficulty: fullRecipe.readyInMinutes > 45 ? "Hard" : "Easy",
      
      missedIngredientsCount: finalMissedList.length,
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
        original: item.originalName
      })),
      shoppingList: finalMissedList.map(item => ({
        name: item.name,
        amount: item.amount,
        unit: item.unitShort,
        image: item.image
      }))
    });

  } catch (err) {
    console.error("Recipe Error:", err.message);
    res.status(500).json({ error: "The Chef is having trouble connecting." });
  }
};

module.exports = { getInventory, addItem, deleteItem, generateRecipe };