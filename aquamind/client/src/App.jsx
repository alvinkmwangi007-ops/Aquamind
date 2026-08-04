// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Home, History, Settings, Login } from "./components/index.jsx";
import StatusPage from "./components/pages/StatusPage";
import { useAuth } from "./auth";
import "./styles.css";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="app-container page"><p className="loading">Checking session…</p></div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<StatusPage code={401} title="Unauthorized" message="Please sign in to access this page." actionText="Back to login" actionTo="/login" />} />
        <Route path="/forbidden" element={<StatusPage code={403} title="Forbidden" message="You do not have permission to view this area." actionText="Back to home" actionTo="/" />} />
        <Route path="*" element={<StatusPage code={404} title="Page not found" message="The page you requested does not exist." />} />
      </Routes>
    </Router>
  );
}
