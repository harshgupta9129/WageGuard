import { useState, useEffect } from "react";
import API from "../api/api";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { User, Phone, Lock, Sun, Moon, ShieldAlert, ArrowRight, UserCheck, ShieldCheck, CheckCircle2, Loader2 } from "lucide-react";

export default function Register() {
  const [form, setForm] = useState({ name: "", phone: "", password: "", role: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !isSuccess) {
      if (user.role === "worker") navigate("/worker");
      else navigate("/employer");
    }
  }, [user, navigate, isSuccess]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, phone, password, role } = form;

    if (!name || !phone || !password || !role) {
      setError("Please fill in all fields and select a role");
      return;
    }
    setError("");
    setLoading(true);

    try {
      await API.post("/api/auth/register", form);
      setIsSuccess(true);
      
      // Wait 2.2 seconds before navigating back to Login
      setTimeout(() => {
        navigate("/");
      }, 2200);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
      setLoading(false);
    }
  };

  const selectRole = (role) => {
    setForm((prev) => ({ ...prev, role }));
    setError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 font-sans px-4 py-12 relative overflow-hidden bg-grid-pattern transition-colors duration-500">
      {/* Decorative background shapes */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 md:w-96 md:h-96 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 md:w-96 md:h-96 bg-teal-500/10 dark:bg-teal-500/5 rounded-full blur-3xl pointer-events-none animate-pulse-slow"></div>

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

      {isSuccess ? (
        /* Smooth Registration Success Card */
        <div className="relative w-full max-w-md glass-panel border p-8 rounded-3xl shadow-xl flex flex-col items-center justify-center text-center animate-scale-in py-12">
          <div className="w-16 h-16 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6 animate-pulse-slow">
            <CheckCircle2 size={36} className="animate-bounce" />
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2 font-display bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-teal-900 dark:from-white dark:to-teal-200">
            Account Created!
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-8 max-w-xs">
            Your Wage Guard wallet key has been initialized. Proceeding to login portal...
          </p>
          <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-widest">
            <Loader2 size={16} className="animate-spin text-emerald-500" />
            <span>Redirecting to Login</span>
          </div>
        </div>
      ) : (
        /* Standard Form Card */
        <div className="relative w-full max-w-lg glass-panel border p-8 rounded-3xl shadow-xl hover:border-emerald-500/20 dark:hover:border-emerald-500/20 glow-emerald animate-scale-in">
          {/* Header */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 bg-gradient-to-tr from-emerald-600 to-teal-500 dark:from-emerald-500 dark:to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-4 transform hover:-rotate-6 transition duration-300">
              <UserCheck size={32} className="text-white" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-display bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-teal-900 dark:from-white dark:via-slate-100 dark:to-teal-200">
              Create Account
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm text-center font-medium">
              Register as a Worker or Employer to secure your wages
            </p>
          </div>

          {/* Error Alert Box */}
          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-500/20 text-red-800 dark:text-red-200 p-4 rounded-2xl text-sm flex items-start gap-3 animate-shake">
              <ShieldAlert size={20} className="text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 font-display">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 dark:text-slate-500">
                  <User size={18} />
                </span>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jane Doe"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 text-slate-900 dark:text-slate-100 pl-11 pr-4 py-2.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-slate-400 dark:placeholder-slate-700 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 font-display">
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
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 text-slate-900 dark:text-slate-100 pl-11 pr-4 py-2.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-slate-400 dark:placeholder-slate-700 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 font-display">
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
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 text-slate-900 dark:text-slate-100 pl-11 pr-4 py-2.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-slate-400 dark:placeholder-slate-700 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5 font-display text-center">
                Select Your Role
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => selectRole("worker")}
                  className={`flex flex-col items-center p-4 rounded-2xl border text-center transition-all cursor-pointer select-none ${
                    form.role === "worker"
                      ? "border-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 ring-2 ring-emerald-500/20"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:border-slate-350 dark:hover:border-slate-700"
                  }`}
                >
                  <div className={`p-2.5 rounded-xl mb-2.5 ${form.role === 'worker' ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400'}`}>
                    <UserCheck size={20} />
                  </div>
                  <span className="font-bold text-xs">Worker</span>
                  <span className="text-[10px] text-slate-400 mt-1 line-clamp-2">Log your hours & protect wages</span>
                </button>

                <button
                  type="button"
                  onClick={() => selectRole("employer")}
                  className={`flex flex-col items-center p-4 rounded-2xl border text-center transition-all cursor-pointer select-none ${
                    form.role === "employer"
                      ? "border-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 ring-2 ring-emerald-500/20"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:border-slate-350 dark:hover:border-slate-700"
                  }`}
                >
                  <div className={`p-2.5 rounded-xl mb-2.5 ${form.role === 'employer' ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400'}`}>
                    <ShieldCheck size={20} />
                  </div>
                  <span className="font-bold text-xs">Employer</span>
                  <span className="text-[10px] text-slate-400 mt-1 line-clamp-2">Verify worker sheets & approve logs</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:from-emerald-850 disabled:to-teal-850 text-white py-3 rounded-2xl font-bold shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 active:scale-[0.98] transition duration-300 flex items-center justify-center gap-2 mt-5 cursor-pointer"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <span>Register</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-slate-500 dark:text-slate-400 text-sm mt-8 font-medium">
            Already have an account?{" "}
            <Link to="/" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline transition">
              Sign In
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}