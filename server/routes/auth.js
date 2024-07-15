const express = require('express');
const router = express.Router();
const db = require('../db'); // Assuming this imports your database connection

// POST /auth/login - Handles login requests
router.post('/login', (req, res) => {
    const { extensionNumber, password } = req.body;
  
    // Query to check if user exists with provided credentials
    const query = `
      SELECT * FROM asterisk_cdr_rports.users
      WHERE extension = ? AND password = ?
    `;
  
    db.query(query, [extensionNumber, password], (error, results) => {
      if (error) {
        console.error('Error executing login query:', error);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
  
      if (results.length > 0) {
        // Successful login
        res.json({ success: true });
      } else {
        // Invalid credentials
        res.status(401).json({ error: 'Invalid credentials' });
      }
    });
  });

module.exports = router;
