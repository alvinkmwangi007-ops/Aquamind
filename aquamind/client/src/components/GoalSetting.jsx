// src/components/GoalSetting.jsx
import { useState } from "react";

export default function GoalSetting({ onSetGoal }) {
  const [goal, setGoal] = useState("");
  const [setAtInput, setSetAtInput] = useState(() => {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (goal) {
      const requestedTime = setAtInput ? new Date(setAtInput).toISOString() : new Date().toISOString();
      onSetGoal(Number(goal), requestedTime);
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
      <label className="goal-time-field">
        Goal set time
        <input
          type="datetime-local"
          value={setAtInput}
          onChange={(e) => setSetAtInput(e.target.value)}
        />
      </label>
      <p className="fine-print">Selected time: {new Date(setAtInput).toLocaleString()}</p>
      <button type="submit">Save Goal</button>
    </form>
  );
}