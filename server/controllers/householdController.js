const Household = require('../models/Household');
const User = require('../models/User');

// --- HELPER: Same 6-char code generator as Auth ---
const generateJoinCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

exports.createHousehold = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ msg: "Household name is required" });
    }

    // 1. Generate unique code
    const joinCode = generateJoinCode();

    // 2. Create Household
    // Note: We can use req.user.id here because the user is ALREADY logged in!
    const household = new Household({
      name,
      joinCode,
      admin: req.user.id, 
      members: [req.user.id],
      currency: 'EUR' // Default currency
    });

    await household.save();

    // 3. Update the User to link to this new household
    await User.findByIdAndUpdate(req.user.id, {
      household: household._id,
      // role: 'admin' // (Optional: Only if you added 'role' to your User model)
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

    // 1. Find by Code
    const household = await Household.findOne({ joinCode: joinCode.toUpperCase() });
    if (!household) {
      return res.status(404).json({ msg: 'Invalid Join Code' });
    }

    // 2. Check if already a member
    if (household.members.includes(req.user.id)) {
      return res.status(400).json({ msg: 'You are already in this household' });
    }

    // 3. Add to Members list
    household.members.push(req.user.id);
    await household.save();

    // 4. Update User link
    await User.findByIdAndUpdate(req.user.id, {
      household: household._id,
      // role: 'member' // (Optional)
    });

    res.json(household);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};