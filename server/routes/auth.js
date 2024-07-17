const express = require('express');
const router = express.Router();
const cors = require('cors'); // Import CORS middleware
const db = require('../db'); // Assuming this imports your database connection



// Use CORS middleware
router.use(cors());

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
          const username = results[0].username;
          const loginDate = new Date();

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

router.post('/logout', (req, res) => {
  const { extensionNumber, logoutReason } = req.body;
  const logoutDate = new Date();

  // Find the latest login record that doesn't have a logout date
  const findQuery = `
      SELECT * FROM asterisk_cdr_rports.agent_login_logout
      WHERE extension = ? AND logoutDate IS NULL
      ORDER BY loginDate DESC
      LIMIT 1
  `;

  db.query(findQuery, [extensionNumber], (error, results) => {
      if (error) {
          console.error('Error finding login record:', error); // Log the error
          res.status(500).json({ error: 'Internal Server Error' });
          return;
      }

      if (results.length > 0) {
          const loginRecord = results[0];
          const updateQuery = `
              UPDATE asterisk_cdr_rports.agent_login_logout
              SET logoutDate = ?, logoutReasonID = ?
              WHERE id = ?
          `;

          db.query(updateQuery, [logoutDate, logoutReason, loginRecord.id], (updateError, updateResults) => {
              if (updateError) {
                  console.error('Error updating logout record:', updateError); // Log the error
                  res.status(500).json({ error: 'Internal Server Error' });
                  return;
              }

              console.log("Logout record updated for extension:", extensionNumber);

              res.json({ success: true });
          });
      } else {
          res.status(404).json({ error: 'No active login record found or already logged out' });
      }
  });
});




module.exports = router;
