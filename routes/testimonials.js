const express=require('express');
const router=express.Router();
const multer=require('multer');
const db=require('../db');

const extractVideoId = (url) => {
  const videoId = url.split('v=')[1];
  if (!videoId) return null;
  const ampersandPosition = videoId.indexOf('&');
  return ampersandPosition !== -1 ? videoId.substring(0, ampersandPosition) : videoId;
};

router.get('/fetchtestimonialvideo', async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      'SELECT testimonial FROM testimonial WHERE category = ?',
      ['testimonialvideo']
    );
    
    const videos = rows.map(row => ({ videoId: extractVideoId(row.testimonial) }));

    res.status(200).json(videos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database error' });
  }
});
//http://localhost:4000/testimonials/allTestimonials
router.get("/allTestimonials", async (req, res) => {
  try {
    const query = `SELECT * FROM testimonial WHERE isactive = 1`;
    const [rows] = await db.promise().query(query);
    res.status(200).json(rows);
  } catch (err) {
    res.status(400).json({ message: err });
  }
});

const fs = require('fs');
const path = require('path');
// Fetch all testimonials 
// http://localhost:4000/testimonials/fetchalltestimonials
router.get('/fetchalltestimonials', async (req, res) => {

  try {
    const [rows] = await db.promise().query('SELECT * FROM testimonial WHERE isactive = 1');
    if (rows.length > 0) {
      res.status(200).json(rows);
    } else {
      res.status(404).json({ message: 'Testimonial not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database error' });
  }
});

//  Fetch testimonial by ID
// http://localhost:4000/testimonials/fetchtestimonials_byid/11
router.get('/fetchtestimonials_byid/:id', async (req, res) => {
  const testimonialid = req.params.id;

  try {
    const [rows] = await db.promise().query('SELECT * FROM testimonial WHERE isactive = 1 AND testimonialid = ?', [testimonialid]);
    if (rows.length > 0) {
      res.status(200).json(rows[0]);
    } else {
      res.status(404).json({ message: 'Testimonial not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database error' });
  }
});

// fetch testimonials by category
// http://localhost:4000/testimonials/fetchtestimonials_by_category/category
router.get('/fetchtestimonials_by_category/:category', async (req, res) => {
  const category = req.params.category;

  try {
    const [rows] = await db.promise().query('SELECT * FROM testimonial WHERE isactive = 1 AND category = ?', [category]);
    if (rows.length > 0) {
      res.status(200).json(rows);  // Return all rows
    } else {
      res.status(404).json({ message: 'Testimonial not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database error' });
  }
});

// fetch testimonials with limit value 
// http://localhost:4000/testimonials/fetchtestimonials_bycategory_limit/category
router.get('/fetchtestimonials_bycategory_limit/:category', async (req, res) => {
  const category = req.params.category;

  try {
    const [rows] = await db.promise().query(
      'SELECT * FROM testimonial WHERE isactive = 1 AND category = ? limit 6',
      [category]
    );
    res.status(200).json(rows);  // Return all rows, even if empty
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database error' });
  }
});

router.get('/fetchtestimonialvideo', async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      'SELECT testimonial FROM testimonial WHERE category = ?',
      ['testimonialvideo']
    );
    
    const videos = rows.map(row => ({ videoId: extractVideoId(row.testimonial) }));

    res.status(200).json(videos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database error' });
  }
});

// Utility function to get the next unique testimonial ID
const getNextUniqueTestimonialId = () => {
  return new Promise((resolve, reject) => {
    db.query('SELECT COALESCE(MAX(testimonialid), 100) AS maxId FROM testimonial', (err, results) => {
      if (err) {
        return reject(err);
      }
      let maxId = results[0].maxId;
      if (isNaN(maxId)) {
        maxId = 100; // Default starting ID if maxId is NaN
      }
      const newId = parseInt(maxId, 10) + 1; // Ensure newId is a number
      resolve(newId);
    });
  });
};


// set up multer for file uploads 
const storage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'uploads/testimonials');
    },
    filename:(req,file,cb)=>{
        cb(null,file.originalname);
    },
});

const upload=multer({storage});

// insert testimonials
// http://localhost:4000/testimonials/inserttestimonials
router.put('/inserttestimonials', upload.single('image'), async (req, res) => {
  const { name, name_bio, category, testimonial, isactive } = req.body;
  const image = req.file ? req.file.path : null;

  try {
    const testimonialid = await getNextUniqueTestimonialId();

    const query = `
      INSERT INTO testimonial (testimonialid, name, name_bio, category, image, testimonial, isactive)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(query, [testimonialid, name, name_bio, category, image, testimonial, isactive], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.status(200).json({ message: 'Testimonial inserted successfully!', testimonialid });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error generating unique testimonial ID' });
  }
});


// update testimonials 
// http://localhost:4000/testimonials/updatetestimonial/11
router.put('/updatetestimonial/:id', upload.single('image'), async (req, res) => {
  const testimonialid = req.params.id;
  const { name, name_bio, category, testimonial, isactive } = req.body;
  const newImage = req.file ? req.file.path : null;

  try {
    // Step 1: Fetch the current image from the database
    const [rows] = await db.promise().query('SELECT image FROM testimonial WHERE testimonialid = ?', [testimonialid]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }

    const currentImage = rows[0].image;

    // Step 2: Determine the image to use
    const image = newImage || currentImage;

    // Step 3: Delete the old image file if a new image is provided
    if (newImage && currentImage && currentImage !== newImage) {
      fs.unlink(path.resolve(currentImage), (err) => {
        if (err) {
          console.error('Error deleting old image:', err);
        }
      });
    }

    // Step 4: Update the testimonial record
    const query = `
      UPDATE testimonial
      SET name = ?, name_bio = ?, category = ?, image = ?, testimonial = ?, isactive = ?
      WHERE testimonialid = ?
    `;

    await db.promise().query(query, [name, name_bio, category, image, testimonial, isactive, testimonialid]);

    res.status(200).json({ message: 'Testimonial updated successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});


// delete testimonials
// http://localhost:4000/testimonials/deletetestimonial/12
router.delete('/deletetestimonial/:id',(req,res)=>{
  const testimonialid = req.params.id;

  const query = `
    DELETE FROM testimonial
    WHERE testimonialid = ?
  `;

  db.query(query, [testimonialid], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(200).json({ message: 'Testimonial deleted successfully!' });
  });
})
module.exports=router;
