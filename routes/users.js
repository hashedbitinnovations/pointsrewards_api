const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const { checkUserByEmail, checkUserByUsername } = require('../controllers/checkUser');
const checkUser = require('../controllers/checkUser');
const verifyJwt = require('../verify.js')
const verifyJwtAdmin = require('../verifyadmin.js')

// http://localhost:4000/users/adduser
router.post('/adduser', async (req, res) => {
    console.log('Inside request');
    try {

        const { name, email, mobile, whatsapp_mobile, city, hometown, college, university, passing_year, branch, linkedinid, referredby, islaptop, mern_knowledge } = req.body;
        // console.log(req.body);
        const userid = name.toLowerCase().split(" ").join("").slice(0, 5) + parseInt(Math.random() * 100000);
        let tempdate = new Date();
        const creationdate = tempdate.getDate() + '-' + tempdate.getMonth() + '-' + tempdate.getDay();
        const creationtime = tempdate.getHours() + '-' + tempdate.getMinutes() + '-' + tempdate.getSeconds();
        const password = parseInt(Math.random() * 10000000000);

        const response = await db.promise().query(`INSERT INTO mern_oct_2023 (userid, name, email, mobile, whatsapp_mobile, city, hometown, college, university, passing_year, branch, creationdate, creationtime, password, linkedinid, referredby, islaptop, mern_knowledge ) VALUES ('${userid}','${name}',' ${email}','${mobile}', '${whatsapp_mobile}', '${city}', '${hometown}', '${college}', '${university}', '${passing_year}', '${branch}', '${creationdate}', '${creationtime}', '${password}', '${linkedinid}', '${referredby}', '${islaptop}', '${mern_knowledge}' )`);

        //const response2 = await db.promise().query(`SELECT userid FROM users WHERE username = '${req.body.username}' `);
        // console.log(response, response2[0]);

        res.status(201).json(response[0]);
    } catch (err) {
        console.log(err);
        res.status(400).json(err);
    }
})

// http://localhost:4000/users/allusers
router.get('/allusers', verifyJwtAdmin, async (req, res) => {
    try {
        const response = await db.promise().query(`select * from users where status = 1`);
        res.status(201).json(response[0]);
    }
    catch (err) {
        res.status(400).json(err);
    }
});

// http://localhost:4000/users/login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const response = await db.promise().query(`SELECT password, userid, username, usertype FROM users where status = 1 and ( username = '${username}' or email = '${username}' or mobile = '${username}')`);
        // user found in db
        if (response[0].length > 0) {
            //password matched
            console.log('user found in db', response[0][0].password, password, typeof(password), typeof(response[0][0].password));
          //  if (response[0][0].password == req.body.password) {

                if ((bcrypt.compareSync(password, response[0][0].password)) || (password === response[0][0].password)) {
                    //password matched
                    let obj = {};
                    obj.token = jwt.sign({ username: response[0][0] }, "hashedbit", {
                        // expiresIn: 600
                        expiresIn: '24h' // expires in 24 hours
                    });

                    obj.userType = response[0][0].usertype;
                    obj.userId = response[0][0].username;
                    console.log('obj', obj);
                    res.status(202).json(obj);
                    //res.status(202).json({message: 'Successfully logged in'});
                    
                }
                //password not matched
                else {
                    res.status(401).json({ message: 'Incorrect Password', loginStatus: false });
                }
            }
            // user not found
            else {
                res.status(422).json({ message: 'User Not Found', loginStatus: false });
            }
        } catch (err) {
            // console.log(err);
            res.status(400).json({err: err});
        }
    })

module.exports = router;
