const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');

const { 
  getInventory, 
  addItem, 
  deleteItem, 
  generateRecipe 
} = require('../controllers/inventoryController');

if (!getInventory) console.error(" Critical Error: getInventory is undefined in routes!");

router.get('/', auth, getInventory);
router.post('/', auth, addItem);
router.delete('/:id', auth, deleteItem);
router.post('/generate-recipe', auth, generateRecipe);

module.exports = router;