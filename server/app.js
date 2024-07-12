// server/app.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db'); // Import the db.js file
const cors = require('cors');

const app = express();
const port = 3000;

// Allow requests from all origins (adjust as per your security needs)
app.use(cors());

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Routes
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
