// src/components/HistoryView.jsx
export default function HistoryView({ history }) {
  return (
    <div className="history card">
      {history.map((day, i) => (
        <div key={i} className="day">
          <div className="bar" style={{ height: `${day.amount / 20}px` }}></div>
          <p>{day.date}</p>
        </div>
      ))}
    </div>
  );
}