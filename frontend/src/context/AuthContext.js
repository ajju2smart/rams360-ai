import React, { createContext, useContext, useEffect, useState } from "react";
import Api from "../Api";
import Loader from "../components/core/Loader";
//import { useHistory } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    Api.get("/api/v1/user/me", { withCredentials: true })
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

const logout = async () => {
  if (loggingOut) return;

  setLoggingOut(true);

  try {
    await Api.post("/api/v1/user/logout", {}, { withCredentials: true });

    // Wait for 10 seconds (10000 ms)
    await new Promise((resolve) => setTimeout(resolve, 3000));

  } catch (error) {
    console.error("Logout failed", error);
  }
};


  // Block the entire tree until we know auth status.
  // This means ProtectedRoute / PublicRoute never need to handle loading themselves.
  if (loading) return <Loader />;

  return (
    <AuthContext.Provider value={{ user, setUser, logout, loggingOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);