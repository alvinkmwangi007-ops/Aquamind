import { Link } from "react-router-dom";
import logo from "../assets/waterdrop.png";
import { useAuth } from "../auth";

function NavIcon({ children }) {
  return (
    <span className="nav-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" focusable="false">
        {children}
      </svg>
    </span>
  );
}

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
        <Link to="/" className="nav-link nav-icon-only" aria-label="Overview" title="Overview">
          <NavIcon>
            <path d="M3 11.5 12 4l9 7.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6.5 10.5V20h11V10.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </NavIcon>
        </Link>
        <Link to="/history" className="nav-link nav-icon-only" aria-label="History" title="History">
          <NavIcon>
            <path d="M4 18h16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M6 16V9m6 7V6m6 10v-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </NavIcon>
        </Link>
        <Link to="/settings" className="nav-link nav-icon-only" aria-label="Settings" title="Settings">
          <NavIcon>
            <path d="M12 9.25a2.75 2.75 0 1 1 0 5.5 2.75 2.75 0 0 1 0-5.5Z" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="m19 12-1.2.5a6 6 0 0 1-.3 1l.8 1a1 1 0 0 1-.1 1.3l-1.1 1.1a1 1 0 0 1-1.3.1l-1-.8a6 6 0 0 1-1 .3L12 19l-1.5-.4a6 6 0 0 1-1-.3l-1 .8a1 1 0 0 1-1.3-.1L6 17.9a1 1 0 0 1-.1-1.3l.8-1a6 6 0 0 1-.3-1L5 12l.4-1.5a6 6 0 0 1 .3-1l-.8-1a1 1 0 0 1 .1-1.3L6.1 6a1 1 0 0 1 1.3-.1l1 .8a6 6 0 0 1 1-.3L12 5l1.5.4a6 6 0 0 1 1 .3l1-.8a1 1 0 0 1 1.3.1l1.1 1.1a1 1 0 0 1 .1 1.3l-.8 1a6 6 0 0 1 .3 1L19 12Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </NavIcon>
        </Link>
        {user ? (
          <button className="ghost" onClick={logout}>Logout</button>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </nav>
    </header>
  );
}
