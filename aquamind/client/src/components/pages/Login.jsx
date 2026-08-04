import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Header from "../Header";
import { useAuth } from "../../auth";

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password, rememberMe);
      navigate("/");
    } catch (err) {
      setError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="app-container page login-page">
      <Header />
      <div className="page-header">
        <div>
          <p className="eyebrow">Login</p>
          <h2>Sign in to AquaMind</h2>
          <p>Use the demo accounts below to explore different roles and plan tiers.</p>
        </div>
      </div>
      <div className="login-card card">
        {error && <div className="alert error-banner">{error}</div>}
        <form onSubmit={handleSubmit} className="login-form">
          <label>
            Email
            <input
              id="login-email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
            />
          </label>
          <label>
            Password
            <input
              id="login-password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="admin123"
              required
            />
          </label>
          <label className="remember-me">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <span>Remember me</span>
          </label>
          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <div className="login-help">
          <p>Demo accounts:</p>
          <ul>
            <li><strong>Admin:</strong> admin@example.com / admin123</li>
            <li><strong>Manager:</strong> manager@example.com / manager123</li>
            <li><strong>Coach:</strong> coach@example.com / coach123</li>
            <li><strong>User:</strong> user@example.com / user123</li>
          </ul>
        </div>
        <p className="copyright">© 2026 AquaMind</p>
      </div>
    </div>
  );
}
