const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Import your schema
// NEW (Correct)
const verifyToken = require('../middleware/authMiddleware'); // Your JWT middleware

// GET /api/user/profile
// This gets the data for the "My Data" tab
// GET /api/user/profile
router.get('/profile', verifyToken, async (req, res) => {
    try {
      // 1. Get current user
      const user = await User.findById(req.user.id).select('-password');
  
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }
  
      // 2. Find OTHER users in the same household (if user has one)
      let householdMembers = [];
      if (user.household) {
        householdMembers = await User.find({ household: user.household })
          .select('username email') // Only get name and email
          .lean(); // Converts to plain JS object
      }
  
      // 3. Send combined data
      // We mix the user object with the new 'members' list
      res.json({ ...user.toObject(), members: householdMembers });
      
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });

module.exports = router;