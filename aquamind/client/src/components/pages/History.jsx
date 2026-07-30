// src/pages/History.jsx
import Header from "../components/Header";
import HistoryView from "../components/HistoryView";
import "../styles/App.css";

export default function History() {
  const historyData = [
    { date: "Jul 21", amount: 1200 },
    { date: "Jul 22", amount: 1500 },
    { date: "Jul 23", amount: 1800 },
  ];

  return (
    <div className="app-container">
      <Header />
      <h2>Hydration History</h2>
      <HistoryView history={historyData} />
    </div>
  );
}
