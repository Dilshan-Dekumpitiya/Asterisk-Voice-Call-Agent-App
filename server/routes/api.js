// server/routes/api.js
const express = require('express');
const router = express.Router();
const db = require('../db'); // Import the db.js file

//Missed Call count
router.get('/missedCallCount', (req, res) => {
    const query = `
        SELECT '6002' AS dst, COUNT(DISTINCT cdr.uniqueid) AS missed_call_count
        FROM asterisk_cdr_rports.cdr cdr
        WHERE cdr.uniqueid NOT IN (
            SELECT sub_cdr.uniqueid
            FROM asterisk_cdr_rports.cdr sub_cdr
            WHERE sub_cdr.disposition = 'ANSWER'
            AND sub_cdr.calldate >= CURDATE()
            AND sub_cdr.calldate < CURDATE() + INTERVAL 1 DAY
        )
        AND cdr.disposition = 'NO ANSWER'
        AND cdr.calldate >= CURDATE()
        AND cdr.calldate < CURDATE() + INTERVAL 1 DAY
        AND cdr.dstchannel LIKE '%6002%';
    `;

    db.query(query, (error, results, fields) => {
    if (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    const missedCallCount = results[0].missed_call_count; // Corrected alias name
    console.log('Missed Call Count:', missedCallCount); // Log count to console
    res.json({ missed_call_count: missedCallCount }); // Respond with JSON containing count
  });
});

//Inbound Call count
router.get('/inboundCallCount', (req, res) => {
    const query = `
        select COUNT(DISTINCT uniqueid) AS inbound_call_count 
        from asterisk_cdr_rports.cdr 
        where dstchannel like '%6002%' 
        AND calldate >= CURDATE() 
        AND calldate < CURDATE() + INTERVAL 1 DAY 
        AND disposition = 'ANSWERED';
    `;

    db.query(query, (error, results, fields) => {
    if (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    const inboundCallCount = results[0].inbound_call_count; // Corrected alias name
    console.log('Inbound Call Count:', inboundCallCount); // Log count to console
    res.json({ inbound_call_count: inboundCallCount }); // Respond with JSON containing count
  });
});

//Outbound Call count
router.get('/outboundCallCount', (req, res) => {
    const query = `
        SELECT COUNT(DISTINCT uniqueid) AS outbound_call_count
        FROM asterisk_cdr_rports.cdr
        WHERE dstchannel LIKE '%my_sip_trunk%'
        AND calldate >= CURDATE()
        AND calldate < CURDATE() + INTERVAL 1 DAY
        AND src = '6002';
    `;

    db.query(query, (error, results, fields) => {
    if (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    const outboundCallCount = results[0].outbound_call_count; // Corrected alias name
    console.log('Outbound Call Count:', outboundCallCount); // Log count to console
    res.json({ outbound_call_count: outboundCallCount }); // Respond with JSON containing count
  });
});

module.exports = router;
