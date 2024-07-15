// server/routes/api.js
const express = require('express');
const router = express.Router();
const db = require('../db'); // Import the db.js file

// //Missed Call count
// router.get('/missedCallCount', (req, res) => {
//     const query = `
//         SELECT '6002' AS dst, COUNT(DISTINCT cdr.uniqueid) AS missed_call_count
//         FROM asterisk_cdr_rports.cdr cdr
//         WHERE cdr.uniqueid NOT IN (
//             SELECT sub_cdr.uniqueid
//             FROM asterisk_cdr_rports.cdr sub_cdr
//             WHERE sub_cdr.disposition = 'ANSWER'
//             AND sub_cdr.calldate >= CURDATE()
//             AND sub_cdr.calldate < CURDATE() + INTERVAL 1 DAY
//         )
//         AND cdr.disposition = 'NO ANSWER'
//         AND cdr.calldate >= CURDATE()
//         AND cdr.calldate < CURDATE() + INTERVAL 1 DAY
//         AND cdr.dstchannel LIKE '%6002%';
//     `;

//     db.query(query, (error, results, fields) => {
//     if (error) {
//       console.error('Error fetching data:', error);
//       res.status(500).json({ error: 'Internal Server Error' });
//       return;
//     }
//     const missedCallCount = results[0].missed_call_count; // Corrected alias name
//     console.log('Missed Call Count:', missedCallCount); // Log count to console
//     res.json({ missed_call_count: missedCallCount }); // Respond with JSON containing count
//   });
// });

// //Inbound Call count
// router.get('/inboundCallCount', (req, res) => {
//     const query = `
//         select COUNT(DISTINCT uniqueid) AS inbound_call_count 
//         from asterisk_cdr_rports.cdr 
//         where dstchannel like '%6002%' 
//         AND calldate >= CURDATE() 
//         AND calldate < CURDATE() + INTERVAL 1 DAY 
//         AND disposition = 'ANSWERED';
//     `;

//     db.query(query, (error, results, fields) => {
//     if (error) {
//       console.error('Error fetching data:', error);
//       res.status(500).json({ error: 'Internal Server Error' });
//       return;
//     }
//     const inboundCallCount = results[0].inbound_call_count; // Corrected alias name
//     console.log('Inbound Call Count:', inboundCallCount); // Log count to console
//     res.json({ inbound_call_count: inboundCallCount }); // Respond with JSON containing count
//   });
// });

// //Outbound Call count
// router.get('/outboundCallCount', (req, res) => {
//     const query = `
//         SELECT COUNT(DISTINCT uniqueid) AS outbound_call_count
//         FROM asterisk_cdr_rports.cdr
//         WHERE dstchannel LIKE '%my_sip_trunk%'
//         AND calldate >= CURDATE()
//         AND calldate < CURDATE() + INTERVAL 1 DAY
//         AND src = '6002';
//     `;

//     db.query(query, (error, results, fields) => {
//     if (error) {
//       console.error('Error fetching data:', error);
//       res.status(500).json({ error: 'Internal Server Error' });
//       return;
//     }
//     const outboundCallCount = results[0].outbound_call_count; // Corrected alias name
//     console.log('Outbound Call Count:', outboundCallCount); // Log count to console
//     res.json({ outbound_call_count: outboundCallCount }); // Respond with JSON containing count
//   });
// });

//service level
router.get('/service-level', (req, res) => {
    const query = `
    SELECT username, extension,
        ((calls_15_or_less*4)+(calls_between_15_and_30*3)+(calls_between_30_and_45*2)+(calls_between_45_and_60*1))*100 /
        ((calls_15_or_less+calls_between_15_and_30+calls_between_30_and_45+calls_between_45_and_60)*5) AS service_level,
        (calls_15_or_less+calls_between_15_and_30+calls_between_30_and_45+calls_between_45_and_60) AS call_count
    FROM (
        SELECT
            subquery.username, extension,
            SUM(CASE WHEN subquery.hold_time <= 15 THEN 1 ELSE 0 END) AS calls_15_or_less,
            SUM(CASE WHEN subquery.hold_time > 15 AND subquery.hold_time <= 30 THEN 1 ELSE 0 END) AS calls_between_15_and_30,
            SUM(CASE WHEN subquery.hold_time > 30 AND subquery.hold_time <= 45 THEN 1 ELSE 0 END) AS calls_between_30_and_45,
            SUM(CASE WHEN subquery.hold_time > 45 AND subquery.hold_time <= 60 THEN 1 ELSE 0 END) AS calls_between_45_and_60
        FROM (
            SELECT
                q.id,
                q.timestamp,
                q.unique_id,
                q.queue_name,
                q.queue_member_channel,
                q.event_type,
                SUBSTRING_INDEX(SUBSTRING_INDEX(q.event_parameters, '|', 1), '|', -1) AS hold_time,
                SUBSTRING_INDEX(SUBSTRING_INDEX(q.event_parameters, '|', 2), '|', -1) AS talk_time,
                u.username,
                u.extension
            FROM
                asterisk_cdr_rports.test_queue_log q
            JOIN asterisk_cdr_rports.users u ON SUBSTRING_INDEX(SUBSTRING_INDEX(q.queue_member_channel, '/', -1), '-', 1) = u.extension
            WHERE (q.event_type = 'COMPLETEAGENT' OR q.event_type = 'COMPLETECALLER') AND u.extension='6002'
        ) AS subquery
        GROUP BY subquery.username
    ) AS hold_time_counts;`;

    db.query(query, (err, results) => {
        if (err) throw err;
        res.json(results[0]); // Assuming only one result
        console.log("aaa",results[0]);
    });
});


module.exports = router;
