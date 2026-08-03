// All components consolidated into a single file
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logo from "./assets/waterdrop.png";
import {
  fetchLogs,
  createLog,
  updateLog,
  deleteLog,
  fetchGoal,
  setGoal,
  getLogs as getLogsLocalStorage,
  getGoal as getGoalLocalStorage,
} from "./api";
import { useAuth } from "./auth";

// ============================================================================
// Header Component
// ============================================================================
export function Header() {
  const { user, login, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
      setShowLogin(false);
      setUsername("");
      setPassword("");
    } catch (err) {
      alert(err.message || "Login failed");
    }
  };

  return (
    <header className="header">
      <div className="brand">
        <img src={logo} alt="AquaMind logo" className="logo" />
        <div>
          <p className="eyebrow">AquaMind</p>
          <h1>Hydration Dashboard</h1>
        </div>
      </div>
      <nav>
        <Link to="/">Overview</Link>
        <Link to="/history">History</Link>
        <Link to="/settings">Settings</Link>
      </nav>
      <div className="auth">
        {user ? (
          <>
            <span className="user">{user.username}</span>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <button className="ghost" onClick={() => setShowLogin((s) => !s)}>{showLogin ? "Close" : "Login"}</button>
            {showLogin && (
              <form className="login-form" onSubmit={handleLogin}>
                <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" />
                <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" type="password" />
                <button type="submit">Sign in</button>
              </form>
            )}
          </>
        )}
      </div>
    </header>
  );
}

// ============================================================================
// DailyLogForm Component
// ============================================================================
export function DailyLogForm({ onAdd, onError }) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount) return;
    if (!user) {
      const msg = "Please log in to add hydration logs.";
      if (onError) onError(msg);
      alert(msg);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newLog = await createLog(Number(amount));
      console.log("Added:", newLog);
      setAmount("");
      if (onAdd) onAdd(newLog);
    } catch (err) {
      const errorMsg = err.message || "Failed to add log";
      setError(errorMsg);
      if (onError) onError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="daily-form card">
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Enter water (ml)"
        disabled={loading}
      />
      <button type="submit" disabled={loading}>
        {loading ? "Adding..." : "Add"}
      </button>
      {error && <span className="error-msg">{error}</span>}
    </form>
  );
}

// ============================================================================
// GoalSetting Component
// ============================================================================
export function GoalSetting({ onSetGoal, onError }) {
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!goal) return;

    setLoading(true);
    setError(null);

    try {
      const newGoal = await setGoal(Number(goal));
      console.log("Goal set:", newGoal);
      setGoal("");
      if (onSetGoal) onSetGoal(newGoal);
    } catch (err) {
      const errorMsg = err.message || "Failed to set goal";
      setError(errorMsg);
      if (onError) onError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="goal-form card">
      <input
        type="number"
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
        placeholder="Set daily goal (ml)"
        disabled={loading}
      />
      <button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save Goal"}
      </button>
      {error && <span className="error-msg">{error}</span>}
    </form>
  );
}

// ============================================================================
// ProgressTracker Component
// ============================================================================
export function ProgressTracker({ current = 0, goal = 2000, loading = false }) {
  const percent = Math.min((current / goal) * 100, 100);

  if (loading) {
    return (
      <div className="progress card">
        <p className="loading-msg">Loading progress...</p>
      </div>
    );
  }

  return (
    <div className="progress card">
      <div className="bar" style={{ width: `${percent}%` }}></div>
      <p>{current} / {goal} ml</p>
    </div>
  );
}

// ============================================================================
// HistoryView Component
// ============================================================================
export function HistoryView({ history = [], loading = false, error = null, onDelete = null }) {
  const [deleting, setDeleting] = useState(null);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return;

    setDeleting(id);
    try {
      await deleteLog(id);
      if (onDelete) onDelete(id);
    } catch (err) {
      console.error("Failed to delete:", err);
      alert("Failed to delete entry");
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="history card">
        <p className="loading-msg">Loading history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="history card">
        <p className="error-msg">{error}</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="history card">
        <p className="info-msg">No history yet</p>
      </div>
    );
  }

  return (
    <div className="history card">
      {history.map((day) => (
        <div key={day.id || day.date} className="day">
          <div className="bar" style={{ height: `${day.amount / 20}px` }}></div>
          <p>{day.date || new Date(day.createdAt).toLocaleDateString()}</p>
          <p className="amount">{day.amount}ml</p>
          {onDelete && (
            <button
              className="delete-btn"
              onClick={() => handleDelete(day.id)}
              disabled={deleting === day.id}
            >
              {deleting === day.id ? "..." : "×"}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Pages
// ============================================================================

export function Home() {
  const [current, setCurrent] = useState(0);
  const [goal, setGoal] = useState(2000);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadGoal = async () => {
      try {
        const goalData = await fetchGoal();
        setGoal(goalData.goalAmount || 2000);
      } catch (err) {
        console.error("Failed to fetch goal:", err);
        setGoal(getGoalLocalStorage());
      }
    };
    loadGoal();
  }, []);

  useEffect(() => {
    const loadLogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetched = await fetchLogs();
        setLogs(fetched.data || fetched);
        const today = new Date().toDateString();
        const todayTotal = (fetched.data || fetched)
          .filter((log) => new Date(log.date || log.logged_at || log.createdAt).toDateString() === today)
          .reduce((sum, log) => sum + (log.amount_ml || log.amount || 0), 0);
        setCurrent(todayTotal);
      } catch (err) {
        console.error("Failed to fetch logs:", err);
        const localLogs = getLogsLocalStorage();
        const today = new Date().toDateString();
        const todayTotal = localLogs
          .filter((log) => new Date(log.date).toDateString() === today)
          .reduce((sum, log) => sum + log.amount, 0);
        setCurrent(todayTotal);
        setLogs(localLogs);
      } finally {
        setLoading(false);
      }
    };
    loadLogs();
  }, []);

  const handleAddLog = (newLog) => {
    setCurrent((prev) => prev + (newLog.amount_ml || newLog.amount || 0));
    setLogs((prev) => [newLog, ...prev]);
  };

  const handleSetGoal = (newGoal) => {
    setGoal(newGoal.daily_target_ml || newGoal.goalAmount || newGoal);
  };

  const handleError = (errorMsg) => {
    setError(errorMsg);
    setTimeout(() => setError(null), 5000);
  };

  const activeLogs = logs.slice(0, 5);
  const goalPct = Math.min((current / goal) * 100, 100);

  return (
    <div className="app-container dashboard">
      <Header />
      <section className="hero-card card">
        <div>
          <p className="eyebrow">Main Hydration Center</p>
          <h2>Daily Wellness Overview</h2>
          <p>Track your intake, stay hydrated, and hit your goal with a clean dashboard.</p>
        </div>
        <div className="hero-stats">
          <div>
            <span>Today</span>
            <strong>{current} ml</strong>
          </div>
          <div>
            <span>Goal</span>
            <strong>{goal} ml</strong>
          </div>
          <div>
            <span>Entries</span>
            <strong>{logs.length}</strong>
          </div>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="summary-card card">
          <div className="summary-head">
            <h3>Hydration Status</h3>
            <span>{Math.round(goalPct)}%</span>
          </div>
          <div className="progress status-progress">
            <div className="bar" style={{ width: `${goalPct}%` }}></div>
          </div>
          <p>{current} of {goal} ml consumed today.</p>
        </div>

        <div className="summary-card card">
          <h3>Quick Actions</h3>
          <DailyLogForm onAdd={handleAddLog} onError={handleError} />
        </div>

        <div className="summary-card card full-height">
          <h3>Goal Control</h3>
          <GoalSetting onSetGoal={handleSetGoal} onError={handleError} />
        </div>

        <div className="summary-card card log-feed">
          <div className="summary-head">
            <h3>Recent Log Entries</h3>
            <span>{logs.length} total</span>
          </div>
          <div className="log-list">
            {activeLogs.length === 0 ? (
              <p className="info-msg">No logs yet. Add your first sip.</p>
            ) : (
              activeLogs.map((log) => (
                <div key={log.id || log.logged_at || log.date} className="log-item">
                  <div>
                    <strong>{log.amount_ml || log.amount} ml</strong>
                    <p>{new Date(log.logged_at || log.date || log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <span>{new Date(log.logged_at || log.date || log.createdAt).toLocaleDateString()}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export function History() {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const logs = await fetchLogs();
        setHistoryData(logs);
      } catch (err) {
        console.error("Failed to fetch history:", err);
        setError(err.message || "Failed to load history");
        // Fallback to localStorage
        const localLogs = getLogsLocalStorage();
        setHistoryData(localLogs);
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, []);

  const handleDelete = (id) => {
    setHistoryData((prev) => prev.filter((log) => log.id !== id));
  };

  return (
    <div className="app-container">
      <Header />
      <h2>Hydration History</h2>
      {error && <div className="alert error-banner">{error}</div>}
      <HistoryView
        history={historyData}
        loading={loading}
        error={error}
        onDelete={handleDelete}
      />
    </div>
  );
}

export function Settings() {
  const [goal, setGoal] = useState(2000);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadGoal = async () => {
      setLoading(true);
      setError(null);
      try {
        const goalData = await fetchGoal();
        setGoal(goalData.goalAmount || 2000);
      } catch (err) {
        console.error("Failed to fetch goal:", err);
        setError(err.message || "Failed to load goal");
        // Fallback to localStorage
        setGoal(getGoalLocalStorage());
      } finally {
        setLoading(false);
      }
    };
    loadGoal();
  }, []);

  const handleSetGoal = (newGoal) => {
    setGoal(newGoal.goalAmount || newGoal);
  };

  const handleError = (errorMsg) => {
    setError(errorMsg);
    setTimeout(() => setError(null), 5000);
  };

  return (
    <div className="app-container">
      <Header />
      <h2>Settings</h2>
      {error && <div className="alert error-banner">{error}</div>}
      {loading ? (
        <p className="loading-msg">Loading settings...</p>
      ) : (
        <>
          <p>Current Daily Goal: {goal} ml</p>
          <GoalSetting onSetGoal={handleSetGoal} onError={handleError} />
        </>
      )}
      {/* Later: add reminder settings here */}
    </div>
  );
}
