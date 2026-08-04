// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Home, History, Settings, Login } from "./components/index.jsx";
import "./styles.css";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/history" element={<History />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}
