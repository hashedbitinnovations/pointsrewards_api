const express = require('express');
const router = express.Router();
const db = require('../db');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { checkUserByEmail, checkUserByUsername } = require('../controllers/checkUser');
const checkUser = require('../controllers/checkUser');
const verifyJwt = require('../verify.js')
const verifyJwtAdmin = require('../verifyadmin.js')



// http://localhost:4000/pagecontent/showAll
router.get('/showAll', verifyJwt, async (req, res) => {
    try {
        const [allData] = await db.promise().query('SELECT * FROM pagecontent');
        if (allData.length === 0) {
            return res.status(400).json({ message: "There is no data in the table" });
        } else {
            return res.status(200).json(allData);
        }

    } catch (err) {
        console.error(err);
        res.status(400).json({ message: err });
    }
});

// http://localhost:4000/pagecontent/:srno
router.get('/:srno', async (req, res) => {
    try {
        const { srno } = req.params;
        if (srno != '') {
            const [allData] = await db.promise().query('SELECT * FROM pagecontent WHERE srno = ?', [srno]);
            if (allData.length === 0) {
                return res.status(400).json({ message: "There is no data in the table" });
            } else {
                return res.status(200).json(allData);
            }
        } else {
            return res.status(400).json({ message: "data sent is empty" });
        }
    } catch (err) {
        console.log(err)
        return res.status(400).json({ message: err });
    }
})


//http://localhost:4000/pagecontent/addNewData
router.post('/addNewData', verifyJwtAdmin, async (req, res) => {
    const { contentid, contentname, contenttitle, content, contenttype, pageid, pagelocationid } = req.body;
    try {
        if (!contentid || !contentname || !contenttitle) {
            return res.status(400).json({ message: "Bad Request: Missing required parameters" });
        } else {
            await db.promise().query('INSERT INTO pagecontent (contentid, contentname, contenttitle, content, contenttype, pageid, pagelocationid) VALUES(?,?,?,?,?,?,?)',
                [contentid, contentname, contenttitle, content, contenttype, pageid, pagelocationid]);
            return res.status(201).json({ message: "Data inserted successfully" });
        }
    } catch (err) {
        return res.status(400).json({ message: err });
    }
});


//http://localhost:4000/pagecontent/updates/:srno
router.put('/updates/:srno', verifyJwt, async (req, res) => {
    const srno = req.params.srno;
    const { contentid, contentname, contenttitle, content, contenttype, pageid, pagelocationid } = req.body;
    try {
        if (!contentid || !contentname || !contenttitle) {
            return res.status(400).json({ message: "Bad Request: Missing required parameters" });
        } else {
            const [update] = await db.promise().query(
                'UPDATE pagecontent SET  contentid=?, contentname=?, contenttitle=?, content=?, contenttype=?, pageid=?, pagelocationid=? WHERE srno=?',
                [contentid, contentname, contenttitle, content, contenttype, pageid, pagelocationid, srno]
            );
            if (update.affectedRows === 0) {
                return res.status(400).json({ message: "No row is updated" });
            } else {
                return res.status(200).json({ message: "Updated successfully" });
            }
        }
    } catch (err) {
        console.log(err);
        return res.status(400).json({ message: err });
    }
});



//http://localhost:4000/pagecontent/delete/:srno
router.delete('/delete/:srno', verifyJwtAdmin, async (req, res) => {
    const srno = req.params.srno;
    try {
        const [content] = await db.promise().query('SELECT * FROM pagecontent WHERE srno = ?', [srno]);
        if (content.length === 0) {
            return res.status(404).json({ message: "pagecontent not found" });
        }
        const [result] = await db.promise().query('UPDATE pagecontent SET isactive = 0 WHERE srno = ?', [srno]);
        if (result.affectedRows === 0) {
            return res.status(400).json({ message: "pagecontent was not deleted" });
        }
        return res.status(200).json({ message: "pagecontent deleted successfully" });
    } catch (err) {
        console.error(err);
        return res.status(400).json({ message: err });
    }
});



module.exports = router;
