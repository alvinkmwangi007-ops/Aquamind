// src/components/pages/History.jsx
import { useState, useEffect } from "react";
import Header from "../Header";
import { fetchLogs, getLogs as getLogsLocalStorage } from "../../api";
import { useAuth } from "../../auth";

function buildLastSevenDaySeries(logs, userId) {
  const now = new Date();
  const days = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    days.push({
      key: d.toDateString(),
      label: d.toLocaleDateString([], { weekday: "short" }),
      total: 0,
    });
  }

  const dayMap = Object.fromEntries(days.map((d) => [d.key, d]));
  logs
    .filter((entry) => Number(entry.user_id || 1) === userId)
    .forEach((entry) => {
      const key = new Date(entry.date || entry.createdAt).toDateString();
      if (dayMap[key]) {
        dayMap[key].total += Number(entry.amount_ml || entry.amount || 0);
      }
    });

  return days;
}

function LineGraph({ points, title }) {
  const max = Math.max(1, ...points.map((point) => point.total));
  const stepX = 240 / Math.max(points.length - 1, 1);
  const coords = points
    .map((point, index) => {
      const x = index * stepX;
      const y = 90 - (point.total / max) * 80;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="line-chart">
      <div className="line-chart-head">
        <h4>{title}</h4>
        <span>7 days</span>
      </div>
      <svg viewBox="0 0 240 100" role="img" aria-label={`${title} hydration trend`}>
        <polyline points={coords} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="line-chart-labels">
        {points.map((point) => (
          <span key={`${title}-${point.key}`}>{point.label}</span>
        ))}
      </div>
    </div>
  );
}

export default function History() {
  const { user, users = [] } = useAuth();
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchLogs();
        setHistoryData(response.data || response);
      } catch (err) {
        console.error("Failed to fetch history:", err);
        setError(err.message || "Failed to load history");
        setHistoryData(getLogsLocalStorage());
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, []);

  const normalizedHistory = historyData.map((item) => ({
    ...item,
    user_id: Number(item.user_id || user?.id || 1),
  }));
  const localLogs = getLogsLocalStorage();
  const graphSource = localLogs.length ? localLogs : normalizedHistory;
  const activeUsers = user?.role === "admin" ? users : users.filter((entry) => entry.id === user?.id);
  const total = graphSource.reduce((sum, item) => sum + (item.amount_ml || item.amount || 0), 0);
  const average = graphSource.length ? Math.round(total / graphSource.length) : 0;

  return (
    <div className="app-container page history-page">
      <Header />
      <div className="page-header">
        <div>
          <p className="eyebrow">History</p>
          <h2>Weekly Hydration Review</h2>
          <p>Track trends and keep your streak going with clear history visualizations.</p>
        </div>
      </div>
      <div className="page-grid">
        <div className="stat-card card">
          <h3>Total Logged</h3>
          <p>{total} ml</p>
        </div>
        <div className="stat-card card">
          <h3>Daily Average</h3>
          <p>{average} ml</p>
        </div>
      </div>
      <div className="section">
        {error && <div className="alert error-banner">{error}</div>}
        {loading ? (
          <p className="loading-msg">Loading history...</p>
        ) : (
          <div className="line-chart-grid">
            {activeUsers.map((entry) => (
              <div className="card" key={entry.id}>
                <LineGraph
                  title={`${entry.name} (${entry.role})`}
                  points={buildLastSevenDaySeries(graphSource, entry.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
