// src/components/pages/History.jsx
import { useState, useEffect } from "react";
import Header from "../Header";
import { deleteLog, fetchLogs, getLogs as getLogsLocalStorage, updateLog } from "../../api";
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
  const ticks = [max, Math.round(max / 2), 0];
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
      <div className="line-chart-body">
        <div className="y-scale" aria-hidden="true">
          {ticks.map((tick) => (
            <span key={`${title}-tick-${tick}`}>{tick} ml</span>
          ))}
        </div>
        <svg viewBox="0 0 240 100" role="img" aria-label={`${title} hydration trend`}>
          <polyline points={coords} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
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
  const [editingId, setEditingId] = useState(null);
  const [editAmount, setEditAmount] = useState("");
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
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

  const beginEdit = (entry) => {
    setEditingId(entry.id);
    setEditAmount(String(entry.amount_ml || entry.amount || ""));
    setError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditAmount("");
  };

  const saveEdit = async (entryId) => {
    const parsed = Number(editAmount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError("Amount must be a positive number.");
      return;
    }

    setSavingId(entryId);
    setError(null);
    try {
      const updated = await updateLog(entryId, parsed);
      setHistoryData((prev) => prev.map((entry) => (entry.id === entryId ? updated : entry)));
      cancelEdit();
    } catch (err) {
      setError(err.message || "Failed to update log entry.");
    } finally {
      setSavingId(null);
    }
  };

  const removeEntry = async (entryId) => {
    setDeletingId(entryId);
    setError(null);
    try {
      await deleteLog(entryId);
      setHistoryData((prev) => prev.filter((entry) => entry.id !== entryId));
    } catch (err) {
      setError(err.message || "Failed to delete log entry.");
    } finally {
      setDeletingId(null);
    }
  };

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
          <div className="line-chart-grid" style={{ gap: 16 }}>
            <div className="card">
              <h3 style={{ marginTop: 0 }}>Log Entries</h3>
              {normalizedHistory.length === 0 ? (
                <p className="info-msg">No hydration entries yet.</p>
              ) : (
                normalizedHistory.map((entry) => {
                  const isEditing = editingId === entry.id;
                  return (
                    <div key={entry.id} className="log-item" style={{ alignItems: "center" }}>
                      <div>
                        <strong>{entry.amount_ml || entry.amount} ml</strong>
                        <p>{new Date(entry.logged_at || entry.date || entry.createdAt).toLocaleString()}</p>
                      </div>
                      {isEditing ? (
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <input
                            type="number"
                            min="1"
                            value={editAmount}
                            onChange={(e) => setEditAmount(e.target.value)}
                            style={{ width: 100 }}
                          />
                          <button type="button" className="ghost" onClick={() => saveEdit(entry.id)} disabled={savingId === entry.id}>
                            {savingId === entry.id ? "Saving..." : "Save"}
                          </button>
                          <button type="button" className="ghost" onClick={cancelEdit}>
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: "flex", gap: 8 }}>
                          <button type="button" className="ghost" onClick={() => beginEdit(entry)}>
                            Edit
                          </button>
                          <button type="button" className="ghost" onClick={() => removeEntry(entry.id)} disabled={deletingId === entry.id}>
                            {deletingId === entry.id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
            {activeUsers.map((entry) => (
              <div className="card" key={entry.id}>
                <LineGraph
                  title={`${entry.name || entry.username} (${entry.role})`}
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
