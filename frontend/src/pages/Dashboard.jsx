import { useState, useEffect } from "react";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";
import "../library-theme.css";

function Dashboard() {
  const [books, setBooks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    category: "",
    total_copies: 1,
  });

  const fetchBooks = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/books/all");
      setBooks(response.data);
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/transactions/history",
      );
      setTransactions(response.data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  useEffect(() => {
    fetchBooks();
    fetchTransactions();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/books/add", formData);
      alert("Book added successfully!");
      fetchBooks();
      setFormData({
        title: "",
        author: "",
        isbn: "",
        category: "",
        total_copies: 1,
      });
    } catch (error) {
      console.error("Error adding book:", error);
      alert("Failed to add book. Ensure the ISBN is unique.");
    }
  };

  return (
    <div className="page-container">
      <div className="dashboard-grid">
        <div className="card">
          <h3>Add New Book</h3>
          <form onSubmit={handleSubmit} className="form-group">
            <input
              type="text"
              name="title"
              className="input-field"
              placeholder="Book Title"
              value={formData.title}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="author"
              className="input-field"
              placeholder="Author"
              value={formData.author}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="isbn"
              className="input-field"
              placeholder="ISBN (Unique ID)"
              value={formData.isbn}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="category"
              className="input-field"
              placeholder="Category"
              value={formData.category}
              onChange={handleChange}
              required
            />
            <label style={{ fontWeight: 500, fontSize: "14px" }}>
              Total Copies:
            </label>
            <input
              type="number"
              name="total_copies"
              className="input-field"
              min="1"
              value={formData.total_copies}
              onChange={handleChange}
              required
            />
            <button type="submit" className="btn-primary">
              Add Book
            </button>
          </form>
        </div>

        <div className="card card-wide">
          <h3>Current Inventory</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Available</th>
                <th>QR Code</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book.book_id}>
                  <td>{book.title}</td>
                  <td>{book.author}</td>
                  <td style={{ fontWeight: "bold" }}>
                    {book.available_copies} / {book.total_copies}
                  </td>
                  <td>
                    <QRCodeCanvas value={book.qr_code} size={50} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h3>Transaction History</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Book Title</th>
              <th>Borrower</th>
              <th>Issue Date</th>
              <th>Return Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((txn) => (
              <tr key={txn.transaction_id}>
                <td>{txn.title}</td>
                <td>{txn.borrower_name}</td>
                <td>{new Date(txn.issue_timestamp).toLocaleDateString()}</td>
                <td>
                  {txn.return_timestamp
                    ? new Date(txn.return_timestamp).toLocaleDateString()
                    : "-"}
                </td>
                <td>
                  <span
                    className={
                      txn.status === "Issued"
                        ? "badge-issued"
                        : "badge-returned"
                    }
                  >
                    {txn.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {transactions.length === 0 && (
          <p style={{ marginTop: "20px", color: "gray" }}>
            No transaction history available.
          </p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
