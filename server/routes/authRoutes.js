const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');

const { 
  register, 
  verifyEmail, 
  login, 
  forgotPassword, 
  resetPassword 
} = require('../controllers/authController');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 10, 
  message: { 
    msg: 'Too many login attempts from this IP, please try again after 15 minutes.' 
  },
  standardHeaders: true, 
  legacyHeaders: false,
});

router.post('/register', register);
router.post('/verify-email', verifyEmail);

router.post('/login', loginLimiter, login);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;