const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { createHousehold, joinHousehold } = require('../controllers/householdController');

router.post('/create', auth, createHousehold);
router.post('/join', auth, joinHousehold);

module.exports = router;