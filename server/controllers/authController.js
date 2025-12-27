const mongoose = require('mongoose'); // Required for ObjectId()
const User = require('../models/User');
const Household = require('../models/Household');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Helper: Random 6-Char Code
const generateJoinCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

exports.register = async (req, res) => {
  const { username, email, password, age, height, weight, gender, activityLevel, householdAction, joinCode, householdName } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    // 1. Generate a "Virtual" User ID
    // We need this ID now to set the household 'admin', even though the user isn't saved yet.
    const newUserId = new mongoose.Types.ObjectId();

    let finalHouseholdId = null;
    let finalJoinCode = null;

    if (householdAction === 'join') {
      // --- JOIN EXISTING ---
      if (!joinCode) return res.status(400).json({ msg: 'Join Code is required.' });
      
      const householdToJoin = await Household.findOne({ joinCode: joinCode.toUpperCase() });
      if (!householdToJoin) return res.status(404).json({ msg: 'Invalid Join Code.' });
      
      finalHouseholdId = householdToJoin._id;
      finalJoinCode = householdToJoin.joinCode;

      // Add user to members
      await Household.findByIdAndUpdate(finalHouseholdId, { 
        $push: { members: newUserId } 
      });

    } else {
      // --- CREATE NEW ---
      const pantryName = householdName || `${username}'s Pantry`;
      const newCode = generateJoinCode(); 
      
      const newHousehold = await Household.create({
        name: pantryName,
        joinCode: newCode,
        admin: newUserId,     // <--- Give the Household the Virtual ID
        members: [newUserId], 
        currency: 'EUR'
      });
      finalHouseholdId = newHousehold._id;
      finalJoinCode = newCode;
    }

    // 2. Create User (Using the Virtual ID)
    user = new User({
      _id: newUserId, // <--- IMPORTANT: Use the ID we generated earlier
      username, email, password, age, height, weight, gender, activityLevel,
      household: finalHouseholdId
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    // 3. Generate Token
    const payload = { 
      user: { 
        id: user.id, 
        household: finalHouseholdId, 
        joinCode: finalJoinCode 
      } 
    };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.login = async (req, res) => {
  // ... (Your existing login code is fine, just ensure payload includes joinCode if you want) ...
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email }).populate('household');
    if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

    const payload = { 
        user: { 
            id: user.id, 
            household: user.household?._id, 
            joinCode: user.household?.joinCode 
        } 
    };
    
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
        if (err) throw err;
        res.json({ token });
    });
  } catch(err) { res.status(500).send('Server Error'); }
};
// 2. LOGIN CONTROLLER
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

    const payload = { user: { id: user.id, household: user.household } };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};