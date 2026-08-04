// API Service with CRUD operations using fetch + error handling
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://aquamind-3.onrender.com/api";

function getStoredUserId() {
  const stored = localStorage.getItem("aquamind_user");
  if (!stored) return null;
  try {
    return JSON.parse(stored)?.id || null;
  } catch {
    return null;
  }
}

// Auth helpers (store token in localStorage)
export function setToken(token) {
  localStorage.setItem("aquamind_token", token);
}

export function getToken() {
  return localStorage.getItem("aquamind_token");
}

export function clearToken() {
  localStorage.removeItem("aquamind_token");
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function asPaginated(items, page, perPage) {
  return {
    data: items,
    total: items.length,
    page,
    per_page: perPage,
    total_pages: 1,
  };
}

// ============================================================================
// Hydration Logs CRUD
// ============================================================================

/**
 * Fetch all hydration logs
 */
export async function fetchLogs(page = 1, per_page = 20) {
  const qs = `?page=${page}&per_page=${per_page}`;
  try {
    const response = await fetch(`${API_BASE_URL}/logs${qs}`, {
      headers: { ...authHeaders() },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch logs: ${response.statusText}`);
    }
    return response.json();
  } catch {
    return asPaginated(getLogs(), page, per_page);
  }
}

/**
 * Create a new hydration log entry
 */
export async function createLog(amount, date = new Date().toISOString()) {
  try {
    const response = await fetch(`${API_BASE_URL}/logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ amount_ml: amount, user_id: getStoredUserId() || 1 }),
    });
    if (!response.ok) {
      throw new Error(`Failed to create log: ${response.statusText}`);
    }
    return response.json();
  } catch {
    const localLog = {
      id: Date.now(),
      amount,
      amount_ml: amount,
      date,
      createdAt: date,
      user_id: getStoredUserId() || 1,
    };
    const existing = getLogs();
    saveLogs([localLog, ...existing]);
    return localLog;
  }
}

/**
 * Update an existing hydration log
 */
export async function updateLog(id, amount) {
  const response = await fetch(`${API_BASE_URL}/logs/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ amount_ml: amount }),
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
    headers: { ...authHeaders() },
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
  try {
    const response = await fetch(`${API_BASE_URL}/goals`, { headers: { ...authHeaders() } });
    if (!response.ok) {
      throw new Error(`Failed to fetch goal: ${response.statusText}`);
    }
    return response.json();
  } catch {
    return { goalAmount: getGoal(), daily_target_ml: getGoal() };
  }
}

/**
 * Create or update user's hydration goal
 */
export async function setGoal(goalAmount) {
  try {
    const response = await fetch(`${API_BASE_URL}/goals`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ daily_target_ml: goalAmount }),
    });
    if (!response.ok) {
      throw new Error(`Failed to set goal: ${response.statusText}`);
    }
    return response.json();
  } catch {
    saveGoal(goalAmount);
    return { goalAmount, daily_target_ml: goalAmount };
  }
}

/**
 * Delete user's hydration goal
 */
export async function deleteGoal() {
  const response = await fetch(`${API_BASE_URL}/goals`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  });
  if (!response.ok) {
    throw new Error(`Failed to delete goal: ${response.statusText}`);
  }
  return response.json();
}

// ============================================================================
// Auth
// ============================================================================

export async function register(username, email, password) {
  const res = await fetch(`${API_BASE_URL}/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });
  if (!res.ok) throw new Error(`Register failed: ${res.statusText}`);
  return res.json();
}

export async function login(username, password) {
  const res = await fetch(`${API_BASE_URL}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error(`Login failed: ${res.statusText}`);
  const data = await res.json();
  if (data.access_token) setToken(data.access_token);
  return data;
}

export async function currentUser() {
  const res = await fetch(`${API_BASE_URL}/users/me`, { headers: { ...authHeaders() } });
  if (!res.ok) throw new Error(`Fetch current user failed: ${res.statusText}`);
  return res.json();
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
