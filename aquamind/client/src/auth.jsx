import { createContext, useContext, useState, useEffect } from "react";
import { login as apiLogin, currentUser, clearToken, getToken } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const tok = getToken();
        if (tok) {
          const u = await currentUser();
          setUser(u);
        }
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const login = async (username, password) => {
    const res = await apiLogin(username, password);
    if (res.user) setUser(res.user);
    return res;
  };

  const logout = () => {
    clearToken();
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
