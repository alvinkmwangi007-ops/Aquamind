import { Link } from "react-router-dom";
import "../styles/Header.css";
import logo from "../assets/waterdrop.png";
import { useAuth } from "../auth";

export default function Header() {
  const { user, logout } = useAuth();

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
        {user ? (
          <button className="ghost" onClick={logout}>Logout</button>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </nav>
    </header>
  );
}
