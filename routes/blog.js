const express = require('express');
const router = express.Router();
const db = require('../db');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { checkUserByEmail, checkUserByUsername } = require('../controllers/checkUser');
const checkUser = require('../controllers/checkUser');
const verifyJwt = require('../verify.js')
const verifyJwtAdmin = require('../verifyadmin.js')



// http://localhost:4000/blog/fetchblogs/0
router.get('/fetchblogs/:pageid', async(req,res) => {
    const pageid = req.params.pageid;
    const offset = pageid*10;
    const min = pageid*10 + 1;
    const max = pageid*10 + 10;
    try{
        const response = await db.promise().query(`select * from posts WHERE isactive = 1 ORDER BY srno DESC LIMIT 10 OFFSET ${offset}`);
        res.status(200).json(response[0]);
    }
    catch(err){
        res.status(400).json({message: err});
    }
});

// http://localhost:4000/blog/fetchblogsheading/0
router.get('/fetchblogsheading/:pageid', async(req,res) => {
    const pageid = req.params.pageid;
    const offset = pageid*10;
    const min = pageid*10 + 1;
    const max = pageid*10 + 10;
    try{
        const response = await db.promise().query(`select author, category, createdby, createdon, featuredicon, featuredimage, postheading, postid, posttitle, srno from posts WHERE isactive = 1 && category != 'career' ORDER BY srno DESC LIMIT 10 OFFSET ${offset}`);
        res.status(200).json(response[0]);
    }
    catch(err){
        res.status(400).json({message: err});
    }
});


// http://localhost:4000/blog/fetchcareerblogsheading/0
router.get('/fetchcareerblogsheading/:pageid', async(req,res) => {
    const pageid = req.params.pageid;
    const offset = pageid*10;
    const min = pageid*10 + 1;
    const max = pageid*10 + 10;
    try{
        const response = await db.promise().query(`select author, category, createdby, createdon, featuredicon, featuredimage, postheading, postid, posttitle, srno from posts WHERE isactive = 1 && category = 'career' ORDER BY srno DESC LIMIT 10 OFFSET ${offset}`);
        res.status(200).json(response[0]);
    }
    catch(err){
        res.status(400).json({message: err});
    }
});


// http://localhost:4000/blog/fetchblogdetail/1
router.get('/fetchblogdetail/:blogid', async(req,res) => {
    const blogid = req.params.blogid;
    try{
        const response = await db.promise().query(`select * from posts WHERE srno = ${blogid}`);
        const response2 = await db.promise().query(`select * from postcontent WHERE postid = ${blogid} ORDER BY postlocationid ASC`);
        let finalObj = {
            blog: response[0][0],
            blogcontent: response2[0]
        }
        res.status(200).json(finalObj);
    }
    catch(err){
        res.status(400).json({message: err});
    }
});

// http://localhost:4000/blog/recentblogs
router.get('/recentblogs/', async(req,res) => {
    try{
        const response = await db.promise().query(`select author, category, createdby, createdon, featuredicon, featuredimage, postheading, postid, posttitle, srno from posts WHERE isactive = 1 ORDER BY srno DESC LIMIT 10`);
        res.status(200).json(response[0]);
    }
    catch(err){
        res.status(400).json({message: err});
    }
});

// http://localhost:4000/blog/categoryblogs/ai
router.get('/categoryblogs/:categoryname', async(req,res) => {
    const categoryname = req.params.categoryname;
    console.log(categoryname);
    try{
        const response = await db.promise().query(`select author, category, createdby, createdon, featuredicon, featuredimage, postheading, postid, posttitle, srno from posts WHERE isactive = 1 && category = '${categoryname}' ORDER BY srno DESC `);
        res.status(200).json(response[0]);
    }
    catch(err){
        res.status(400).json({message: err});
    }
});



// http://localhost:4000/blog/addblog
router.post('/addblog', verifyJwt, async(req,res) => {
    const {content , category } = req.body;
    try {
        if(!content||!category){
            return res.status(400).json({ message: "Bad Request: Missing required parameters" });
        }
        else{
            await db.promise().query(`INSERT INTO posts (content,category,isactive) VALUES (?,?,1)`, [content,category]);
            return res.status(201).json({ message: 'Blog post added successfully' });
        }
    } catch(err) {
       return res.status(400).json({ message: err });
    }
});

// http://localhost:4000/blog/updateblog/:blogid
router.put('/updateblog/:blogid', verifyJwt, async(req,res) => {
    const { content, category, author,posttitle,postheading} = req.body;
    const srno = req.params.srno;
    try {
            if (!content || !category || !author || !posttitle|| !postheading) {
                return res.status(400).json({ message: "Bad Request: Missing required parameters" });
        } else {
            await db.promise().query('UPDATE posts SET content = ?, category = ?, author = ?,posttitle=?,postheading=? WHERE srno = ?', [content, category, author,posttitle,postheading,srno]);
            return res.status(200).json({ message: 'Blog post updated successfully' });
        }
    } catch(err) {
        console.error(err);
        res.status(400).json({ message: err });
    }
});

// http://localhost:4000/blog/deleteblog/:blogid
router.delete('/deleteblog/:blogid', verifyJwtAdmin, async(req,res) => {
    const blogid = req.params.blogid;
    try {
        await db.promise().query(`UPDATE posts SET isactive = 0 WHERE postid = ?`, [blogid]);
        res.status(200).json({ message: 'Blog post deleted successfully' });
    } catch(err) {
        console.error(err);
        res.status(400).json({ message: err });
    }
});

// http://localhost:4000/blog/activeblog
router.get('/activeblog', verifyJwtAdmin, async (req, res) => {
    try {
        const response = await db.promise().query('SELECT * FROM posts WHERE isactive = ?', [1]);
        res.status(200).json(response[0]);
    } catch (err) {
        res.status(400).json({ message: err });
    }
});




module.exports = router;