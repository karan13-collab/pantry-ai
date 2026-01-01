require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db'); // Uses your config file

// Import Routes
const authRoutes = require('./routes/authRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const householdRoutes = require('./routes/household');



// Initialize App
const app = express();

// Middleware
app.use(express.json());
app.use(cors({origin: 'http://localhost:3000', // Or whatever port your frontend uses
  credentials: true}));
app.use('/api/shopping-lists', require('./routes/shoppingRoutes'));

// Connect to Database
connectDB();

// --- MOUNT ROUTES ---
// This aligns with your folder structure:
app.use('/api/auth', authRoutes);           // Points to routes/authRoutes.js
app.use('/api/inventory', inventoryRoutes); // Points to routes/inventoryRoutes.js
app.use('/api/household', householdRoutes); 
app.use('/api/user', require('./routes/user'))// Points to routes/householdRoutes.js
app.use('/api/household', require('./routes/household'));

// Root Route (Health Check)
app.get('/', (req, res) => {
  res.send('PantryAI API is running...');
});

// Global Error Handler (Optional but recommended)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start Server
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));