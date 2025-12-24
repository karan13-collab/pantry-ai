const express = require('express');
const router = express.Router();
const { getInventory, addItem, deleteItem, generateRecipe } = require('../controllers/inventoryController');


const auth = require('../middleware/authMiddleware'); 


router.get('/', auth, getInventory);
router.post('/', auth, addItem);  
router.delete('/:id', auth, deleteItem);
router.post('/generate-recipe', auth, generateRecipe);

module.exports = router;