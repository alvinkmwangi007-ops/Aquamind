// src/components/pages/Home.jsx
import { useState, useEffect } from "react";
import Header from "../Header";
import DailyLogForm from "../DailyLogForm";
import GoalSetting from "../GoalSetting";
import { fetchLogs, fetchGoal, createLog, setGoal, getLogs as getLogsLocalStorage, getGoalRecord, getGoalRecords } from "../../api";
import { useAuth } from "../../auth";

function toSafeDate(log) {
  const parsed = new Date(log?.logged_at || log?.date || log?.createdAt);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

export default function Home() {
  const { user, users = [] } = useAuth();
  const [current, setCurrent] = useState(0);
  const [goal, setGoalValue] = useState(2000);
  const [goalSetAt, setGoalSetAt] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadGoal = async () => {
      try {
        const goalData = await fetchGoal();
        setGoalValue(goalData.daily_target_ml || goalData.goalAmount || 2000);
        setGoalSetAt(goalData.set_at || null);
      } catch (err) {
        console.error("Failed to fetch goal:", err);
        const localGoal = getGoalRecord(user?.id);
        setGoalValue(localGoal.goalAmount);
        setGoalSetAt(localGoal.setAt);
      }
    };
    loadGoal();
  }, [user?.id]);

  useEffect(() => {
    const loadLogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetched = await fetchLogs();
        const allLogs = fetched.data || fetched;
        const today = new Date().toDateString();
        const todayTotal = allLogs
          .filter((log) => toSafeDate(log).toDateString() === today)
          .reduce((sum, log) => sum + (log.amount_ml || log.amount || 0), 0);
        setCurrent(todayTotal);
        setLogs(allLogs);
      } catch (err) {
        console.error("Failed to fetch logs:", err);
        const localLogs = getLogsLocalStorage();
        const today = new Date().toDateString();
        const todayTotal = localLogs
          .filter((log) => toSafeDate(log).toDateString() === today)
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

  const handleSetGoal = async (amount, requestedSetAt) => {
    try {
      const newGoal = await setGoal(amount, requestedSetAt);
      setGoalValue(newGoal.daily_target_ml || newGoal.goalAmount || amount);
      setGoalSetAt(newGoal.set_at || requestedSetAt || null);
    } catch (err) {
      setError(err.message || "Could not save goal.");
      setTimeout(() => setError(null), 5000);
    }
  };

  const goalPct = Math.min((current / goal) * 100, 100);
  const completedGoal = goal > 0 && current >= goal;
  const latestLogs = logs.slice(0, 5);
  const allLogs = getLogsLocalStorage();
  const goalRecords = getGoalRecords();
  const totalsByUserId = allLogs.reduce((acc, entry) => {
    const userId = Number(entry.user_id || 1);
    const amount = Number(entry.amount_ml || entry.amount || 0);
    acc[userId] = (acc[userId] || 0) + amount;
    return acc;
  }, {});
  const maxTotal = Math.max(1, ...Object.values(totalsByUserId));
  const userBarData = users.map((entry) => ({
    ...entry,
    total: totalsByUserId[entry.id] || 0,
    width: Math.round(((totalsByUserId[entry.id] || 0) / maxTotal) * 100),
    goalAmount: Number(goalRecords[String(entry.id)]?.goalAmount || 2000),
    goalSetAt: goalRecords[String(entry.id)]?.setAt || null,
  }));

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
              <span className="role-caption">Signed in as {user.name || user.username}</span>
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

      {completedGoal && (
        <section className="card congrats-card" role="status" aria-live="polite">
          <h3>Congratulations, {user?.name || user?.username || "Hydration Hero"}!</h3>
          <p>You reached your daily hydration target of {goal} ml.</p>
        </section>
      )}

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
          <div className="admin-users">
            <h4>Current users and hydration totals</h4>
            <div className="user-bars">
              {userBarData.map((entry) => (
                <div className="user-bar-row" key={entry.id}>
                  <div className="user-meta">
                    <strong>{entry.name || entry.username}</strong>
                    <span>{entry.role} · goal {entry.goalAmount} ml</span>
                    <span>
                      Set at: {entry.goalSetAt ? new Date(entry.goalSetAt).toLocaleString() : "Not set"}
                    </span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${entry.width}%` }} />
                  </div>
                  <span className="bar-value">{entry.total} ml</span>
                </div>
              ))}
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
          <p className="fine-print">Tip: Add the exact amount you drink each time to keep daily totals accurate.</p>
        </div>

        <div className="summary-card card full-height">
          <div className="summary-head">
            <h3>Daily Goal</h3>
            <span>Update target</span>
          </div>
          <div className="goal-bar-track" aria-label="Current goal intensity">
            <div className="goal-bar-fill" style={{ width: `${Math.min((goal / 4500) * 100, 100)}%` }} />
          </div>
          <p className="goal-bar-caption">Current target: {goal} ml</p>
          <p className="goal-time">Goal set time: {goalSetAt ? new Date(goalSetAt).toLocaleString() : "Not set yet"}</p>
          <GoalSetting onSetGoal={handleSetGoal} />
          <p className="fine-print">Fine-tune your target based on routine, weather, and activity intensity.</p>
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
                    <p>{toSafeDate(log).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                  <span>{toSafeDate(log).toLocaleDateString()}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
