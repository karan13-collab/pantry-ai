const logSecurityEvent = require('../utils/auditLogger');
const User = require('../models/User');
const Household = require('../models/Household');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');


const generateOTP = () => {
  return crypto.randomInt(100000, 1000000).toString();
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
    workoutDays, allergies, dietaryPreferences,
    householdAction, joinCode, householdName 
  } = req.body;
  
  if (!password || password.length < 8) {
    return res.status(400).json({ msg: 'Password must be at least 8 characters long.' });
  }
  const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
  if (!specialCharRegex.test(password)) {
    return res.status(400).json({ msg: 'Password must contain at least one special character.' });
  }

  try {
    let user = await User.findOne({ email });
    
    if (user && user.isVerified) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    if (user && !user.isVerified) {
      await User.deleteOne({ email }); 
    }
    
    const newUserId = new mongoose.Types.ObjectId();
    let finalHouseholdId = null;

    if (householdAction === 'join') {
       if (!joinCode) return res.status(400).json({ msg: 'Join Code required' });
       const householdToJoin = await Household.findOne({ joinCode: joinCode.toUpperCase() });
       if (!householdToJoin) return res.status(404).json({ msg: 'Invalid Join Code' });
       finalHouseholdId = householdToJoin._id;
       await Household.findByIdAndUpdate(finalHouseholdId, { $push: { members: newUserId } });
    } else {
       const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
       const newHousehold = await Household.create({
         name: householdName || `${username}'s Pantry`,
         joinCode: newCode,
         admin: newUserId,
         members: [newUserId]
       });
       finalHouseholdId = newHousehold._id;
    }

    const rawOtp = generateOTP();
    const hashedOtp = crypto.createHash('sha256').update(rawOtp).digest('hex');
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); 

    user = new User({
      _id: newUserId,
      username, email, password, age, height, weight, gender, 
      workoutDays, 
      activityLevel: calculateActivityLevel(workoutDays),
      allergies: allergies || [],
      dietaryPreferences: dietaryPreferences || 'None', 
      household: finalHouseholdId,
      role: 'member',
      isVerified: false,
      otp: hashedOtp,
      otpExpires
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    await sendEmail(email, rawOtp);

    res.json({ msg: 'OTP Sent', email: email });

  } catch (err) {
    console.error("Register Error:", err.message);
    res.status(500).send('Server error');
  }
};

exports.verifyEmail = async (req, res) => {
  const { email, otp } = req.body; 

  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ msg: 'User not found' });
    if (user.isVerified) return res.status(400).json({ msg: 'User already verified' });

    const hashedInputOtp = crypto.createHash('sha256').update(otp).digest('hex');

    if (user.otp !== hashedInputOtp) {
      return res.status(400).json({ msg: 'Invalid OTP' });
    }
    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ msg: 'OTP Expired. Please register again.' });
    }

    user.isVerified = true;
    user.otp = undefined; 
    user.otpExpires = undefined;
    await user.save();

    const payload = { 
      user: { 
        id: user.id, 
        household: user.household,
        joinCode: 'FETCH_ON_DASHBOARD' 
      } 
    };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      
      res.cookie('jwt_token', token, {
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production', 
        sameSite: 'lax', 
        maxAge: 60 * 60 * 1000 
      });

      res.status(200).json({ 
        msg: 'Email verified successfully! Logging you in...',
        user: {
          id: user.id,
          email: user.email
        }
      });
    });

  } catch (err) {
    console.error("Verify Error:", err.message);
    res.status(500).send('Server Error');
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    let user = await User.findOne({
      $or: [{ email: username }, { username: username }]
    }).populate('household');

    if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });
    if (!user.isVerified) return res.status(400).json({ msg: 'Please verify your email first.' });
    if (user.lockoutUntil && user.lockoutUntil > Date.now()) {
      const remainingMs = user.lockoutUntil - Date.now();
      const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));
      return res.status(429).json({ 
        msg: `Too many failed attempts. Account locked. Try again in ${remainingMinutes} minute.` 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      user.loginAttempts = 0;
      user.lockoutUntil = undefined;
      await user.save();

      await logSecurityEvent(req, user.email, 'LOGIN_SUCCESS', 'SUCCESS');

      const payload = { 
          user: { 
              id: user.id, 
              household: user.household?._id, 
              joinCode: user.household?.joinCode 
          } 
      };
      
      jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
          if (err) throw err;
          
          res.cookie('jwt_token', token, {
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 1000
          });

          res.status(200).json({ 
            msg: 'Login successful',
            user: { 
              id: user.id,
              username: user.username,
              household: user.household?._id
            }
          });
      });

    } else {
      user.loginAttempts += 1;
      let lockoutDuration = 0;

      if (user.loginAttempts === 4) {
        lockoutDuration = 1 * 60 * 1000; 
      } else if (user.loginAttempts === 6) {
        lockoutDuration = 5 * 60 * 1000; 
      } else if (user.loginAttempts >= 8) {
        lockoutDuration = 15 * 60 * 1000; 
      }

      if (lockoutDuration > 0) {
        user.lockoutUntil = Date.now() + lockoutDuration;
        await user.save();

        await logSecurityEvent(req, user.email, 'ACCOUNT_LOCKED', 'WARNING');

        return res.status(429).json({ 
          msg: `Account locked due to multiple failures.` 
        });
      }

      await user.save();

      await logSecurityEvent(req, user.email, 'LOGIN_FAILURE', 'FAILURE');

      const attemptsLeft = 4 - user.loginAttempts;
      
      return res.status(400).json({ 
        msg: `Invalid Credentials. ${attemptsLeft > 0 ? attemptsLeft : 0} attempts remaining before lockout.`,
        loginAttempts: user.loginAttempts
      });
    }

  } catch (err) { 
    console.error(err);
    res.status(500).send('Server Error'); 
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });

    const rawOtp = generateOTP();
    const hashedOtp = crypto.createHash('sha256').update(rawOtp).digest('hex');

    user.otp = hashedOtp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendEmail(email, rawOtp, "Reset Your Password", "Password Reset Request");

    res.json({ msg: "Reset code sent to email" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ msg: 'New password must be at least 8 characters long.' });
  }
  const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
  if (!specialCharRegex.test(newPassword)) {
    return res.status(400).json({ msg: 'New password must contain at least one special character.' });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });

    const hashedInputOtp = crypto.createHash('sha256').update(otp).digest('hex');

    if (user.otp !== hashedInputOtp) return res.status(400).json({ msg: "Invalid Code" });
    if (user.otpExpires < Date.now()) return res.status(400).json({ msg: "Code Expired" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // 👇 EXPLICIT SECURITY: Log Password Reset 👇
    await logSecurityEvent(req, user.email, 'PASSWORD_RESET', 'SUCCESS');

    res.json({ msg: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

exports.logout = (req, res) => {
  res.cookie('jwt_token', '', {
    httpOnly: true,
    expires: new Date(0) 
  });
  res.status(200).json({ msg: 'Successfully logged out' });
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password').populate('household');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    console.error("Get User Error:", err.message);
    res.status(500).send('Server Error');
  }
};