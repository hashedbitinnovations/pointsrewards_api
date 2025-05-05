const express = require("express");
const router = express.Router();
const db = require("../db");
const multer = require("multer");

const fs = require("fs");
const path = require("path");

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/portfolio");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

// Create portfolio
// http://localhost:4000/portfolio/createPortfolio
router.post("/createPortfolio", upload.single("image"), async (req, res) => {
  const { title, description, category, url, isactive } = req.body;
  let { name } = req.body;
  let image = req.file ? req.file.path : null;

  // Original name with spaces
  const originalName = name;

  // Remove spaces from the name for ID generation
  let modifiedName = originalName.replace(/\s+/g, "");

  // Ensure modifiedName is at least 5 characters long by padding it
  if (modifiedName.length < 5) {
    const characters = "abcdefghijklmnopqrstuvwxyz";
    while (modifiedName.length < 5) {
      const randomChar = characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
      modifiedName += randomChar;
    }
  }

  try {
    // Generate the unique ID
    const prefix = modifiedName.substring(0, 5).toLowerCase();
    let unique = false;
    let id;

    while (!unique) {
      const randomNum = Math.floor(10000 + Math.random() * 90000);
      id = prefix + randomNum;

      // Check for uniqueness in the database
      const [existing] = await db
        .promise()
        .query(
          "SELECT COUNT(*) as count FROM portfolio WHERE portfolio_id = ?",
          [id]
        );
      if (existing[0].count === 0) {
        unique = true;
      }
    }

    // Insert the new portfolio record into the database
    const query = `INSERT INTO portfolio (portfolio_id, title, name, description, category, image, url, isactive) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    await db
      .promise()
      .query(query, [
        id,
        title,
        originalName,
        description,
        category,
        image,
        url,
        isactive,
      ]);

    res
      .status(200)
      .json({ message: "Portfolio created successfully", portfolio_id: id });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update portfolio
// http://localhost:4000/portfolio/updatePortfolio/id
router.post(
  "/updatePortfolio/:id",
  upload.single("image"),
  async (req, res) => {
    const id = req.params.id;
    const { name, title, description, category, url, isactive } = req.body;
    const newImage = req.file ? req.file.path : null;

    try {
      // Fetch current image path from the database
      const [rows] = await db.promise().query(
        "SELECT image FROM portfolio WHERE portfolio_id = ?",
        [id]
      );

      if (rows.length === 0) {
        return res.status(400).json({
          error: "Portfolio not found",
        });
      }

      const currentImage = rows[0].image;

      // Use new image if provided; otherwise, keep the old image
      const image = newImage || currentImage;

      // Delete the old image if a new one is uploaded and different from the current one
      if (newImage && currentImage && currentImage !== newImage) {
        fs.unlink(path.resolve(currentImage), (err) => {
          if (err) {
            console.log("Error deleting old image:", err);
          }
        });
      }

      // Update the portfolio record
      const query = `
        UPDATE portfolio 
        SET title = ?, name = ?, description = ?, category = ?, image = ?, url = ?, isactive = ? 
        WHERE portfolio_id = ?`;

      await db.promise().query(query, [
        title,
        name,
        description,
        category,
        image,
        url,
        isactive,
        id,
      ]);

      res.status(200).json({ message: "Portfolio updated successfully!" });
    } catch (err) {
      console.error("Database error:", err);
      res.status(500).json({ error: "Database error" });
    }
  }
);


// Delete portfolio
// http://localhost:4000/portfolio/deletePortfolio
router.delete("/deletePortfolio", async (req, res) => {
  const { portfolio_id } = req.body;
  try {
    const query = `DELETE FROM portfolio WHERE portfolio_id = ?`;
    await db.promise().query(query, [portfolio_id]);
    res.status(200).json({ message: "Portfolio deleted successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all portfolios
// http://localhost:4000/portfolio/getAllPortfolio
router.get("/getAllPortfolio", async (req, res) => {
  try {
    const query = `SELECT * FROM portfolio WHERE isactive = 1`;
    const [rows] = await db.promise().query(query);
    res.status(200).json(rows);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all portfolios
// http://localhost:4000/portfolio/getPortfolio
router.get("/getPortfolio", async (req, res) => {
  try {
    const query = `SELECT * FROM portfolio WHERE category != 'learning_placement' AND isactive = 1`;
    const [rows] = await db.promise().query(query);
    res.status(200).json(rows);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get portfolio by ID
// http://localhost:4000/portfolio/getPortfolioFromID/portf10000
router.get("/getPortfolioFromID/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const query = `SELECT * FROM portfolio WHERE portfolio_id = ?`;
    const [rows] = await db.promise().query(query, [id]);
    if (rows.length > 0) {
      res.status(200).json(rows[0]);
    } else {
      res.status(404).json({ message: "Portfolio not found" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
