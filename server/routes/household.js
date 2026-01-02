const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');
const Household = require('../models/Household'); // Imports your Schema
const verifyToken = require('../middleware/authMiddleware');
const householdController = require('../controllers/householdController');

// PUT /api/household/rename
// Rename the logged-in user's household

router.get('/current', auth, householdController.getCurrentHousehold);

console.log('Auth is:', auth);
console.log('Controller Function is:', householdController.getCurrentHousehold);
router.put('/rename', verifyToken, async (req, res) => {
  const { name } = req.body;

  // Simple validation
  if (!name) {
    return res.status(400).json({ msg: 'Please provide a household name' });
  }

  try {
    // 1. Find the logged-in User
    const user = await User.findById(req.user.id);
    if (!user.household) {
      return res.status(400).json({ msg: 'User does not belong to a household' });
    }

    // 2. Find the Household
    const household = await Household.findById(user.household);
    if (!household) {
      return res.status(404).json({ msg: 'Household not found' });
    }

    // 3. Security Check: Only allow the Admin to rename
    // We compare the ID strings to be safe


     if (household.admin.toString() !== req.user.id) {
       return res.status(403).json({ msg: 'Only the Household Admin can rename this.' });
     }


    // 4. Update the Name
    household.name = name;
    await household.save();

    res.json(household);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;