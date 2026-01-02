const Household = require("../models/Household");
const User = require("../models/User");

// --- HELPER: Same 6-char code generator as Auth ---
const generateJoinCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// 1. Create Household
exports.createHousehold = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ msg: "Household name is required" });
    }

    // Generate unique code
    const joinCode = generateJoinCode();

    // Create Household
    const household = new Household({
      name,
      joinCode,
      admin: req.user.id,
      members: [req.user.id],
      currency: "EUR", 
    });

    await household.save();

    // Update the User to link to this new household
    await User.findByIdAndUpdate(req.user.id, {
      household: household._id,
    });

    res.json(household);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// ... (keep your existing imports and functions)

// 4. Update Household (Only Admin)
exports.updateHousehold = async (req, res) => {
  try {
    const { name } = req.body;

    // Find the household the user belongs to
    const household = await Household.findOne({ members: req.user.id });

    if (!household) {
      return res.status(404).json({ msg: "Household not found" });
    }

    // --- SECURITY CHECK: ONLY ADMIN ---
    // We must convert ObjectId to string to compare them correctly
    if (household.admin.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Not authorized. Only the Admin can rename the household." });
    }

    // Update fields
    if (name) household.name = name;
    
    // You can add currency updates here too if you want
    // if (req.body.currency) household.currency = req.body.currency;

    await household.save();
    res.json(household);

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
// 2. Get Current Household (NOW SEPARATE AND VISIBLE)
exports.getCurrentHousehold = async (req, res) => {
  try {
    // Look for a household where the 'members' array contains this user's ID
    const household = await Household.findOne({ members: req.user.id })
      .populate("members", "name email")
      .populate("admin", "name");

    if (!household) {
      return res.status(404).json({ msg: "No household found for this user" });
    }

    res.json(household);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// 3. Join Household
exports.joinHousehold = async (req, res) => {
  try {
    const { joinCode } = req.body;

    // Find by Code
    const household = await Household.findOne({
      joinCode: joinCode.toUpperCase(),
    });
    if (!household) {
      return res.status(404).json({ msg: "Invalid Join Code" });
    }

    // Check if already a member
    if (household.members.includes(req.user.id)) {
      return res.status(400).json({ msg: "You are already in this household" });
    }

    // Add to Members list
    household.members.push(req.user.id);
    await household.save();

    // Update User link
    await User.findByIdAndUpdate(req.user.id, {
      household: household._id,
    });

    res.json(household);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};