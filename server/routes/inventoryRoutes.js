const express = require('express');
const router = express.Router();
const { 
  getInventory, 
  addItem, 
  deleteItem, 
  generateRecipe 
} = require('../controllers/inventoryController');


// const { protect } = require('../middleware/authMiddleware');
// router.use(protect); 

router.get('/', getInventory);      
router.post('/', addItem);          

router.delete('/:id', deleteItem);               
router.post('/generate-recipe', generateRecipe); 

module.exports = router;