// API Service with CRUD operations using fetch + error handling
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// ============================================================================
// Hydration Logs CRUD
// ============================================================================

/**
 * Fetch all hydration logs
 */
export async function fetchLogs() {
  const response = await fetch(`${API_BASE_URL}/logs`);
  if (!response.ok) {
    throw new Error(`Failed to fetch logs: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Create a new hydration log entry
 */
export async function createLog(amount, date = new Date().toISOString()) {
  const response = await fetch(`${API_BASE_URL}/logs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount, date }),
  });
  if (!response.ok) {
    throw new Error(`Failed to create log: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Update an existing hydration log
 */
export async function updateLog(id, amount) {
  const response = await fetch(`${API_BASE_URL}/logs/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount }),
  });
  if (!response.ok) {
    throw new Error(`Failed to update log: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Delete a hydration log
 */
export async function deleteLog(id) {
  const response = await fetch(`${API_BASE_URL}/logs/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(`Failed to delete log: ${response.statusText}`);
  }
  return response.json();
}

// ============================================================================
// Goals CRUD
// ============================================================================

/**
 * Fetch user's hydration goal
 */
export async function fetchGoal() {
  const response = await fetch(`${API_BASE_URL}/goal`);
  if (!response.ok) {
    throw new Error(`Failed to fetch goal: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Create or update user's hydration goal
 */
export async function setGoal(goalAmount) {
  const response = await fetch(`${API_BASE_URL}/goal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ goalAmount }),
  });
  if (!response.ok) {
    throw new Error(`Failed to set goal: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Delete user's hydration goal
 */
export async function deleteGoal() {
  const response = await fetch(`${API_BASE_URL}/goal`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(`Failed to delete goal: ${response.statusText}`);
  }
  return response.json();
}

// ============================================================================
// Fallback: LocalStorage Functions (for offline mode)
// ============================================================================

/**
 * Save logs to localStorage as fallback
 */
export function saveLogs(logs) {
  localStorage.setItem("aquamind_logs", JSON.stringify(logs));
}

/**
 * Get logs from localStorage as fallback
 */
export function getLogs() {
  return JSON.parse(localStorage.getItem("aquamind_logs")) || [];
}

/**
 * Save goal to localStorage as fallback
 */
export function saveGoal(goal) {
  localStorage.setItem("aquamind_goal", JSON.stringify(goal));
}

/**
 * Get goal from localStorage as fallback
 */
export function getGoal() {
  return JSON.parse(localStorage.getItem("aquamind_goal")) || 2000;
}
