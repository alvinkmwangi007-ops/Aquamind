// src/App.jsx
import Header from "./components/Header";
import DailyLogForm from "./components/DailyLogForm";
import ProgressTracker from "./components/ProgressTracker";
import HistoryView from "./components/HistoryView";
import GoalSetting from "./components/GoalSetting";

export default function App() {
  return (
    <div>
      <Header />
      <DailyLogForm onAdd={(amount) => console.log("Added:", amount)} />
      <ProgressTracker current={500} goal={2000} />
      <HistoryView history={[{ date: "Jul 22", amount: 1500 }]} />
      <GoalSetting onSetGoal={(goal) => console.log("Goal:", goal)} />
    </div>
  );
}
