// src/pages/Home.jsx
import Header from "../components/Header";
import DailyLogForm from "../components/DailyLogForm";
import ProgressTracker from "../components/ProgressTracker";
import GoalSetting from "../components/GoalSetting";
import "../styles/App.css";

export default function Home() {
  return (
    <div className="app-container">
      <Header />
      <div className="section flex-row">
        <DailyLogForm onAdd={(amount) => console.log("Added:", amount)} />
        <GoalSetting onSetGoal={(goal) => console.log("Goal:", goal)} />
      </div>
      <ProgressTracker current={500} goal={2000} />
    </div>
  );
}
