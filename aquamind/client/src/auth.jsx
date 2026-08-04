import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);
const mockUsers = {
  "admin@example.com": {
    id: 1,
    email: "admin@example.com",
    name: "Admin User",
    role: "admin",
    password: "admin123",
  },
  "user@example.com": {
    id: 2,
    email: "user@example.com",
    name: "Regular User",
    role: "user",
    password: "user123",
  },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("aquamind_user");
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const user = mockUsers[email.toLowerCase()];
    if (!user || user.password !== password) {
      throw new Error("Invalid email or password. Use admin@example.com/admin123 or user@example.com/user123.");
    }
    const authUser = { email: user.email, name: user.name, role: user.role };
    localStorage.setItem("aquamind_user", JSON.stringify(authUser));
    setUser(authUser);
    return { user: authUser };
  };

  const logout = () => {
    localStorage.removeItem("aquamind_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
