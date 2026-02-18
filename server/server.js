require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db'); 


const authRoutes = require('./routes/authRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const householdRoutes = require('./routes/household');

const app = express();

app.use(express.json());
app.use(cors({origin: 'http://localhost:3000', 
  credentials: true}));
app.use('/api/shopping-lists', require('./routes/shoppingRoutes'));

connectDB();

app.use('/api/auth', authRoutes);           
app.use('/api/inventory', inventoryRoutes); 
app.use('/api/household', householdRoutes); 
app.use('/api/user', require('./routes/user'))
app.use('/api/household', require('./routes/household'));


app.get('/', (req, res) => {
  res.send('PantryAI API is running...');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));