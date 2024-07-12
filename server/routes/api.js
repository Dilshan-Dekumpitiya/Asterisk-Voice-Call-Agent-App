// server/routes/api.js
const express = require('express');
const router = express.Router();
const db = require('../db'); // Import the db.js file

// Example API route
router.get('/data', (req, res) => {
    const query = "SELECT * FROM asterisk_cdr_rports.cdr WHERE src = '0773959585'";
    db.query(query, (error, results, fields) => {
    if (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    console.log(results); // Log results to console
    res.json(results);
  });
});

module.exports = router;
