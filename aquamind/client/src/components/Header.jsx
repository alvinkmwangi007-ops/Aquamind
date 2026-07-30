import { Link } from "react-router-dom";
import "../styles/Header.css";
import logo from "../assets/waterdrop.png";

export default function Header() {
  return (
    <header className="header">
      <img src={logo} alt="AquaMind logo" className="logo" />
      <h1>AquaMind</h1>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/history">History</Link>
        <Link to="/settings">Settings</Link>
      </nav>
    </header>
  );
}
