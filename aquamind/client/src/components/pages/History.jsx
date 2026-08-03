// src/components/pages/History.jsx
import { useState, useEffect } from "react";
import Header from "../Header";
import HistoryView from "../HistoryView";
import { fetchLogs, getLogs as getLogsLocalStorage } from "../../api";

export default function History() {
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

  const total = historyData.reduce((sum, item) => sum + (item.amount_ml || item.amount || 0), 0);
  const average = historyData.length ? Math.round(total / historyData.length) : 0;

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
        <HistoryView history={historyData} loading={loading} />
      </div>
    </div>
  );
}
