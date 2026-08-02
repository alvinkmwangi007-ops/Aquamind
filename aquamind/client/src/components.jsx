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
  login,
  currentUser,
  clearToken,
  getToken,
} from "./api";

// ============================================================================
// Header Component
// ============================================================================
export function Header() {
  const [showLogin, setShowLogin] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        if (getToken()) {
          const u = await currentUser();
          setUser(u);
        }
      } catch (err) {
        console.warn("No current user", err);
        setUser(null);
      }
    };
    loadUser();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await login(username, password);
      if (res.user) setUser(res.user);
      setShowLogin(false);
      setUsername("");
      setPassword("");
    } catch (err) {
      alert(err.message || "Login failed");
    }
  };

  const handleLogout = () => {
    clearToken();
    setUser(null);
  };

  return (
    <header className="header">
      <img src={logo} alt="AquaMind logo" className="logo" />
      <h1>AquaMind</h1>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/history">History</Link>
        <Link to="/settings">Settings</Link>
      </nav>
      <div className="auth">
        {user ? (
          <>
            <span className="user">{user.username}</span>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <button onClick={() => setShowLogin((s) => !s)}>{showLogin ? "Close" : "Login"}</button>
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount) return;

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch goal on mount
  useEffect(() => {
    const loadGoal = async () => {
      try {
        const goalData = await fetchGoal();
        setGoal(goalData.goalAmount || 2000);
      } catch (err) {
        console.error("Failed to fetch goal:", err);
        // Fallback to localStorage
        setGoal(getGoalLocalStorage());
      }
    };
    loadGoal();
  }, []);

  // Fetch logs on mount
  useEffect(() => {
    const loadLogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const logs = await fetchLogs();
        const today = new Date().toDateString();
        const todayTotal = logs
          .filter((log) => new Date(log.date || log.createdAt).toDateString() === today)
          .reduce((sum, log) => sum + log.amount, 0);
        setCurrent(todayTotal);
      } catch (err) {
        console.error("Failed to fetch logs:", err);
        // Fallback to localStorage
        const localLogs = getLogsLocalStorage();
        const today = new Date().toDateString();
        const todayTotal = localLogs
          .filter((log) => new Date(log.date).toDateString() === today)
          .reduce((sum, log) => sum + log.amount, 0);
        setCurrent(todayTotal);
      } finally {
        setLoading(false);
      }
    };
    loadLogs();
  }, []);

  const handleAddLog = (newLog) => {
    setCurrent((prev) => prev + newLog.amount);
  };

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
      {error && <div className="alert error-banner">{error}</div>}
      <div className="section flex-row">
        <DailyLogForm onAdd={handleAddLog} onError={handleError} />
        <GoalSetting onSetGoal={handleSetGoal} onError={handleError} />
      </div>
      <ProgressTracker current={current} goal={goal} loading={loading} />
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
