import { useState, useEffect } from "react";
import API from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useNavigate, Link } from "react-router-dom";
import { Phone, Lock, Sun, Moon, ShieldAlert, ArrowRight, ShieldCheck, UserCheck } from "lucide-react";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === "worker") navigate("/worker");
      else navigate("/employer");
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!phone || !password) {
      setError("Please fill in all fields");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await API.post("/api/auth/login", {
        phone,
        password
      });

      login(res.data);
      if (res.data.user.role === "worker") {
        navigate("/worker");
      } else {
        navigate("/employer");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (demoRole) => {
    if (demoRole === "worker") {
      setPhone("1234567890");
      setPassword("1234567890");
    } else {
      setPhone("1234567891");
      setPassword("1234567891");
    }
    setError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 font-sans px-4 relative overflow-hidden bg-grid-pattern transition-colors duration-500">
      {/* Decorative blurred background shapes */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 md:w-96 md:h-96 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 md:w-96 md:h-96 bg-violet-500/10 dark:bg-violet-500/5 rounded-full blur-3xl pointer-events-none animate-pulse-slow"></div>

      {/* Floating Theme Switcher */}
      <div className="absolute top-6 right-6">
        <button
          onClick={toggleTheme}
          className="p-3 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:scale-105 transition-all shadow-md hover:shadow-lg cursor-pointer"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-slate-700" />}
        </button>
      </div>

      <div className="relative w-full max-w-md glass-panel border p-8 rounded-3xl shadow-xl hover:border-indigo-500/20 dark:hover:border-indigo-500/20 glow-indigo animate-scale-in">
        
        {/* Brand Logo & Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-tr from-indigo-600 to-violet-500 dark:from-indigo-500 dark:to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-4 transform hover:rotate-6 transition duration-300">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-display bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-indigo-900 dark:from-white dark:via-slate-100 dark:to-indigo-200">
            Wage Guard
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm text-center font-medium">
            Worker Wage Protection & Verification Portal
          </p>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-500/20 text-red-800 dark:text-red-200 p-4 rounded-2xl text-sm flex items-start gap-3 animate-shake">
            <ShieldAlert size={20} className="text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 font-display">
              Phone Number
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 dark:text-slate-500">
                <Phone size={18} />
              </span>
              <input
                type="text"
                required
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 text-slate-900 dark:text-slate-100 pl-11 pr-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-slate-400 dark:placeholder-slate-700 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 font-display">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 dark:text-slate-500">
                <Lock size={18} />
              </span>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 text-slate-900 dark:text-slate-100 pl-11 pr-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-slate-400 dark:placeholder-slate-700 font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:from-indigo-850 disabled:to-violet-850 text-white py-3 rounded-2xl font-bold shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 active:scale-[0.98] transition duration-300 flex items-center justify-center gap-2 mt-6 cursor-pointer"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Demo Fast Login Helper */}
        <div className="mt-6 border-t border-slate-150 dark:border-slate-800/80 pt-5">
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 text-center uppercase tracking-wider mb-3">
            Demo Credentials
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleDemoFill("worker")}
              type="button"
              className="bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800/60 hover:border-indigo-500/20 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
            >
              <UserCheck size={14} />
              <span>Worker Demo</span>
            </button>
            <button
              onClick={() => handleDemoFill("employer")}
              type="button"
              className="bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800/60 hover:border-indigo-500/20 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
            >
              <ShieldCheck size={14} />
              <span>Employer Demo</span>
            </button>
          </div>
        </div>

        <p className="text-center text-slate-500 dark:text-slate-400 text-sm mt-8 font-medium">
          Don’t have an account?{" "}
          <Link to="/register" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline transition">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}