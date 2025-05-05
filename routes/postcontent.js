const express = require('express');
const router = express.Router();
const db = require('../db');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { checkUserByEmail, checkUserByUsername } = require('../controllers/checkUser');
const checkUser = require('../controllers/checkUser');
const verifyJwt = require('../verify.js')
const verifyJwtAdmin = require('../verifyadmin.js')


// http://localhost:4000/postcontent/showAll
router.get('/showAll', async (req, res) => {
    try {
        const [allData] = await db.promise().query('SELECT * FROM postcontent');
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

// http://localhost:4000/postcontent/:postcontentid
router.get('/:postcontentid', async (req, res) => {
    try {
        const { postcontentid } = req.params;
        if (postcontentid != '') {
            console.log(postcontentid)
            const [allData] = await db.promise().query('SELECT * FROM postcontent WHERE postcontentid = ?', [postcontentid]);
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

// http://localhost:4000/postcontent/addNewData
router.post('/addNewData', verifyJwtAdmin, async (req, res) => {
    const { postcontentid, postcontentname, postcontenttitle, postcontent, postcontenttype, postid, postlocationid, isactive } = req.body;
    try {
        if (!postcontentid || !postcontentname || !postcontenttitle || !postcontent || !postcontenttype || !postid || !postlocationid || !isactive) {
            return res.status(400).json({ message: "Bad Request: Missing required parameters" });
        } else {
            await db.promise().query('INSERT INTO postcontent (postcontentid, postcontentname, postcontenttitle, postcontent, postcontenttype, postid, postlocationid, isactive) VALUES(?,?,?,?,?,?,?,?)',
                [postcontentid, postcontentname, postcontenttitle, postcontent, postcontenttype, postid, postlocationid, isactive]);
            return res.status(201).json({ message: "Data inserted successfully" });
        }
    } catch (err) {
        console.log(err);
        return res.status(400).json({ message: err });
    }
});

// http://localhost:4000/postcontent/updates/:srno
router.put('/updates/:srno',verifyJwt, async (req, res) => {
    const srno = req.params.srno;
    const { postcontentid, postcontentname, postcontenttitle, postcontent, postcontenttype, postid, postlocationid, isactive } = req.body;
    try {
        if (!postcontentid || !postcontentname || !postcontenttitle || !postcontent || !postcontenttype || !postid || !postlocationid || !isactive) {
            return res.status(400).json({ message: "Bad Request: Missing required parameters" });
        } else {
            const [update] = await db.promise().query(
                ' UPDATE postcontent SET postcontentid=? , postcontentname=? , postcontenttitle=? ,postcontent=? , postcontenttype=? , postid=? , postlocationid=? , isactive=? WHERE srno=?', [postcontentid, postcontentname, postcontenttitle, postcontent, postcontenttype, postid, postlocationid, isactive, srno]);
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

// http://localhost:4000/postcontent/delete/:srno
router.delete('/delete/:srno', verifyJwtAdmin, async (req, res) => {
    const srno = req.params.srno;
    try {
        const [content] = await db.promise().query('SELECT * FROM postcontent WHERE srno = ?', [srno]);
        if (content.length === 0) {
            return res.status(404).json({ message: "Content not found" });
        }
        const [result] = await db.promise().query('UPDATE postcontent SET isactive = 0 WHERE srno = ?', [srno]);
        if (result.affectedRows === 0) {
            return res.status(400).json({ message: "Content was not deleted" });
        }
        return res.status(200).json({ message: "Content deleted successfully" });
    } catch (err) {
        console.error(err);
        return res.status(400).json({ message: err });
    }
});


module.exports = router;