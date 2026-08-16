import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { FiUser, FiLock, FiEye } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import { Helmet } from "react-helmet-async";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!username || !password) return;
    setLoading(true);
    const toastId = toast.loading("Creating your account...");

    try {
      const res = await axios.post(`${API_URL}/admin/register`, {
        username,
        password,
      });

      toast.success("Welcome to RIMI! 🎉", { id: toastId });
      login(res.data.token, res.data.username);
      navigate("/admin");
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup Failed", {
        id: toastId,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-white font-sans">
      <Helmet>
        <title>Rimi - Partner Signup</title>
      </Helmet>

      {/* LEFT SIDE: Form */}
      <div className="w-full lg:w-[45%] xl:w-[40%] flex flex-col justify-center px-8 sm:px-16 md:px-24 lg:px-16 xl:px-24 relative overflow-y-auto py-12">
        {/* Brand */}
        <div className="absolute top-8 left-8 sm:left-16 lg:left-12 xl:left-24 flex items-center justify-center lg:justify-start w-full lg:w-auto text-center lg:text-left">
          <span style={{ fontFamily: 'Rink, sans-serif', fontSize: 32, color: '#1a1a2e', fontWeight: 800, letterSpacing: 1 }}>
            rimi
          </span>
        </div>

        {/* Headings */}
        <div className="mb-10 text-center mt-16 lg:mt-0">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">Create Account</h1>
          <p className="text-gray-500 font-medium text-[15px]">
            Already have an account? <Link to="/login" className="text-[#d8684d] font-bold hover:underline">Sign in</Link>
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-5 w-full max-w-sm mx-auto">
          {/* Username Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 pl-1">Name</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiUser className="text-gray-400 group-focus-within:text-gray-800 transition-colors text-lg" />
              </div>
              <input
                type="text"
                placeholder="Type your full name"
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:border-gray-800 transition-all font-semibold text-[15px] text-gray-800 placeholder-gray-400"
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 pl-1">Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiLock className="text-gray-400 group-focus-within:text-gray-800 transition-colors text-lg" />
              </div>
              <input
                type="password"
                placeholder="Type your password"
                className="w-full pl-12 pr-12 py-3.5 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:border-gray-800 transition-all font-semibold text-[15px] text-gray-800 placeholder-gray-400"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer">
                <FiEye className="text-gray-400 hover:text-gray-700 transition-colors text-lg" />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !username || !password}
            className={`w-full mt-6 py-4 rounded-2xl font-extrabold text-[15px] transition-all flex items-center justify-center gap-2 ${
              username && password 
                ? "bg-[#334877] text-white hover:bg-[#25365d] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0" 
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        <div className="mt-8 flex items-center justify-center space-x-4 w-full max-w-sm mx-auto">
          <span className="h-px w-full bg-gray-100"></span>
          <span className="text-gray-400 font-semibold text-sm uppercase tracking-wide">Or</span>
          <span className="h-px w-full bg-gray-100"></span>
        </div>

        <div className="mt-8 space-y-4 w-full max-w-sm mx-auto">
          <button className="w-full border border-gray-200 rounded-2xl py-3.5 flex items-center justify-center gap-3 font-bold text-[15px] text-gray-700 hover:bg-gray-50 transition-colors">
            <FcGoogle className="text-xl" /> Continue with Google
          </button>
          <button className="w-full border border-gray-200 rounded-2xl py-3.5 flex items-center justify-center gap-3 font-bold text-[15px] text-gray-700 hover:bg-gray-50 transition-colors">
            <FaApple className="text-xl" /> Continue with Apple
          </button>
        </div>

        <p className="mt-12 text-center text-xs text-gray-400 font-medium w-full max-w-sm mx-auto">
          By clicking Sign up, you agree to accept Rimi's <Link to="#" className="font-bold text-gray-600 hover:text-gray-900">Terms of Service</Link>
        </p>
      </div>

      {/* RIGHT SIDE: Image */}
      <div className="hidden lg:block lg:w-[55%] xl:w-[60%] p-4 pl-0">
        <div className="w-full h-full rounded-[2rem] overflow-hidden relative shadow-2xl">
          <img 
            src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80" 
            className="absolute inset-0 w-full h-full object-cover" 
            alt="Cafe interior" 
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
