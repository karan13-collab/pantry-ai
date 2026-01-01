const mongoose = require('mongoose');
const User = require('../models/User');
const Household = require('../models/Household');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateJoinCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const calculateActivityLevel = (days) => {
  if (days >= 6) return 'active';   
  if (days >= 3) return 'moderate'; 
  if (days >= 1) return 'light';  
  return 'sedentary';          
};

exports.register = async (req, res) => {
  const { 
    username, email, password, age, height, weight, gender, 
    workoutDays, allergies,
    householdAction, joinCode, householdName 
  } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    const calculatedActivity = calculateActivityLevel(Number(workoutDays) || 0);


    const newUserId = new mongoose.Types.ObjectId();

    let finalHouseholdId = null;
    let finalJoinCode = null;

    if (householdAction === 'join') {
      if (!joinCode) return res.status(400).json({ msg: 'Join Code is required.' });
      
      const householdToJoin = await Household.findOne({ joinCode: joinCode.toUpperCase() });
      if (!householdToJoin) return res.status(404).json({ msg: 'Invalid Join Code.' });
      
      finalHouseholdId = householdToJoin._id;
      finalJoinCode = householdToJoin.joinCode;

      await Household.findByIdAndUpdate(finalHouseholdId, { 
        $push: { members: newUserId } 
      });

    } else {
      const pantryName = householdName || `${username}'s Pantry`;
      const newCode = generateJoinCode(); 
      
      const newHousehold = await Household.create({
        name: pantryName,
        joinCode: newCode,
        admin: newUserId,
        members: [newUserId], 
        currency: 'EUR'
      });
      finalHouseholdId = newHousehold._id;
      finalJoinCode = newCode;
    }
    user = new User({
      _id: newUserId, 
      username, 
      email, 
      password, 
      age, 
      height, 
      weight, 
      gender, 
      workoutDays: Number(workoutDays), 
      activityLevel: calculatedActivity, 
      allergies: allergies || [],       
      household: finalHouseholdId
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

  
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
  const { email, password } = req.body;

  try {
    
    let user = await User.findOne({ email }).populate('household');
    if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

    const currentHouseholdId = user.household ? user.household._id : null;
    const currentJoinCode = user.household ? user.household.joinCode : null;

    const payload = { 
        user: { 
            id: user.id, 
            household: currentHouseholdId, 
            joinCode: currentJoinCode 
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