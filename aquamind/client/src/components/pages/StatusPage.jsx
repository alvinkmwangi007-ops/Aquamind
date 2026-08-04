import { Link } from "react-router-dom";

export default function StatusPage({ code = 404, title, message, actionText = "Go home", actionTo = "/" }) {
  return (
    <div className="app-container page status-page">
      <div className="status-card card">
        <p className="eyebrow">{code}</p>
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="status-actions">
          <Link to={actionTo} className="button-link">
            {actionText}
          </Link>
          {code === 401 && (
            <Link to="/login" className="button-link secondary">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
