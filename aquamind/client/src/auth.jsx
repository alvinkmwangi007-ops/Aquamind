import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);
const mockUsers = {
  "admin@example.com": {
    id: 1,
    email: "admin@example.com",
    name: "AquaMind Admin",
    role: "admin",
    password: "admin123",
    theme: "dark",
    plan: "pro",
  },
  "manager@example.com": {
    id: 2,
    email: "manager@example.com",
    name: "Mina Manager",
    role: "manager",
    password: "manager123",
    theme: "light",
    plan: "team",
  },
  "coach@example.com": {
    id: 3,
    email: "coach@example.com",
    name: "Leo Coach",
    role: "coach",
    password: "coach123",
    theme: "blue",
    plan: "plus",
  },
  "user@example.com": {
    id: 4,
    email: "user@example.com",
    name: "Regular User",
    role: "user",
    password: "user123",
    theme: "default",
    plan: "free",
  },
};

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

function getPublicUsers() {
  return Object.values(mockUsers).map(({ password, ...user }) => user);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = getStoredAuthUser();
    if (storedUser) setUser(storedUser);
    setLoading(false);
  }, []);

  const login = async (email, password, rememberMe = false) => {
    const normalizedEmail = email.toLowerCase();
    const account = mockUsers[normalizedEmail];
    if (!account || account.password !== password) {
      throw new Error("Invalid email or password. Try admin@example.com/admin123, manager@example.com/manager123, coach@example.com/coach123, or user@example.com/user123.");
    }

    const authUser = {
      id: account.id,
      email: account.email,
      name: account.name,
      role: account.role,
      plan: account.plan,
      theme: account.theme,
    };

    if (rememberMe) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
    } else {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
      localStorage.removeItem(STORAGE_KEY);
    }

    setUser(authUser);
    return { user: authUser };
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, users: getPublicUsers(), loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
