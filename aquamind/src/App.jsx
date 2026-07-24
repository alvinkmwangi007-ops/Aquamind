// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import History from "./pages/History";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/history" element={<History />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  );
}
