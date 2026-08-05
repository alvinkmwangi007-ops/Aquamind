import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Header from "../Header";
import { useAuth } from "../../auth";

export default function Login() {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await login(identifier, password, rememberMe);
      navigate("/");
    } catch {
      setError("Login failed. Check your credentials and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await register(regUsername.trim(), regEmail.trim(), regPassword);
      setSuccess("Account created. You can sign in now.");
      setRegistering(false);
      setIdentifier(regUsername.trim());
      setPassword("");
      setRegUsername("");
      setRegEmail("");
      setRegPassword("");
    } catch {
      setError("Registration failed. Please verify your details and try again.");
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
          <p>Enter your account credentials to continue.</p>
        </div>
      </div>
      <div className="login-card card">
        {error && <div className="alert error-banner">{error}</div>}
        {success && <div className="alert">{success}</div>}
        <div className="role-badge-row" style={{ marginBottom: 12 }}>
          <button type="button" className={!registering ? "ghost" : ""} onClick={() => setRegistering(false)}>
            Sign In
          </button>
          <button type="button" className={registering ? "ghost" : ""} onClick={() => setRegistering(true)}>
            Register
          </button>
        </div>

        {!registering ? (
        <form onSubmit={handleSubmit} className="login-form">
          <label>
            Username or Email
            <input
              id="login-identifier"
              name="identifier"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="username or email"
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
              placeholder="Your password"
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
        ) : (
          <form onSubmit={handleRegister} className="login-form">
            <label>
              Username
              <input
                id="register-username"
                name="username"
                type="text"
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                placeholder="your_username"
                required
              />
            </label>
            <label>
              Email
              <input
                id="register-email"
                name="email"
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </label>
            <label>
              Password
              <input
                id="register-password"
                name="password"
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="Create a password"
                minLength={6}
                required
              />
            </label>
            <button type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>
        )}
        <p className="copyright">© 2026 AquaMind</p>
      </div>
    </div>
  );
}
