// src/services/storage.js
export function saveLogs(logs) {
  localStorage.setItem("aquamind_logs", JSON.stringify(logs));
}

export function getLogs() {
  return JSON.parse(localStorage.getItem("aquamind_logs")) || [];
}
