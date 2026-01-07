import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { FiUser, FiLock, FiArrowRight, FiShield } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext'; // 👈 Import Auth Context
import { toast } from 'react-hot-toast';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth(); // 👈 Login function nikalo context se
  const navigate = useNavigate();

 const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Creating your account...');

    try {
      const res = await axios.post('http://localhost:5000/api/admin/register', { username, password });
      
      // 👇 SUCCESS: Direct Login karvao
      toast.success("Welcome to Mrs Jha Kitchen! 🎉", { id: toastId });
      
      // Ye Context update karega aur Token save karega
      login(res.data.token, res.data.username); 
      
      // Seedha Dashboard par pheko
      navigate('/admin'); 

    } catch (err) {
      toast.error(err.response?.data?.message || "Signup Failed", { id: toastId });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tl from-orange-50 via-white to-orange-100 relative overflow-hidden">
      
      {/* Background Blobs */}
      <div className="absolute top-10 right-10 w-72 h-72 bg-yellow-400/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>

      {/* Glass Card */}
      <div className="glass-card p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-md relative z-10 animate-slide-up">
        
        <div className="text-center mb-8">
          <div className="bg-gray-900 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-gray-900/20">
            <FiShield className="text-white text-3xl" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Admin Access</h2>
          <p className="text-gray-500 mt-2">Create a new secure account</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-5">
          <div className="relative">
            <FiUser className="absolute left-4 top-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Choose Username" 
              className="w-full pl-11 pr-4 py-3.5 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-800/20 focus:border-gray-800 transition-all font-medium"
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <FiLock className="absolute left-4 top-4 text-gray-400" />
            <input 
              type="password" 
              placeholder="Choose Password" 
              className="w-full pl-11 pr-4 py-3.5 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-800/20 focus:border-gray-800 transition-all font-medium"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold text-lg hover:bg-black hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            {loading ? 'Creating...' : 'Create Account'} <FiArrowRight />
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-gray-500">
          Already have an account? 
          <Link to="/login" className="text-gray-900 font-bold ml-1 hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;