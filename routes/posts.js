
const express = require('express');
const router = express.Router();
const db = require('../db');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { checkUserByEmail, checkUserByUsername } = require('../controllers/checkUser');
const checkUser = require('../controllers/checkUser');
const verifyJwt = require('../verify.js')
const verifyJwtAdmin = require('../verifyadmin.js')

// http://localhost:4000/posts/showAll
router.get('/showAll', async (req, res) => {
    try {
        const [allData] = await db.promise().query('SELECT * FROM posts');
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

// http://localhost:4000/posts/fetchblogbyid/:srno
router.get('/fetchblogbyid/:srno', async (req, res) => {
    try {
        const { srno } = req.params;
        if (srno != '') {
            const [allData] = await db.promise().query(`SELECT * FROM posts WHERE isactive = 1 AND srno = ?`, [srno]);
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


//http://localhost:4000/posts/addNewData
router.post('/addNewData', verifyJwt, async (req, res) => {
    const { postheading, author, content, featuredimage, featuredicon, category } = req.body;
    //fetch last srno and then create postid
    let posttitle = postheading.toLowerCase().split(' ').join('-');
    let postid = posttitle.substring(0, 10);
    try {
        if (!postheading || !content || !category) {
            return res.status(400).json({ message: "Bad Request: Missing required parameters" });
        } else {
            await db.promise().query('INSERT INTO posts (postid,posttitle,postheading, author, content ,featuredimage,featuredicon,category ) VALUES(?,?,?,?,?,?,?,?)',
                [postid, posttitle, postheading, author, content, featuredimage, featuredicon, category]);
            return res.status(201).json({ message: "Data inserted successfully" });
        }
    } catch (err) {
        return res.status(400).json({ message: err });
    }
});
//http://localhost:4000/posts/updatepost/:srno
router.put('/updatepost/:srno', verifyJwt, async(req,res) => {
    const srno = req.params.srno;
    const { content, category, author,posttitle} = req.body;
    try {
            if (!content || !category || !author || !posttitle) {
                return res.status(400).json({ message: "Bad Request: Missing required parameters" });
        } else {
            await db.promise().query('UPDATE posts SET content = ?, category = ?, author = ?,posttitle=? WHERE srno = ?', [content, category, author,posttitle,srno]);
            return res.status(200).json({ message: 'post updated successfully' });
        }
    } catch(err) {
        console.error(err);
        res.status(400).json({ message: err });
    }
});

//http://localhost:4000/posts/updates/:srno
router.put('/updates/:srno', verifyJwt, async (req, res) => {
    const { srno } = req.params
    const { postid, posttitle, postheading, content, featuredimage, featuredicon, category } = req.body;
    try {
        if (!postid || !posttitle || !postheading || !content || !featuredimage || !featuredicon || !category) {
            return res.status(400).json({ message: "Bad Request: Missing required parameters" });
        } else {
            const [update] = await db.promise().query(
                'UPDATE posts SET  postid=?,posttitle=?,postheading=?,content=? ,featuredimage=?,featuredicon=?,category=? WHERE srno=?',
                [postid, posttitle, postheading, content, featuredimage, featuredicon, category, srno]
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



//http://localhost:4000/posts/delete/:srno
router.delete('/delete/:srno', verifyJwtAdmin, async (req, res) => {
    const srno = req.params.srno;
    console.log('-----------deleting..........', req.params.srno)
    try {
        // const [content] = await db.promise().query('SELECT * FROM posts WHERE srno = ?', [srno]);
        // if (content.length === 0) {
        //     return res.status(404).json({ message: "posts not found" });
        // }
        const [result] = await db.promise().query('UPDATE posts SET isactive = 0 WHERE srno = ?', [srno]);
        if (result.affectedRows === 0) {
            return res.status(400).json({ message: "post is not deleted" });
        }
        return res.status(200).json({ message: "post deleted successfully" });
    } catch (err) {
        console.error(err);
        return res.status(400).json({ message: err });
    }
});


//http://localhost:4000/posts/activate/:srno
router.put('/activate/:srno', async (req, res) => {
    const srno = req.params.srno;
    try {
        const [result] = await db.promise().query('UPDATE posts SET isactive = 1 WHERE srno = ?', [srno]);
        if (result.affectedRows === 0) {
            return res.status(400).json({ message: "post is not activated" });
        }
        return res.status(200).json({ message: "post activated successfully" });
    } catch (err) {
        console.error(err);
        return res.status(400).json({ message: err });
    }
});

//http://localhost:4000/posts/deactivate/:srno
router.put('/deactivate/:srno', async (req, res) => {
    const srno = req.params.srno;
    try {
        const [result] = await db.promise().query('UPDATE posts SET isactive = 0 WHERE srno = ?', [srno]);
        if (result.affectedRows === 0) {
            return res.status(400).json({ message: "post is not deactivated" });
        }
        return res.status(200).json({ message: "post deactivated successfully" });
    } catch (err) {
        console.error(err);
        return res.status(400).json({ message: err });
    }
});


module.exports = router;


