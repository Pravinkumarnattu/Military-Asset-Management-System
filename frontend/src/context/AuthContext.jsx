import React, { createContext, useContext, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // On first load, check if we already have a saved session in localStorage.
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (username, password) => {
    const response = await api.post("/login", { username, password });
    const { token, role, baseId, username: uname } = response.data;

    const userData = { role, baseId, username: uname };
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);

    return userData;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Small helper hook so pages can just do: const { user, login, logout } = useAuth();
export const useAuth = () => useContext(AuthContext);
