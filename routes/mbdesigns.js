const express = require('express');
const nodemailer = require("nodemailer");
require("dotenv").config();

const router = express.Router();

const db = require('../db');

const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: process.env.USER,
      pass: process.env.PASSWORD
    },
  });

  const mailOptions = {
    from: {
        name:"HashedBit Innovations",
        address: process.env.USER
    }, // sender address
    to: "hashedbit@gmail.com", // list of receivers
    subject: "Response from HashedBit Innovations", // Subject line
    text: "Hi ! Thanks for contacting. We will connect soon.", // plain text body
    html: "<b>Hi ! Thanks for contacting. We will connect soon.</b>", // html body
  }

  const sendMail = async(transporter, mailOptions, email, mailsubject, mailhtml) => {
    try{
        mailOptions.to = email;
        mailOptions.subject = mailsubject;
        mailOptions.html = mailhtml;
        await transporter.sendMail(mailOptions);
        console.log("Email has been sent Successfullly");
    }
    catch(error){
        console.log(error);
    }
  }
// http://localhost:4000/mbdesigns/allcontact
router.get('/allcontact', async(req,res) => {
    try{
        const response = await db.promise()
        .query(`select * from mbdesigns`);
        res.status(200).json(response[0]);
    }
    catch(err){
        res.status(400).json({message: err});
    }
});

// http://localhost:4000/mbdesigns/contactus

router.post("/contactus", async(req,res) => {
    try{
        const {name,email,contact,subject,message,address} = req.body;
        console.log(req.body);
        const response = await db.promise().query(`insert into mbdesigns_contact (name,email,contact,subject,message,address)
        values('${name}','${email}','${contact}','${subject}','${message}','${address}')`);
        let mailsubject = 'Response from Manish Bansal Designs - Contact Form Submission';
        let mailhtml = `<div><p><b>Hi !</b><br>We have received a new contact form submission.<br>Name- ${name}<br>Email- ${email}<br>Contact- ${contact}<br>Subject- ${subject}<br>Message- ${message}<br>Address- ${address}</div>`;
        sendMail(transporter,mailOptions, email, mailsubject, mailhtml);

        res.status(200).json(response[0]);
        
    }
    catch(err){
        res.status(400).json({message: err});
    }
});


module.exports = router;