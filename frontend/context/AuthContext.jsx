import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/axios";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is logged in on mount
  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const res = await api.get("/api/user/me");
      if (res.data.success) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.log("User not logged in or session expired");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post("/api/user/logout");
      localStorage.removeItem("token"); // <--- Clear the token!
      setUser(null);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
      // Optional: Force logout even if API fails
      localStorage.removeItem("token");
      setUser(null);
      navigate("/login");
    }
  };

  const value = {
    user,
    setUser,
    loading,
    checkUser,
    logout,
    navigate
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
