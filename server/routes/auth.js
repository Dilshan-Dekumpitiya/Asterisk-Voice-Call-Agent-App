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
         const loginDate = new Date();
         const username = results[0].username; // Fetch username from query results

         console.log("Login successful for extension:", extensionNumber);



         // Insert login record into agent_login_logout table
         const insertQuery = `
           INSERT INTO asterisk_cdr_rports.agent_login_logout (extension, loginDate)
           VALUES (?, ?)
         `;
 
         db.query(insertQuery, [extensionNumber, loginDate], (insertError, insertResults) => {
           if (insertError) {
             console.error('Error inserting login record:', insertError);
             res.status(500).json({ error: 'Internal Server Error' });
             return;
           }

           console.log("Login record inserted for extension:", extensionNumber);
 
           res.json({ username: username, success: true });
         });
      } else {
        // Invalid credentials
        res.status(401).json({ error: 'Invalid credentials' });
      }
    });
  });



module.exports = router;
