const express = require("express");
const nodemailer = require("nodemailer");
require("dotenv").config();
const router = express.Router();
const db = require("../db");
const path= require('path');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { checkUserByEmail, checkUserByUsername } = require('../controllers/checkUser');
const checkUser = require('../controllers/checkUser');
const verifyJwt = require('../verify.js')
const verifyJwtAdmin = require('../verifyadmin.js')


const multer = require('multer');

const sendEmail = async ( email, mailsubject, mailhtml) => {
  
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false, 
    auth: {
      user: process.env.USER,
      pass: process.env.PASSWORD
    },
  });

  const mailOptions = {
    from: {
      name: "HashedBit Innovations",
      address: process.env.USER   // sender address
    }, 
    to: email, // receiver address
    subject: mailsubject, // Subject line
    html: mailhtml, // html body
   
  }
  try {
    
    await transporter.sendMail(mailOptions);
    console.log("Email has been sent Successfullly");
  }
  catch (error) {
    console.log(error);
  }
}

const storage = multer.diskStorage({
  destination: 'uploads/resume', // Specify the folder to store uploaded files
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // 5 mb file limit
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  },
}).single('resume');

function checkFileType(file, cb) {
  const filetypes = /pdf|doc|docx/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Only PDFs and Word documents are allowed!');
  }
}



// http://localhost:4000/career/alluser
router.get('/alluser', async (req, res) => {
  try {
    const response = await db.promise()
      .query(`select * from career
    where isactive = 1`);
    res.status(200).json(response[0]);
  }
  catch (err) {
    res.status(400).json({ message: err });
  }
});

// http://localhost:4000/career/register
router.post("/register",upload, async (req, res) => {
  try {
    const {
      name,
      email,
      mobile,
      whatsapp_mobile,
      city,
      hometown,
      college,
      university,
      passing_year,
      branch,
      linkedinid,
      githubid,
      referredby,
      currentcompany,
      yearsOfExperience,
      currentDesignation,
      noticePeriod,
      currentSalary,
      skills,
      dob,
      workLocation,
      typePartFull,
      typeFullIntern,
      jobType,
    } = req.body

    const username = name.toLowerCase().split(" ").join("").slice(0, 5) + parseInt(Math.random() * 100000);
    const regid = 'HB' + parseInt(Math.random() * 10000000000);
    const password = parseInt(Math.random() * 10000000000);
    const uploadCV = req.file ? `/uploads/resume/${req.file.filename}` : null;
    // console.log(uploadCV);

    
    const response = await db.promise()
      .query(`INSERT INTO career(regid,username,password,name,email,mobile,whatsapp_mobile,city,hometown,college,university,passing_year,branch,linkedinid,githubid,referredby,
                currentcompany,yearsOfExperience,currentDesignation,noticePeriod,currentSalary,skills,dob,workLocation,typePartFull,
                typeFullIntern,jobType,uploadCV)
                VALUES('${regid}','${username}','${password}','${name}','${email}','${mobile}','${whatsapp_mobile}','${city}','${hometown}','${college}','${university}','${passing_year}','${branch}','${linkedinid}','${githubid}','${referredby}','${currentcompany}','${yearsOfExperience}','${currentDesignation}',
                '${noticePeriod}','${currentSalary}','${skills}','${dob}','${workLocation}','${typePartFull}','${typeFullIntern}',
                '${jobType}','${uploadCV}')`);

    let mailsubject = 'Response from HashedBit Innovations - Career Form Submission';
    let mailhtml = `<div><p><b>Hi ${name} !</b><br>We have received your application.<br>We will connect back soon in case of matching requirement.<p><br><br><p>Thanks and Regards...<br><b>HashedBit Innovations</b><br>Contact :- 09669787936, 09599171535<br>Email :- info@hashedbit.com, hashedbitinnovations@gmail.com<br>Website :- https://www.hashedbit.com/<br>LinkedIn :- https://www.linkedin.com/company/hashedbit-innovations/</p></div>`;
    
    await sendEmail( email, mailsubject, mailhtml);

    //console.log(response[0]);
    res.status(200).json(response[0]);
  } catch (err) {
    res.status(400).json({ message: err });
  }
});

// http://localhost:4000/career/updatecareer

router.put('/updatecareer', verifyJwt, async (req, res) => {
  try {
    const { name, email, mobile, whatsapp_mobile, city, hometown, college, university, passing_year, branch, linkedinid,
      githubid, referredby, currentcompany, yearsOfExperience, currentDesignation, noticePeriod, currentSalary, skills,
      dob, workLocation, typePartFull, typeFullIntern, jobType, uploadCV } = req.body;
    const response = await db.promise()
      .query(`update career set name='${name}',email='${email}',mobile='${mobile}',whatsapp_mobile='${whatsapp_mobile}',
    city='${city}',hometown='${hometown}',college='${college}',university='${university}',passing_year='${passing_year}',
    branch='${branch}',linkedinid='${linkedinid}',githubid='${githubid}',referredby='${referredby}',
    currentcompany='${currentcompany}',yearsOfExperience='${yearsOfExperience}',currentDesignation='${currentDesignation}',
    noticePeriod='${noticePeriod}',currentSalary='${currentSalary}',skills='${skills}',dob='${dob}',
    workLocation='${workLocation}',typePartFull='${typePartFull}',typeFullIntern='${typeFullIntern}',
    jobType='${jobType}',uploadCV='${uploadCV}'
    where srno = ${req.body.srno} `);
    res.status(200).json(response[0]);
  }
  catch (err) {
    res.status(400).json({ message: err });
  }
});







module.exports = router;
