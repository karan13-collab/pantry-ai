const Household = require('../models/Household');
const User = require('../models/User');
const crypto = require('crypto');


exports.createHousehold = async (req, res) => {
  try {
    const { name } = req.body;

   
    const joinCode = crypto.randomBytes(3).toString('hex').toUpperCase();

  
    const household = new Household({
      name,
      joinCode,
      admin: req.user.id, 
      members: [req.user.id] 
    });

    await household.save();

    await User.findByIdAndUpdate(req.user.id, {
      household: household._id,
      role: 'admin' 
    });

    res.json(household);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.joinHousehold = async (req, res) => {
  try {
    const { joinCode } = req.body;

   
    const household = await Household.findOne({ joinCode });
    if (!household) {
      return res.status(404).json({ msg: 'Invalid Join Code' });
    }

   
    if (household.members.includes(req.user.id)) {
      return res.status(400).json({ msg: 'You are already in this household' });
    }

  
    household.members.push(req.user.id);
    await household.save();

   
    await User.findByIdAndUpdate(req.user.id, {
      household: household._id,
      role: 'member'
    });

    res.json(household);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};