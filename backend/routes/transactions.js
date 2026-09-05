const express = require("express");
const router = express.Router();

module.exports = (db) => {
  // POST: Issue a book using its QR Code
  router.post("/issue", (req, res) => {
    const { qr_code, borrower_name } = req.body;

    if (!qr_code || !borrower_name) {
      return res
        .status(400)
        .json({ error: "QR Code and Borrower Name are required." });
    }

    // 1. Verify the scanned book exists
    db.query(
      "SELECT * FROM books WHERE qr_code = ?",
      [qr_code],
      (err, bookResults) => {
        if (err)
          return res.status(500).json({ error: "Database query failed" });
        if (bookResults.length === 0)
          return res
            .status(404)
            .json({ error: "Invalid QR Code: Book not found" });

        const book = bookResults[0];

        // 2. Prevent issuing if already checked out
        if (book.available_copies <= 0) {
          return res
            .status(400)
            .json({ error: "Book is currently checked out." });
        }

        // 3. Update book availability
        db.query(
          "UPDATE books SET available_copies = available_copies - 1 WHERE book_id = ?",
          [book.book_id],
          (updateErr) => {
            if (updateErr)
              return res
                .status(500)
                .json({ error: "Failed to update book availability" });

            // 4. Record the issue transaction
            const transQuery = `INSERT INTO transactions (book_id, borrower_name, status) VALUES (?, ?, 'Issued')`;
            db.query(
              transQuery,
              [book.book_id, borrower_name],
              (transErr, transResults) => {
                if (transErr)
                  return res
                    .status(500)
                    .json({ error: "Failed to record transaction" });
                res.status(200).json({
                  message: "Book issued successfully",
                  transaction_id: transResults.insertId,
                });
              },
            );
          },
        );
      },
    );
  });

  // POST: Return a book using its QR Code
  router.post("/return", (req, res) => {
    const { qr_code } = req.body;

    if (!qr_code) {
      return res.status(400).json({ error: "QR Code is required." });
    }

    // 1. Verify the scanned book exists
    db.query(
      "SELECT * FROM books WHERE qr_code = ?",
      [qr_code],
      (err, bookResults) => {
        if (err)
          return res.status(500).json({ error: "Database query failed" });
        if (bookResults.length === 0)
          return res
            .status(404)
            .json({ error: "Invalid QR Code: Book not found" });

        const book = bookResults[0];

        // 2. Find the active "Issued" transaction for this specific book
        db.query(
          'SELECT * FROM transactions WHERE book_id = ? AND status = "Issued" ORDER BY issue_timestamp DESC LIMIT 1',
          [book.book_id],
          (transErr, transResults) => {
            if (transErr)
              return res.status(500).json({ error: "Database query failed" });
            if (transResults.length === 0)
              return res
                .status(400)
                .json({ error: "This book is not currently issued." });

            const transaction = transResults[0];

            // 3. Update book availability
            db.query(
              "UPDATE books SET available_copies = available_copies + 1 WHERE book_id = ?",
              [book.book_id],
              (updateErr) => {
                if (updateErr)
                  return res
                    .status(500)
                    .json({ error: "Failed to update book availability" });

                // 4. Update the transaction record with return timestamp
                db.query(
                  'UPDATE transactions SET return_timestamp = NOW(), status = "Returned" WHERE transaction_id = ?',
                  [transaction.transaction_id],
                  (returnErr) => {
                    if (returnErr)
                      return res.status(500).json({
                        error: "Failed to finalize return transaction",
                      });
                    res
                      .status(200)
                      .json({ message: "Book returned successfully" });
                  },
                );
              },
            );
          },
        );
      },
    );
  });

  // GET: Fetch all transaction history with book details
  router.get("/history", (req, res) => {
    const query = `
            SELECT 
                t.transaction_id, 
                b.title, 
                b.author, 
                b.isbn, 
                t.borrower_name, 
                t.issue_timestamp, 
                t.return_timestamp, 
                t.status
            FROM transactions t
            JOIN books b ON t.book_id = b.book_id
            ORDER BY t.issue_timestamp DESC
        `;

    db.query(query, (err, results) => {
      if (err)
        return res
          .status(500)
          .json({ error: "Failed to fetch transaction history" });
      res.status(200).json(results);
    });
  });

  return router;
};
