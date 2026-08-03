import { Link } from "react-router-dom";
import "../styles/Header.css";
import logo from "../assets/waterdrop.png";

export default function Header() {
  return (
    <header className="header">
      <div className="brand">
        <img src={logo} alt="AquaMind logo" className="logo" />
        <div>
          <p className="eyebrow">AquaMind</p>
          <h1>Hydration Tracker</h1>
        </div>
      </div>
      <nav>
        <Link to="/">Overview</Link>
        <Link to="/history">History</Link>
        <Link to="/settings">Settings</Link>
      </nav>
    </header>
  );
}
