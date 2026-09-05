import { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import axios from "axios";
import "../library-theme.css";

function Scanner() {
  const [scanResult, setScanResult] = useState(null);
  const [action, setAction] = useState("issue");
  const [borrowerName, setBorrowerName] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", {
      qrbox: { width: 250, height: 250 },
      fps: 5,
    });

    scanner.render(
      (result) => {
        scanner.clear();
        setScanResult(result);
      },
      (error) => {},
    );

    return () => {
      scanner
        .clear()
        .catch((error) => console.error("Failed to clear scanner", error));
    };
  }, []);

  const handleTransaction = async () => {
    if (action === "issue" && !borrowerName) {
      setMessage("Please enter a borrower name to issue a book.");
      return;
    }

    try {
      const endpoint =
        action === "issue"
          ? "/api/transactions/issue"
          : "/api/transactions/return";
      const payload =
        action === "issue"
          ? { qr_code: scanResult, borrower_name: borrowerName }
          : { qr_code: scanResult };

      const response = await axios.post(
        `http://localhost:5000${endpoint}`,
        payload,
      );

      setMessage(response.data.message);
      setScanResult(null);
      setBorrowerName("");
    } catch (error) {
      setMessage(error.response?.data?.error || "Transaction failed.");
    }
  };

  return (
    <div className="scanner-container">
      <h2>Issue & Return Scanner</h2>

      {!scanResult ? (
        <div className="card" id="reader" style={{ marginTop: "20px" }}></div>
      ) : (
        <div className="card" style={{ marginTop: "20px" }}>
          <h3>Scanned Code:</h3>
          <p className="result-text">{scanResult}</p>

          <div className="radio-group">
            <label>
              <input
                type="radio"
                value="issue"
                checked={action === "issue"}
                onChange={() => setAction("issue")}
              />{" "}
              Issue Book
            </label>
            <label>
              <input
                type="radio"
                value="return"
                checked={action === "return"}
                onChange={() => setAction("return")}
              />{" "}
              Return Book
            </label>
          </div>

          {action === "issue" && (
            <div className="form-group" style={{ marginBottom: "20px" }}>
              <input
                type="text"
                className="input-field"
                placeholder="Borrower Name"
                value={borrowerName}
                onChange={(e) => setBorrowerName(e.target.value)}
              />
            </div>
          )}

          <div
            style={{ display: "flex", gap: "10px", justifyContent: "center" }}
          >
            <button onClick={handleTransaction} className="btn-primary">
              Submit Transaction
            </button>
            <button
              onClick={() => setScanResult(null)}
              className="btn-secondary"
            >
              Scan Again
            </button>
          </div>
        </div>
      )}

      {message && (
        <p style={{ marginTop: "20px", fontWeight: "bold", color: "#4f46e5" }}>
          {message}
        </p>
      )}
    </div>
  );
}

export default Scanner;
