const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test the Database Connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error("Database connection failed: ", err.message);
  } else {
    console.log("Successfully connected to MySQL database.");
    connection.release();
  }
});

// Import and use book routes
const bookRoutes = require("./routes/books")(pool);
app.use("/api/books", bookRoutes);

// Import and use transaction routes
const transactionRoutes = require("./routes/transactions")(pool);
app.use("/api/transactions", transactionRoutes);

// Test Route
app.get("/api/health", (req, res) => {
  res
    .status(200)
    .json({ message: "Backend server is active and routing correctly." });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
