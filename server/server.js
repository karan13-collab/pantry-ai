require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

//Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

//DB Connection
const connectDB=require('./config/db');
connectDB();

app.get('/', (req, res) => {
    res.send('PantryAI Server is running...');
});

//Starting the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});