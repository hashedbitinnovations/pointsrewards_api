const express = require('express');
const router = express.Router();
const db = require('../db');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { checkUserByEmail, checkUserByUsername } = require('../controllers/checkUser');
const checkUser = require('../controllers/checkUser');
const verifyJwt = require('../verify.js')
const verifyJwtAdmin = require('../verifyadmin.js')

// http://localhost:4000/category/fetchallcategories

router.get('/fetchallcategories', async(req,res) => {
    try{

        const [response] = await db.promise()
        .query(`select categorydisplayname displayname,categoryname name,count(category) count from posts join postcategory on categoryname=category group by category;`);
        res.status(200).json(response);
    }
    catch(err){
        res.status(400).json({message:err});
    }
})
module.exports = router;