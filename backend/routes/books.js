const express = require("express");
const router = express.Router();

module.exports = (db) => {
  // POST route to add a new book
  router.post("/add", (req, res) => {
    const { title, author, isbn, category, total_copies } = req.body;

    // Generate a unique string for the QR code using the ISBN and current timestamp
    const qr_code = `QR_${isbn}_${Date.now()}`;

    // SQL query to insert the book record
    const query = `INSERT INTO books (title, author, isbn, category, total_copies, available_copies, qr_code) VALUES (?, ?, ?, ?, ?, ?, ?)`;

    // Execute the query
    db.query(
      query,
      [title, author, isbn, category, total_copies, total_copies, qr_code],
      (err, results) => {
        if (err) {
          console.error("Error inserting book:", err);
          return res.status(500).json({ error: "Database insertion failed" });
        }
        res.status(201).json({
          message: "Book added successfully",
          book_id: results.insertId,
          qr_code,
        });
      },
    );
  });

  // GET route to fetch all books
  router.get("/all", (req, res) => {
    db.query("SELECT * FROM books", (err, results) => {
      if (err) {
        console.error("Error fetching books:", err);
        return res.status(500).json({ error: "Database query failed" });
      }
      res.status(200).json(results);
    });
  });

  return router;
};
