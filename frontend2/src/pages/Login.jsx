import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { FiUser, FiLock, FiArrowRight, FiCoffee } from "react-icons/fi";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const toastId = toast.loading("Checking credentials...");

    try {
      const res = await axios.post(`${API_URL}/admin/login`, {
        username,
        password,
      });

      toast.success(`Welcome back, ${res.data.username}! 👨‍🍳`, { id: toastId });

      login(res.data.token, res.data.username);
      navigate("/admin");
    } catch (err) {
      toast.error("Incorrect Username or Password! ❌", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brand-500/20 rounded-full blur-3xl animate-float"></div>
      <div
        className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-yellow-500/20 rounded-full blur-3xl animate-float"
        style={{ animationDelay: "1.5s" }}
      ></div>

      <div className="glass-card p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-md relative z-10 animate-slide-up">
        <div className="text-center mb-8">
          <div className="bg-brand-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-500/30">
            <FiCoffee className="text-white text-3xl" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            Welcome Back
          </h2>
          <p className="text-gray-500 mt-2">Admin Dashboard Login</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="group">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiUser className="text-gray-400 group-focus-within:text-brand-500 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Username"
                className="w-full pl-11 pr-4 py-3.5 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all font-medium text-gray-700 placeholder-gray-400"
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="group">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiLock className="text-gray-400 group-focus-within:text-brand-500 transition-colors" />
              </div>
              <input
                type="password"
                placeholder="Password"
                className="w-full pl-11 pr-4 py-3.5 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all font-medium text-gray-700 placeholder-gray-400"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-900 text-white py-3.5 rounded-xl font-bold text-lg hover:bg-brand-800 hover:shadow-lg hover:shadow-brand-900/20 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In"} <FiArrowRight />
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-gray-500">
          Don't have an account?
          <Link
            to="/signup"
            className="text-brand-600 font-bold ml-1 hover:text-brand-800 transition-colors"
          >
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
