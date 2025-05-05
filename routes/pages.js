
const express = require('express');
const router = express.Router();
const db = require('../db');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { checkUserByEmail, checkUserByUsername } = require('../controllers/checkUser');
const checkUser = require('../controllers/checkUser');
const verifyJwt = require('../verify.js')
const verifyJwtAdmin = require('../verifyadmin.js')


// http://localhost:4000/pages/showAll
router.get('/showAll', verifyJwtAdmin, async (req, res) => {
    try {
        const [allData] = await db.promise().query('SELECT * FROM pages');
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


// http://localhost:4000/pages/:srno
router.get('/:srno', async (req, res) => {
    try {
        const { srno } = req.params;
        if (srno != '') {
            const [allData] = await db.promise().query('SELECT * FROM pages WHERE srno = ?', [srno]);
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


// http://localhost:4000/pages/fetchpagedata/privacypolicy
router.get('/fetchpagedata/:pagename', async (req, res) => {
    try {
        const { pagename } = req.params;
        if (pagename != '') {
            const [allData] = await db.promise().query('SELECT * FROM pages WHERE pagename = ?', [pagename]);
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


// http://localhost:4000/pages/fetchpagecontent
router.post('/fetchpagecontent', async (req, res) => {
    try {
        const { pagetype, pagesubtype } = req.body;

        const [allData] = await db.promise().query('SELECT * FROM pages WHERE pagetype = ? AND pagesubtype = ?', [pagetype, pagesubtype]);
        if (allData.length === 0) {
            return res.status(400).json({ message: "There is no data in the table" });
        } else {
            return res.status(200).json(allData);
        }

    } catch (err) {
        console.log(err)
        return res.status(400).json({ message: err });
    }
})


//http://localhost:4000/pages/addNewData
router.post('/addNewData', verifyJwtAdmin, async (req, res) => {
    const { pageid, pageurlname, pagename, pagetitle, pagesubtitle, pagetype,
        pagesubtype, pagecontent, pagetheme, tobeaddedinmenu, tobeaddedinsubmenu1, parentofsubmenu1, tobeaddedinsubmenu2, parentofsubmenu2, iscommon, issecure, templateid, hasmenubar, hasheader, hasfooter, hasleftsidebar,hasrightsidebar, leftsidebarid, rightsidebarid } = req.body;
    try {
        if (!pageid || !pageurlname || !pagename || !pagetitle || !pagesubtitle) {
            return res.status(400).json({ message: "Bad Request: Missing required parameters" });
        } else {
            await db.promise().query('INSERT INTO pages (pageid , pageurlname ,  pagename ,  pagetitle, pagesubtitle, pagetype, pagesubtype, pagecontent, pagetheme, tobeaddedinmenu, tobeaddedinsubmenu1, parentofsubmenu1, tobeaddedinsubmenu2, parentofsubmenu2, iscommon, issecure, templateid, hasmenubar, hasheader, hasfooter, hasleftsidebar,hasrightsidebar, leftsidebarid, rightsidebarid  ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
                [pageid, pageurlname, pagename, pagetitle, pagesubtitle, pagetype,
                    pagesubtype, pagecontent, pagetheme, tobeaddedinmenu, tobeaddedinsubmenu1, parentofsubmenu1, tobeaddedinsubmenu2, parentofsubmenu2, iscommon, issecure, templateid, hasmenubar, hasheader, hasfooter, hasleftsidebar,hasrightsidebar, leftsidebarid, rightsidebarid]);
            return res.status(201).json({ message: "Data inserted successfully" });
        }
    } catch (err) {
        return res.status(400).json({ message: err });
    }
});


//http://localhost:4000/pages/updates/:srno
router.put('/updates/:srno', verifyJwt, async (req, res) => {
    const { srno } = req.params
    const { pageid, pageurlname, pagename, pagetitle, pagesubtitle, pagetype,
        pagesubtype, pagecontent, pagetheme, tobeaddedinmenu, tobeaddedinsubmenu1, parentofsubmenu1, tobeaddedinsubmenu2, parentofsubmenu2, iscommon, issecure, templateid, hasmenubar, hasheader, hasfooter, hasleftsidebar,hasrightsidebar, leftsidebarid, rightsidebarid } = req.body;
    try {
        if (!pageid || !pageurlname || !pagename || !pagetitle || !pagesubtitle || !pagecontent) {
            return res.status(400).json({ message: "Bad Request: Missing required parameters" });
        } else {
            const [update] = await db.promise().query(
                'UPDATE pages SET  pageid=? , pageurlname=? ,  pagename=? ,  pagetitle=? , pagesubtitle=?, pagetype=?,  pagesubtype=?, pagecontent=?, pagetheme=?, tobeaddedinmenu=?, tobeaddedinsubmenu1=?, parentofsubmenu1=?, tobeaddedinsubmenu2=?, parentofsubmenu2=?, iscommon=?, issecure=?, templateid=?, hasmenubar=?, hasheader=?, hasfooter=?, hasleftsidebar=?,hasrightsidebar=?, leftsidebarid=?, rightsidebarid=? WHERE srno=?',
                [pageid, pageurlname, pagename, pagetitle, pagesubtitle, pagetype, pagesubtype, pagecontent, pagetheme, tobeaddedinmenu, tobeaddedinsubmenu1, parentofsubmenu1, tobeaddedinsubmenu2, parentofsubmenu2, iscommon, issecure, templateid, hasmenubar, hasheader, hasfooter, hasleftsidebar,hasrightsidebar, leftsidebarid, rightsidebarid, srno]
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



//http://localhost:4000/pages/delete/:srno
router.delete('/delete/:srno', verifyJwt, async (req, res) => {
    const srno = req.params.srno;
    try {
        const [content] = await db.promise().query('SELECT * FROM pages WHERE srno = ?', [srno]);
        if (content.length === 0) {
            return res.status(404).json({ message: "pages not found" });
        }
        const [result] = await db.promise().query('UPDATE pages SET isactive = 0 WHERE srno = ?', [srno]);
        if (result.affectedRows === 0) {
            return res.status(400).json({ message: "page is not deleted" });
        }
        return res.status(200).json({ message: "page deleted successfully" });
    } catch (err) {
        console.error(err);
        return res.status(400).json({ message: err });
    }
});



module.exports = router;


