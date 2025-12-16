require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const authRoutes = require('./routes/authRoutes');

const app = express();


app.use(helmet());
app.use(cors());
app.use(express.json());

const connectDB=require('./config/db');
connectDB();

app.get('/', (req, res) => {
    res.send('PantryAI Server is running...');
});

app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});