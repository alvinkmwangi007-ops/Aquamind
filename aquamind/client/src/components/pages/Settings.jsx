// src/components/pages/Settings.jsx
import { useState, useEffect } from "react";
import Header from "../Header";
import GoalSetting from "../GoalSetting";
import { fetchGoal, setGoal, getGoal as getGoalLocalStorage } from "../../api";
import { useAuth } from "../../auth";

export default function Settings() {
  const { user } = useAuth();
  const [goal, setGoalValue] = useState(2000);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState({
    reminderWindow: "every-2-hours",
    activityLevel: "moderate",
    weatherMode: "auto",
  });

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

  const applyPreset = (amount) => {
    handleSetGoal(amount);
  };

  const updateProfile = (key, value) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
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
          <div className="goal-bar-track" aria-label="Current goal bar graph">
            <div className="goal-bar-fill" style={{ width: `${Math.min((goal / 4500) * 100, 100)}%` }} />
          </div>
          <small className="fine-print">This bar shows how ambitious your daily target is compared to 4500 ml.</small>
        </div>
        <div className="stat-card card">
          <h3>Active Profile</h3>
          <p>{user?.name || "Member"} · {user?.plan || "free"} plan</p>
          <small className="fine-print">Adjust profile controls below and save your goal to keep routine settings aligned.</small>
        </div>
      </div>
      <div className="section">
        {error && <div className="alert error-banner">{error}</div>}
        {loading ? (
          <p className="loading-msg">Loading settings...</p>
        ) : (
          <div className="settings-stack">
            <div className="card">
              <h3>Goal presets</h3>
              <div className="preset-row">
                {[1800, 2200, 2800, 3200].map((value) => (
                  <button key={value} type="button" className="ghost" onClick={() => applyPreset(value)}>
                    {value} ml
                  </button>
                ))}
              </div>
              <GoalSetting onSetGoal={handleSetGoal} />
            </div>

            <div className="card">
              <h3>Routine preferences</h3>
              <div className="settings-controls">
                <label>
                  Reminder frequency
                  <select value={profile.reminderWindow} onChange={(e) => updateProfile("reminderWindow", e.target.value)}>
                    <option value="hourly">Hourly</option>
                    <option value="every-2-hours">Every 2 hours</option>
                    <option value="every-3-hours">Every 3 hours</option>
                  </select>
                </label>
                <label>
                  Activity level
                  <select value={profile.activityLevel} onChange={(e) => updateProfile("activityLevel", e.target.value)}>
                    <option value="low">Low</option>
                    <option value="moderate">Moderate</option>
                    <option value="high">High</option>
                  </select>
                </label>
                <label>
                  Weather mode
                  <select value={profile.weatherMode} onChange={(e) => updateProfile("weatherMode", e.target.value)}>
                    <option value="auto">Auto adjust</option>
                    <option value="manual">Manual</option>
                  </select>
                </label>
              </div>
              <p className="fine-print">These controls help tailor reminders and target guidance to your day.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
