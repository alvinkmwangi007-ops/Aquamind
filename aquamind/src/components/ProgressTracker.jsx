// src/components/ProgressTracker.jsx
import '../styles/ProgressTracker.css';

export default function ProgressTracker({ current, goal }) {
  const percent = Math.min((current / goal) * 100, 100);

  return (
    <div className="progress card">
      <div className="bar" style={{ width: `${percent}%` }}></div>
      <p>{current} / {goal} ml</p>
    </div>
  );
}
