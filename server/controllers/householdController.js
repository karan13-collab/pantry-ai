const Household = require("../models/Household");
const User = require("../models/User");

const generateJoinCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

exports.createHousehold = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ msg: "Household name is required" });
    }

    const joinCode = generateJoinCode();
    const household = new Household({
      name,
      joinCode,
      admin: req.user.id,
      members: [req.user.id],
      currency: "EUR", 
    });

    await household.save();

    await User.findByIdAndUpdate(req.user.id, {
      household: household._id,
    });

    res.json(household);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

exports.updateHousehold = async (req, res) => {
  try {
    const { name } = req.body;

    const household = await Household.findOne({ members: req.user.id });

    if (!household) {
      return res.status(404).json({ msg: "Household not found" });
    }


    if (household.admin.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Not authorized. Only the Admin can rename the household." });
    }

    
    if (name) household.name = name;
  

    await household.save();
    res.json(household);

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

exports.getCurrentHousehold = async (req, res) => {
  try {

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

exports.joinHousehold = async (req, res) => {
  try {
    const { joinCode } = req.body;

    const household = await Household.findOne({
      joinCode: joinCode.toUpperCase(),
    });
    if (!household) {
      return res.status(404).json({ msg: "Invalid Join Code" });
    }

    if (household.members.includes(req.user.id)) {
      return res.status(400).json({ msg: "You are already in this household" });
    }

    household.members.push(req.user.id);
    await household.save();

    await User.findByIdAndUpdate(req.user.id, {
      household: household._id,
    });

    res.json(household);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};