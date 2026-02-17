const express = require('express');
const router = express.Router();
const User = require('../models/User'); 
const verifyToken = require('../middleware/authMiddleware'); 


router.get('/profile', verifyToken, async (req, res) => {
    try {
      const user = await User.findById(req.user.id)
      .select('-password')
      .populate('household', 'name joinCode');
      
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }
  
      let householdMembers = [];
      if (user.household) {
        householdMembers = await User.find({ household: user.household })
          .select('username email')
          .lean(); 
      }
  
     
      res.json({ ...user.toObject(), members: householdMembers });
      
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });

router.put('/profile', verifyToken, async (req, res) => {
    const { weight, height, age, activityLevel, dietaryPreferences, allergies } = req.body;
  
    const userFields = {};
    if (weight) userFields.weight = weight;
    if (height) userFields.height = height;
    if (age) userFields.age = age;
    if (activityLevel) userFields.activityLevel = activityLevel;
    if (dietaryPreferences) userFields.dietaryPreferences = dietaryPreferences;
    if (allergies) userFields.allergies = allergies;
  
    try {
     
      let user = await User.findByIdAndUpdate(
        req.user.id,
        { $set: userFields },
        { new: true } 
      ).select('-password');
  
      res.json(user);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });

module.exports = router;