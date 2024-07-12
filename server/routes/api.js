// server/routes/api.js
const express = require('express');
const router = express.Router();
const db = require('../db'); // Import the db.js file

// Example API route
router.get('/data', (req, res) => {
    const query = "SELECT COUNT(*) AS record_count FROM asterisk_cdr_rports.cdr WHERE src = '0773959585';";
    db.query(query, (error, results, fields) => {
    if (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    const recordCount = results[0].record_count; // Extract record count
    console.log('Record count:', recordCount); // Log record count to console
    res.json({ record_count: recordCount }); // Respond with JSON containing record count
  });
});

module.exports = router;
