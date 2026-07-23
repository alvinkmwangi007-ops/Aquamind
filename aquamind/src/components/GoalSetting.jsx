// src/components/GoalSetting.jsx
import { useState } from "react";
import '../styles/GoalSetting.css';

export default function GoalSetting({ onSetGoal }) {
  const [goal, setGoal] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (goal) {
      onSetGoal(Number(goal));
      setGoal("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="goal-form card">
      <input
        type="number"
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
        placeholder="Set daily goal (ml)"
      />
      <button type="submit">Save Goal</button>
    </form>
  );
}