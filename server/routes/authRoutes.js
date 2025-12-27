const express = require('express');
const router = express.Router();

// 👇 CHECK THIS LINE: It must use { } to match 'exports.register'
const { register, login } = require('../controllers/authController');

// Routes
router.post('/register', register); // If 'register' is undefined, this line crashes
router.post('/login', login);

module.exports = router;