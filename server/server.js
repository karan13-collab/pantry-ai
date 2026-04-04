require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db'); 
const authRoutes = require('./routes/authRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const householdRoutes = require('./routes/household');
const https = require('https');
const fs = require('fs');
const path = require('path');
const app = express();
const cookieParser = require('cookie-parser');
app.use(require('./middleware/securityHeaders'));
app.use(cookieParser());
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'https://localhost:3000', 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'x-auth-token', 'Authorization']
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(require('./middleware/noSqlSanitizer'));


app.use((req, res, next) => {
  Object.defineProperty(req, 'query', {
    value: { ...req.query },
    writable: true,
    configurable: true,
    enumerable: true,
  });
  next();
});

app.use('/api/', require('./middleware/rateLimiter'));

connectDB();

app.use('/api/auth', authRoutes);           
app.use('/api/inventory', inventoryRoutes); 
app.use('/api/household', householdRoutes); 
app.use('/api/user', require('./routes/user'));
app.use('/api/shopping-lists', require('./routes/shoppingRoutes'));

app.get('/', (req, res) => {
  res.send('PantryAI API is running securely...');
});

app.use((err, req, res, next) => {
  console.error(err.stack); 
  res.status(500).json({ error: 'Something went wrong!' }); 
});
const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, 'key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'cert.pem'))
};
const PORT = process.env.PORT || 5002;
https.createServer(sslOptions, app).listen(PORT, () => {
  console.log(`🔒 Secure Server running on HTTPS port ${PORT}`);
});