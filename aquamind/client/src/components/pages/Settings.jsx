// src/pages/Settings.jsx
import Header from "../components/Header";
import GoalSetting from "../components/GoalSetting";
import "../styles/App.css";

export default function Settings() {
  return (
    <div className="app-container">
      <Header />
      <h2>Settings</h2>
      <GoalSetting onSetGoal={(goal) => console.log("New goal:", goal)} />
      {/* Later: add reminder settings here */}
    </div>
  );
}
