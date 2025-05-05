const express = require('express');
const router = express.Router();
const db = require('../db');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { checkUserByEmail, checkUserByUsername } = require('../controllers/checkUser');
const checkUser = require('../controllers/checkUser');
const verifyJwt = require('../verify.js')
const verifyJwtAdmin = require('../verifyadmin.js')

// http://localhost:4000/postcategory/showAll
router.get('/showAll', async (req, res) => {
    try {
        const [allData] = await db.promise().query('SELECT * FROM postcategory');
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



// http://localhost:4000/postcategory/updates/:srno
router.put('/updates/:srno', verifyJwt, async (req, res) => {
    const srno = req.params.srno;
    const { categoryid, categoryname, categorydisplayname, categorydetails, isactive } = req.body;
    try {
        if (!categoryid || !categoryname || !categorydisplayname || !categorydetails || isactive === undefined) {
            return res.status(400).json({ message: "Bad Request: Missing required parameters" });
        } else {
            const [update] = await db.promise().query(
                'UPDATE postcategory SET categoryid=?, categoryname=?, categorydisplayname=?, categorydetails=?, isactive=? WHERE srno=?',
                [categoryid, categoryname, categorydisplayname, categorydetails, isactive, srno]
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


// http://localhost:4000/postcategory/addNewData
router.post('/addNewData', verifyJwtAdmin, async (req, res) => {
    const { categoryid, categoryname, categorydisplayname, categorydetails, isactive } = req.body;
    try {
        if (!categoryid || !categoryname || !categorydisplayname || !categorydetails || !isactive) {
            return res.status(400).json({ message: "Bad Request: Missing required parameters" });
        } else {
            await db.promise().query('INSERT INTO postcategory (categoryid, categoryname, categorydisplayname, categorydetails, isactive) VALUES(?,?,?,?,?)',
                [categoryid, categoryname, categorydisplayname, categorydetails, isactive]);
            return res.status(201).json({ message: "Data inserted successfully" });
        }
    } catch (err) {
        return res.status(400).json({ message: err });
    }
});

// http://localhost:4000/postcategory/delete/:srno
router.delete('/delete/:srno', verifyJwtAdmin, async (req, res) => {
    const srno = req.params.srno;
    try {
        const [category] = await db.promise().query('SELECT * FROM postcategory WHERE srno = ?', [srno]);
        if (category.length === 0) {
            return res.status(404).json({ message: "Category not found" });
        }
        const [result] = await db.promise().query('UPDATE postcategory SET isactive = 0 WHERE srno = ?', [srno]);
        if (result.affectedRows === 0) {
            return res.status(400).json({ message: "Category was not deleted" });
        }
        return res.status(200).json({ message: "Category deleted successfully" });
    } catch (err) {
        console.error(err);
        return res.status(400).json({ message: err});
    }
});



module.exports = router;
