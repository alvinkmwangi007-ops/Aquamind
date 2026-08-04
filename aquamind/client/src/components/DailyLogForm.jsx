// src/components/DailyLogForm.jsx
import { useState } from "react";
import '../styles/DailyLogForm.css';

export default function DailyLogForm({ onAdd }) {
  const [amount, setAmount] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (amount) {
      onAdd(Number(amount));
      setAmount("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="daily-form card">
      <input
        type="number"
        name="amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Enter water (ml)"
      />
      <button type="submit">Add</button>
    </form>
  );
}