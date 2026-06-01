import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { apiMe, type UserResponse } from "../services/auth";

interface AuthContextType {
  user: UserResponse | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: UserResponse) => void;
  logout: () => void;
  updateUser: (user: UserResponse) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem("checkai_token")
  );
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(!!localStorage.getItem("checkai_token"));

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    apiMe(token)
      .then(setUser)
      .catch(() => {
        localStorage.removeItem("checkai_token");
        setToken(null);
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, [token]);

  const login = (newToken: string, newUser: UserResponse) => {
    localStorage.setItem("checkai_token", newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("checkai_token");
    setToken(null);
    setUser(null);
  };

  const updateUser = (newUser: UserResponse) => {
    setUser(newUser);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, isAuthenticated: !!user && !!token, login, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
