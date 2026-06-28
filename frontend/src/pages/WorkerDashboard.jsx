import { useState, useEffect } from "react";
import API from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  LogOut, 
  Plus, 
  Search, 
  Calendar, 
  ShieldCheck, 
  Sun, 
  Moon, 
  Phone, 
  User, 
  FileSpreadsheet,
  ChevronsUpDown,
  Sparkles
} from "lucide-react";

export default function WorkerDashboard() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [employerPhone, setEmployerPhone] = useState("");
  const [hoursWorked, setHoursWorked] = useState(8);
  const [records, setRecords] = useState([]);
  
  // Employer autocomplete search states
  const [employers, setEmployers] = useState([]);
  const [employerSearch, setEmployerSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  
  // UX/UI States
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, pending, approved
  const [showCelebration, setShowCelebration] = useState(false);
  
  // Custom toast notification system
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 4000);
  };

  useEffect(() => {
    if (!user) {
      navigate("/");
    } else if (user.role !== "worker") {
      navigate("/employer");
    }
  }, [user, navigate]);

  const fetchEmployers = async () => {
    try {
      const res = await API.get("/api/auth/employers");
      setEmployers(res.data);
    } catch (err) {
      console.error("Failed to fetch employers:", err);
    }
  };

  const fetchHistory = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await API.get("/api/attendance");
      setRecords(res.data);
    } catch (err) {
      console.error(err);
      showToast("Failed to retrieve log history", "error");
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  useEffect(() => {
    fetchHistory();
    if (user && user.role === "worker") {
      fetchEmployers();
    }
  }, [user]);

  const getCombinedEmployers = () => {
    const map = new Map();
    // 1. Add employers from API
    employers.forEach((emp) => {
      map.set(emp.phone, emp);
    });

    // 2. Add employers from attendance history
    records.forEach((rec) => {
      if (rec.employer && rec.employer.phone && !map.has(rec.employer.phone)) {
        map.set(rec.employer.phone, {
          name: rec.employer.name || "Unknown Employer",
          phone: rec.employer.phone
        });
      }
    });

    return Array.from(map.values());
  };

  const handleEmployerSearchChange = (e) => {
    const val = e.target.value;
    setEmployerSearch(val);
    setShowDropdown(true);

    const list = getCombinedEmployers();
    const found = list.find((emp) => emp.name.toLowerCase() === val.toLowerCase());
    if (found) {
      setEmployerPhone(found.phone);
    }
  };

  const selectEmployer = (emp) => {
    setEmployerPhone(emp.phone);
    setEmployerSearch(emp.name);
    setShowDropdown(false);
  };

  const handlePhoneChange = (e) => {
    const val = e.target.value;
    setEmployerPhone(val);

    const list = getCombinedEmployers();
    const found = list.find((emp) => emp.phone === val);
    if (found) {
      setEmployerSearch(found.name);
    }
  };

  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    if (!employerPhone || !hoursWorked) {
      showToast("Please fill out all fields", "error");
      return;
    }
    if (Number(hoursWorked) <= 0 || Number(hoursWorked) > 24) {
      showToast("Hours worked must be between 1 and 24", "error");
      return;
    }

    setSubmitLoading(true);

    try {
      const res = await API.post("/api/attendance/mark", {
        employerPhone,
        hoursWorked: Number(hoursWorked)
      });

      showToast("Attendance marked successfully!", "success");
      setEmployerPhone("");
      setEmployerSearch("");
      setHoursWorked(8);
      // Prepend new record to the list
      setRecords((prev) => [res.data, ...prev]);
      
      // Trigger short celebration animation
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 1500);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to mark attendance.", "error");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Metrics calculations
  const totalHours = records.reduce((sum, r) => sum + (r.hoursWorked || 0), 0);
  const approvedHours = records.reduce((sum, r) => sum + (r.approved ? (r.hoursWorked || 0) : 0), 0);
  const pendingHours = totalHours - approvedHours;
  const approvedPercent = totalHours > 0 ? Math.round((approvedHours / totalHours) * 100) : 0;

  // Search & Filter records
  const filteredRecords = records.filter((r) => {
    const employerName = r.employer?.name?.toLowerCase() || "";
    const employerPhoneNo = r.employer?.phone?.toLowerCase() || "";
    const matchesSearch = 
      employerName.includes(searchQuery.toLowerCase()) || 
      employerPhoneNo.includes(searchQuery.toLowerCase());

    if (statusFilter === "approved") return matchesSearch && r.approved;
    if (statusFilter === "pending") return matchesSearch && !r.approved;
    return matchesSearch;
  });

  const renderSkeletons = () => {
    return Array(4).fill(0).map((_, i) => (
      <tr key={i} className="animate-pulse border-b border-slate-100 dark:border-slate-800/40">
        <td className="py-4 px-4">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3 mb-2"></div>
          <div className="h-3 bg-slate-100 dark:bg-slate-800/60 rounded w-1/2"></div>
        </td>
        <td className="py-4 px-4">
          <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-16"></div>
        </td>
        <td className="py-4 px-4">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24"></div>
        </td>
        <td className="py-4 px-4 text-right">
          <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-full w-20 ml-auto"></div>
        </td>
      </tr>
    ));
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans relative overflow-hidden pb-12 bg-grid-pattern transition-colors duration-500">
      
      {/* Dynamic abstract decorative background shapes */}
      <div className="absolute top-0 right-1/4 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-indigo-500/5 dark:bg-indigo-600/5 rounded-full blur-3xl pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 left-1/4 w-[350px] h-[350px] bg-purple-500/5 dark:bg-purple-600/5 rounded-full blur-3xl pointer-events-none animate-pulse-slow"></div>

      {/* Floating Success Celebration Sparkles */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-8 rounded-full animate-pop-confetti flex items-center justify-center">
            <Sparkles size={48} className="text-emerald-500 animate-spin" />
          </div>
        </div>
      )}

      {/* Custom Slide-in Toast Alert */}
      {toast.show && (
        <div className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-2xl border text-sm flex items-center gap-3 animate-slide-in-right glass-panel ${
          toast.type === "success" 
            ? "border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300" 
            : "border-red-200 dark:border-red-500/30 text-red-800 dark:text-red-300"
        }`}>
          {toast.type === "success" ? (
            <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <CheckCircle2 size={18} />
            </div>
          ) : (
            <div className="w-8 h-8 bg-red-500/10 rounded-lg flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
              <AlertCircle size={18} />
            </div>
          )}
          <span className="font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Navbar */}
      <nav className="bg-white/80 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 px-6 py-4 backdrop-blur-md transition-colors duration-500">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20 transform hover:scale-105 transition duration-300">
              <ShieldCheck size={20} className="text-white" />
            </div>
            <div>
              <span className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight font-display">Wage Guard</span>
              <span className="ml-3 text-xs bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20 px-2.5 py-0.5 rounded-full font-bold">Worker Portal</span>
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{user.name}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-mono">{user.phone}</p>
            </div>
            
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:scale-105 transition-all cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} />}
            </button>

            <button
              onClick={handleLogout}
              className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-white px-4 py-2.5 rounded-xl text-sm font-bold border border-slate-200 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600 transition-all flex items-center gap-2 cursor-pointer"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 py-8 animate-fade-in-up">
        
        {/* Worker Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card 1: Logged Hours */}
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm relative overflow-hidden group hover:border-indigo-500/20 dark:hover:border-slate-700 transition-all duration-300">
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl group-hover:bg-indigo-500/10 transition duration-300"></div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-display">Logged Hours</p>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2 font-mono">{totalHours} hrs</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Clock size={20} />
              </div>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-5 overflow-hidden">
              <div className="bg-indigo-500 h-full rounded-full w-full"></div>
            </div>
            <p className="text-[10px] text-slate-400 mt-2">Cumulative hours recorded in backend</p>
          </div>

          {/* Card 2: Pending Hours */}
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm relative overflow-hidden group hover:border-amber-500/20 dark:hover:border-slate-700 transition-all duration-300">
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition duration-300"></div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-display">Pending Verification</p>
                <p className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-2 font-mono">{pendingHours} hrs</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <AlertCircle size={20} className="animate-pulse" />
              </div>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-5 overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${totalHours > 0 ? (pendingHours / totalHours) * 100 : 0}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-slate-400 mt-2">{totalHours > 0 ? `${100 - approvedPercent}% of total logs` : "Awaiting employers approvals"}</p>
          </div>

          {/* Card 3: Approved & Verified */}
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm relative overflow-hidden group hover:border-emerald-500/20 dark:hover:border-slate-700 transition-all duration-300">
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition duration-300"></div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-display">Approved & Verified</p>
                <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-455 mt-2 font-mono">{approvedHours} hrs</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 size={20} />
              </div>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-5 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${approvedPercent}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-slate-400 mt-2">{approvedPercent}% verification rate</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Form Column */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm hover:border-indigo-500/10 glow-indigo transition duration-300">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2.5 font-display">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Plus size={16} />
                </div>
                Log Daily Hours
              </h3>

              <form onSubmit={handleMarkAttendance} className="space-y-5">
                {/* Employer Name autocomplete search input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 font-display">
                    Employer's Name
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 dark:text-slate-500">
                      <User size={16} />
                    </span>
                    <input
                      type="text"
                      placeholder="Type to search e.g. Demo Employer"
                      value={employerSearch}
                      onChange={handleEmployerSearchChange}
                      onFocus={() => setShowDropdown(true)}
                      onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 pl-11 pr-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-slate-400 dark:placeholder-slate-700 font-medium"
                    />
                    
                    {/* Autocomplete Dropdown list */}
                    {showDropdown && employerSearch && (
                      <div className="absolute z-20 left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80">
                        {getCombinedEmployers()
                          .filter((emp) =>
                            emp.name.toLowerCase().includes(employerSearch.toLowerCase()) ||
                            emp.phone.includes(employerSearch)
                          )
                          .map((emp) => (
                            <button
                              key={emp.phone}
                              type="button"
                              onClick={() => selectEmployer(emp)}
                              className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex justify-between items-center gap-2 cursor-pointer"
                            >
                              <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{emp.name}</span>
                              <span className="font-mono text-xs text-slate-400 dark:text-slate-500">{emp.phone}</span>
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 font-display">
                    Employer's Phone Number
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 dark:text-slate-500">
                      <Phone size={16} />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 9876543210"
                      value={employerPhone}
                      onChange={handlePhoneChange}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 pl-11 pr-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-slate-400 dark:placeholder-slate-700 font-medium font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 font-display">
                    Hours Worked
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 dark:text-slate-500">
                      <Clock size={16} />
                    </span>
                    <input
                      type="number"
                      required
                      min="1"
                      max="24"
                      value={hoursWorked}
                      onChange={(e) => setHoursWorked(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 pl-11 pr-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-bold font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitLoading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:from-indigo-855 disabled:to-violet-855 text-white py-3 rounded-2xl font-bold shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 active:scale-[0.98] transition duration-300 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submitLoading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <Plus size={18} />
                      <span>Log Hours</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* History Column */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm hover:border-slate-300 dark:hover:border-slate-800 transition duration-300">
              
              {/* Header with Search and Filter bar */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2.5 font-display">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <FileSpreadsheet size={16} />
                  </div>
                  Attendance History
                </h3>

                {/* Filters */}
                <div className="flex w-full md:w-auto items-center gap-3">
                  <div className="relative flex-grow md:flex-grow-0">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-slate-500">
                      <Search size={14} />
                    </span>
                    <input
                      type="text"
                      placeholder="Search employer..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-850 dark:text-slate-200 pl-9 pr-4 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-slate-400 dark:placeholder-slate-700 transition"
                    />
                  </div>

                  <div className="relative">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-800 dark:text-slate-200 pl-3 pr-8 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold appearance-none cursor-pointer"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                    </select>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-slate-400">
                      <ChevronsUpDown size={12} />
                    </span>
                  </div>
                </div>
              </div>

              {/* Table Data */}
              {loading ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-850 text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                        <th className="py-3 px-4">Employer</th>
                        <th className="py-3 px-4">Hours</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {renderSkeletons()}
                    </tbody>
                  </table>
                </div>
              ) : filteredRecords.length === 0 ? (
                <div className="text-center py-16 text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-850 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20">
                  <FileSpreadsheet size={40} className="mx-auto mb-3 text-slate-300 dark:text-slate-700 animate-pulse" />
                  <p className="font-bold text-slate-600 dark:text-slate-400 text-sm">No attendance records found</p>
                  <p className="text-xs text-slate-400 dark:text-slate-650 mt-1">Try adapting your filters or submit a new entry on the left.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-850 text-slate-400 dark:text-slate-550 text-[10px] font-bold uppercase tracking-wider">
                        <th className="py-3 px-4 font-display">Employer</th>
                        <th className="py-3 px-4 font-display">Hours</th>
                        <th className="py-3 px-4 font-display">Date Logged</th>
                        <th className="py-3 px-4 text-right font-display">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-850/40 text-sm">
                      {filteredRecords.map((record) => (
                        <tr key={record._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/10 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-xs">
                                {record.employer?.name ? record.employer.name.charAt(0).toUpperCase() : "?"}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 dark:text-slate-200 text-sm">
                                  {record.employer?.name || "Unknown Employer"}
                                </p>
                                <p className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-0.5 flex items-center gap-1">
                                  <Phone size={10} />
                                  <span>{record.employer?.phone || "N/A"}</span>
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-700 dark:text-slate-300 font-bold">
                            {record.hoursWorked} hrs
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-medium">
                            <div className="flex items-center gap-1.5">
                              <Calendar size={12} className="text-slate-400" />
                              <span>
                                {new Date(record.createdAt || record.date).toLocaleDateString(undefined, {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric"
                                })}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                              record.approved
                                ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-250 dark:border-emerald-500/20"
                                : "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-250 dark:border-amber-500/20"
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${record.approved ? "bg-emerald-500" : "bg-amber-500"}`}></span>
                              <span>{record.approved ? "Approved" : "Pending"}</span>
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}