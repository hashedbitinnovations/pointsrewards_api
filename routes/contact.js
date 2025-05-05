const express = require('express');
const nodemailer = require("nodemailer");
require("dotenv").config();

const router = express.Router();

const db = require('../db');
const verifyJwt = require('../verify.js')


const sendEmail = async(email, mailsubject, mailhtml) => {

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
            name:"HashedBit Innovations",
            address: process.env.USER   // sender address
        }, 
        to: email, //  receiver address
        subject: mailsubject, // Subject line
        html: mailhtml,   // html body
      
      }
    try{
        
        await transporter.sendMail(mailOptions);
        console.log("Email has been sent Successfullly");
    }
    catch(error){
        console.log(error);
    }
  }

// http://localhost:4000/contact/alluser
router.get('/alluser', async(req,res) => {
    try{
        const response = await db.promise()
        .query(`select * from contact where isactive = 1`);
        res.status(200).json(response[0]);
    }
    catch(err){
        res.status(400).json({message: err});
    }
});

// http://localhost:4000/contact/register

router.post("/register", async(req,res) => {
    try{
        const {name,email,contact,subject,message} = req.body;
        const response = await db.promise().query(`insert into contact (name,email,contact,subject,message)
        values('${name}','${email}','${contact}','${subject}','${message}')`);
        let mailsubject = 'Response from HashedBit Innovations - Contact Form Submission';
        let mailhtml = `<div><p><b>Hi ${name} !</b><br>Thanks for contacting us.<br>We will connect back soon.<p><br><br><p>Thanks and Regards...<br><b>HashedBit Innovations</b><br>Contact :- 09669787936, 09599171535<br>Email :- info@hashedbit.com, hashedbitinnovations@gmail.com<br>Website :- https://www.hashedbit.com/<br>LinkedIn :- https://www.linkedin.com/company/hashedbit-innovations/</p></div>`;
        
        await sendEmail(email, mailsubject, mailhtml);

        res.status(200).json(response[0]);
        
    }
    catch(err){
        res.status(400).json({message: err});
    }
});
// http://localhost:4000/contact/updatecontact
router.put('/updatecontact', verifyJwt, async(req,res) => {
    try{
        //console.log(req.body.srno);
        const {name,email,contact,subject,message,responseStatus,responseMessage,responseNextStep,
        responseNextPerson,finalStatus}=req.body;
        const response = await db.promise()
        .query(`update contact set name='${name}',email='${email}',contact='${contact}',subject='${subject}',message='${message}',
        responseStatus='${responseStatus}',responseMessage='${responseMessage}',responseNextStep='${responseNextStep}',
        responseNextPerson='${responseNextPerson}',finalStatus='${finalStatus}'
        where  srno = ${req.body.srno}`);
        res.status(200).json(response[0]);
    }
    catch(err){
        res.status(400).json({message: err});
    }
});



module.exports = router;