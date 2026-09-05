import { Link } from "react-router-dom";
import "../library-theme.css";

function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <span className="logo-icon">📚</span>
        <h2 className="logo-text">Library Admin</h2>
      </Link>

      <div className="nav-links">
        <Link to="/" className="nav-link">
          Dashboard
        </Link>
        <Link to="/scanner" className="nav-link">
          QR Scanner
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
