import { createContext, useContext, useState, useEffect } from "react";
import { clearToken, currentUser, fetchUsers, login as loginRequest, register as registerRequest } from "./api";

const AuthContext = createContext(null);

const STORAGE_KEY = "aquamind_user";

function getStoredAuthUser() {
  const sessionUser = sessionStorage.getItem(STORAGE_KEY);
  const localUser = localStorage.getItem(STORAGE_KEY);
  const raw = sessionUser || localUser;
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function toClientUser(raw) {
  if (!raw) return null;
  return {
    id: raw.id,
    email: raw.email,
    username: raw.username,
    name: raw.username,
    role: raw.role,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrapAuth = async () => {
      const storedUser = getStoredAuthUser();
      if (storedUser) {
        setUser(storedUser);
      }

      try {
        const me = await currentUser();
        const normalized = toClientUser(me);
        setUser(normalized);

        const persisted = localStorage.getItem(STORAGE_KEY);
        if (persisted) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
        } else {
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
        }

        if (normalized?.role === "admin") {
          const response = await fetchUsers();
          setUsers((response.data || []).map(toClientUser));
        }
      } catch {
        clearToken();
        localStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem(STORAGE_KEY);
        setUser(null);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    bootstrapAuth();
  }, []);

  const login = async (identifier, password, rememberMe = false) => {
    const result = await loginRequest(identifier, password, rememberMe);
    const authUser = toClientUser(result.user);

    if (rememberMe) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
      sessionStorage.removeItem(STORAGE_KEY);
    } else {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
      localStorage.removeItem(STORAGE_KEY);
    }

    setUser(authUser);

    if (authUser?.role === "admin") {
      try {
        const response = await fetchUsers();
        setUsers((response.data || []).map(toClientUser));
      } catch {
        setUsers([]);
      }
    } else {
      setUsers([]);
    }

    return { user: authUser };
  };

  const register = async (username, email, password) => {
    const created = await registerRequest(username, email, password);
    return toClientUser(created);
  };

  const logout = () => {
    clearToken();
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    setUser(null);
    setUsers([]);
  };

  return (
    <AuthContext.Provider value={{ user, users, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
