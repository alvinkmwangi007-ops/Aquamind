// src/components/pages/Home.jsx
import { useState, useEffect } from "react";
import Header from "../Header";
import DailyLogForm from "../DailyLogForm";
import ProgressTracker from "../ProgressTracker";
import GoalSetting from "../GoalSetting";
import { fetchLogs, fetchGoal, createLog, setGoal, getLogs as getLogsLocalStorage, getGoal as getGoalLocalStorage } from "../../api";
import { useAuth } from "../../auth";

export default function Home() {
  const { user } = useAuth();
  const [current, setCurrent] = useState(0);
  const [goal, setGoalValue] = useState(2000);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadGoal = async () => {
      try {
        const goalData = await fetchGoal();
        setGoalValue(goalData.goalAmount || 2000);
      } catch (err) {
        console.error("Failed to fetch goal:", err);
        setGoalValue(getGoalLocalStorage());
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
        const allLogs = fetched.data || fetched;
        const today = new Date().toDateString();
        const todayTotal = allLogs
          .filter((log) => new Date(log.date || log.createdAt).toDateString() === today)
          .reduce((sum, log) => sum + (log.amount_ml || log.amount || 0), 0);
        setCurrent(todayTotal);
        setLogs(allLogs);
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

  const handleAddLog = async (amount) => {
    try {
      const newLog = await createLog(amount);
      setCurrent((prev) => prev + amount);
      setLogs((prev) => [newLog, ...prev]);
    } catch (err) {
      setError(err.message || "Could not add log.");
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleSetGoal = async (amount) => {
    try {
      const newGoal = await setGoal(amount);
      setGoalValue(newGoal.daily_target_ml || newGoal.goalAmount || amount);
    } catch (err) {
      setError(err.message || "Could not save goal.");
      setTimeout(() => setError(null), 5000);
    }
  };

  const goalPct = Math.min((current / goal) * 100, 100);
  const latestLogs = logs.slice(0, 5);

  return (
    <div className="app-container dashboard">
      <Header />
      {error && <div className="alert error-banner">{error}</div>}
      <section className={`hero-card card${user?.role === "admin" ? " admin-highlight" : ""}`}>
        <div className="hero-copy">
          <p className="eyebrow">Hydration dashboard</p>
          <h2>Stay on top of your daily water intake</h2>
          <p>Monitor goals, log new drinks quickly, and review your most recent hydration moments.</p>
          {user && (
            <div className="role-badge-row">
              <span className={`role-badge ${user.role === "admin" ? "admin" : "user"}`}>
                {user.role === "admin" ? "Admin view" : "Member view"}
              </span>
              <span className="role-caption">Signed in as {user.name}</span>
            </div>
          )}
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

      {user?.role === "admin" && (
        <section className="admin-panel card">
          <div className="summary-head">
            <div>
              <h3>Admin controls</h3>
              <p className="summary-copy">Only visible to administrators</p>
            </div>
            <span>Protected</span>
          </div>
          <div className="admin-panel-grid">
            <div>
              <h4>System overview</h4>
              <p>Monitor total hydration activity and manage higher-level goals for the app.</p>
            </div>
            <div>
              <h4>Access level</h4>
              <p>Admin users can review protected actions and manage the dashboard experience.</p>
            </div>
          </div>
        </section>
      )}

      <section className="dashboard-grid">
        <div className="summary-card card">
          <div className="summary-head">
            <div>
              <h3>Progress</h3>
              <p className="summary-copy">Daily goal completion</p>
            </div>
            <span>{Math.round(goalPct)}%</span>
          </div>
          <div className="progress status-progress">
            <div className="bar" style={{ width: `${goalPct}%` }} />
          </div>
          <p className="status-copy">{current} ml consumed so far. {Math.max(goal - current, 0)} ml left.</p>
        </div>

        <div className="summary-card card">
          <div className="summary-head">
            <h3>Quick Add</h3>
            <span>Log water</span>
          </div>
          <DailyLogForm onAdd={handleAddLog} />
        </div>

        <div className="summary-card card full-height">
          <div className="summary-head">
            <h3>Daily Goal</h3>
            <span>Update target</span>
          </div>
          <GoalSetting onSetGoal={handleSetGoal} />
        </div>

        <div className="summary-card card log-feed">
          <div className="summary-head">
            <h3>Recent Logs</h3>
            <span>{logs.length} entries</span>
          </div>
          <div className="log-list">
            {latestLogs.length === 0 ? (
              <p className="info-msg">No recent logs yet. Start by adding some water.</p>
            ) : (
              latestLogs.map((log, index) => (
                <div key={log.id || index} className="log-item">
                  <div>
                    <strong>{log.amount_ml || log.amount} ml</strong>
                    <p>{new Date(log.date || log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                  <span>{new Date(log.date || log.createdAt).toLocaleDateString()}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
