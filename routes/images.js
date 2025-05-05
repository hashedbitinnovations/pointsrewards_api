const express = require("express");
const router = express.Router();
const path = require("path")
var multer = require('multer');
const db = require('../db');


const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { checkUserByEmail, checkUserByUsername } = require('../controllers/checkUser');
const checkUser = require('../controllers/checkUser');
const verifyJwt = require('../verify.js')
const verifyJwtAdmin = require('../verifyadmin.js')

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/")
  },
  filename: function (req, file, cb) {
    console.log('---------------file-------------', file)
    cb(null, file.fieldname + "-" + Date.now() + ".jpg")
  }
})
// Blog images storage configuration
var blogStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/blogimages/");
  },
  filename: function (req, file, cb) {
    console.log('---------------file-------------', file);
    cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  }
});

var upload = multer({
  storage: storage,
  limits: { fileSize: 1 * 1000 * 1000 },
  fileFilter: function (req, file, cb) {

    // Set the filetypes, it is optional 
    var filetypes = /jpeg|jpg|png/;
    var mimetype = filetypes.test(file.mimetype);

    var extname = filetypes.test(path.extname(
      file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }

    cb("Error: File upload only supports the "
      + "following filetypes - " + filetypes);
  }
  // mypic is the name of file attribute 
}).single("mypic");

var uploadBlog = multer({
  storage: blogStorage,
  limits: { fileSize: 1 * 10000 * 10000 },
  fileFilter: function (req, file, cb) {
    var filetypes = /jpeg|jpg|png/;
    var mimetype = filetypes.test(file.mimetype);
    var extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb("Error: File upload only supports the following filetypes - " + filetypes);
  }
}).single("blogpic");


// http://localhost:4000/images/uploadImage
router.post("/uploadImage", function (req, res, next) {

  // Error MiddleWare for multer file upload, so if any error occurs, the image would not be uploaded! 
  upload(req, res, function (err) {

    if (err) {
      // ERROR occurred (here it can be occurred due to uploading image of size greater than 1MB or uploading different file type) 
      console.log('err', err)
      res.send(err)
    }
    else {
      //fetch the path of uploaded image and store it in db
      console.log("Success, Image uploaded!")
      console.log('FileLocation', req.file.destination + req.file.filename);
      res.send("Success, Image uploaded!");
    }
  })
})

// To update image in database.
router.put('/uploadImage/blogimages/:postid', uploadBlog, function (req, res, next) {
  const postid = req.params.postid;
  console.log('Received postid:', postid);

  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const imagePath = req.file.destination + req.file.filename;
  console.log('FileLocation', imagePath);

  if (postid) {
    // Save image info to database
    const query = 'UPDATE posts SET featuredimage = ? WHERE postid = ?';
    db.query(query, [imagePath, postid], function (dbErr, result) {
      if (dbErr) {
        console.error('Error saving image to database:', dbErr);
        res.status(500).send('Error saving image to database');
      } else {
        console.log('Database update successful');
        res.send('Success, Blog image uploaded and saved in the database!');
      }
    });
  } else {
    res.send('Success, Blog image uploaded!');
  }
});

// http://localhost:4000/images/allimages
router.get('/allimages', verifyJwt, async (req, res) => {
  try {

    var fs = require('fs');
    var tempfiles = []

    fs.readdir(`${process.cwd()}/uploads/`, (err, files) => {
      if (err)
        console.log(err);
      else {
        console.log("\nCurrent directory filenames:");
        files.forEach(file => {

          tempfiles = [...tempfiles, file]
          //tempfiles.push(file);
          console.log(file);
        })

        console.log('tempfiles', tempfiles);
        res.status(200).json(tempfiles);
      }
    })
  }
  catch (err) {
    res.status(400).json({ message: err });
  }
});


module.exports = router;
