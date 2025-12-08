import React, { useState, useContext } from "react";
import axios from "../services/axios"; 
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { Lock, Mail } from "lucide-react";

// Helper Component for Input Fields
const InputField = ({ label, icon, ...props }) => (
  <div className="mb-5">
    <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
      {label}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
        {icon}
      </div>
      <input
        {...props}
        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
      />
    </div>
  </div>
);

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const { setUser, navigate } = useContext(AuthContext);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password)
      return toast.warning("Please fill in all fields.");

    setLoading(true);
    try {
      const res = await axios.post(`/api/user/login`, {
        email: form.email,
        password: form.password,
      });

      if (res.data.success) {
        toast.success("Login Successful!");
        if (res.data.token) localStorage.setItem("token", res.data.token);
        setUser(res.data.user);
        navigate("/dashboard");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gray-50">
      
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400/20 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md mx-4 bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl rounded-2xl p-8 z-10 animate-fade-in-up">
        
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-blue-500/30 mb-4">
            D
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            Welcome Back
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            Enter your details to access your vault.
          </p>
        </div>

        <form onSubmit={handleLogin} className="animate-fade-in">
          <InputField
            label="Email Address"
            type="email"
            name="email"
            placeholder="you@example.com"
            onChange={handleChange}
            value={form.email}
            icon={<Mail className="w-5 h-5" />}
          />

          <InputField
            label="Password"
            type="password"
            name="password"
            placeholder="••••••••"
            onChange={handleChange}
            value={form.password}
            icon={<Lock className="w-5 h-5" />}
          />

          <button type="submit" disabled={loading} className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl shadow-lg flex items-center justify-center mt-6">
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">Don't have an account? <Link to="/signup" className="text-blue-600 font-bold hover:underline">Sign up</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;