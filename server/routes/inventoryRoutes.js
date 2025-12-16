const express = require('express');
const router = express.Router();
const { getInventory, addItem } = require('../controllers/inventoryController');

// We will add the Auth Middleware here later to protect these routes
// router.use(require('../middleware/authMiddleware')); 

router.get('/', getInventory);   // GET /api/inventory -> Fetch items
router.post('/', addItem);       // POST /api/inventory -> Add item

module.exports = router;