// src/components/pages/Settings.jsx
import { useState, useEffect } from "react";
import Header from "../Header";
import GoalSetting from "../GoalSetting";
import { fetchGoal, setGoal, getGoal as getGoalLocalStorage } from "../../api";

export default function Settings() {
  const [goal, setGoalValue] = useState(2000);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadGoal = async () => {
      setLoading(true);
      setError(null);
      try {
        const goalData = await fetchGoal();
        setGoalValue(goalData.goalAmount || 2000);
      } catch (err) {
        console.error("Failed to fetch goal:", err);
        setError(err.message || "Failed to load goal");
        setGoalValue(getGoalLocalStorage());
      } finally {
        setLoading(false);
      }
    };
    loadGoal();
  }, []);

  const handleSetGoal = async (amount) => {
    try {
      const newGoal = await setGoal(amount);
      setGoalValue(newGoal.daily_target_ml || newGoal.goalAmount || amount);
    } catch (err) {
      setError(err.message || "Could not save goal.");
      setTimeout(() => setError(null), 5000);
    }
  };

  return (
    <div className="app-container page settings-page">
      <Header />
      <div className="page-header">
        <div>
          <p className="eyebrow">Settings</p>
          <h2>Customize your routine</h2>
          <p>Update your hydration goals and adjust your tracking preferences.</p>
        </div>
      </div>
      <div className="page-grid">
        <div className="stat-card card">
          <h3>Current Goal</h3>
          <p>{goal} ml</p>
        </div>
        <div className="stat-card card">
          <h3>Tip</h3>
          <p>Try increasing your target on active days, or keep it steady for rest days.</p>
        </div>
      </div>
      <div className="section">
        {error && <div className="alert error-banner">{error}</div>}
        {loading ? (
          <p className="loading-msg">Loading settings...</p>
        ) : (
          <GoalSetting onSetGoal={handleSetGoal} />
        )}
      </div>
    </div>
  );
}
