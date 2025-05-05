// controllers/userController.js

const db = require('../db');

async function checkUserByEmail(email) {
  try {
    const [rows] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);
    return rows.length > 0;
  } catch (err) {
    // console.log("Error in checkUserByEmail...", err)
  }
}

async function checkUserByUsername(username) {
    try {
      const [rows] = await db.promise().query('SELECT * FROM users WHERE username = ?', [username]);
      return rows.length > 0;
    } catch (err) {
      // console.log("Error in checkUserByUsername...", err)
    }
  }

module.exports = { checkUserByEmail, checkUserByUsername };
