import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useQuery } from "@tanstack/react-query";
import {
  Sun, Moon, LogOut, User, Menu, X, Shield, MessageSquare, BookOpen, PlusCircle, Bell, TrendingUp, Sparkles,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { dark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const { data: notifData } = useQuery({
    queryKey: ["notif-count"],
    queryFn: () => {
      const u = JSON.parse(localStorage.getItem("user") || "null");
      return fetch("/api/users/me/notifications?limit=1", {
        headers: u?.token ? { Authorization: `Bearer ${u.token}` } : {},
      }).then((r) => r.json());
    },
    enabled: !!user,
    refetchInterval: 30000,
  });
  const unread = notifData?.unread || 0;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 glass-strong">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
              FAQHub
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/faq" icon={<BookOpen className="w-4 h-4" />} label="FAQs" />
            <NavLink to="/raise-query" icon={<PlusCircle className="w-4 h-4" />} label="Ask" />
            <NavLink to="/community-qa" icon={<MessageSquare className="w-4 h-4" />} label="Community" />
            {isAdmin && <NavLink to="/admin" icon={<Shield className="w-4 h-4" />} label="Admin" />}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
            >
              {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {user ? (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to="/profile"
                  className="relative p-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-gray-500 hover:text-indigo-500 transition-all"
                >
                  <Bell className="w-5 h-5" />
                  {unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white text-[9px] font-bold flex items-center justify-center shadow-lg shadow-red-500/30">
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{user.name}</span>
                  {isAdmin && <span className="badge-glow">Admin</span>}
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 hover:text-red-500 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
                  Login
                </Link>
                <Link to="/register" className="btn-primary"><span>Get Started</span></Link>
              </div>
            )}

            <button
              onClick={() => setOpen(!open)}
              className="md:hidden p-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-strong border-t border-white/10"
          >
            <div className="px-4 py-3 space-y-1">
              <MobileNavLink to="/faq" icon={<BookOpen className="w-4 h-4" />} label="FAQs" onClick={() => setOpen(false)} />
              <MobileNavLink to="/raise-query" icon={<PlusCircle className="w-4 h-4" />} label="Ask Question" onClick={() => setOpen(false)} />
              <MobileNavLink to="/community-qa" icon={<MessageSquare className="w-4 h-4" />} label="Community" onClick={() => setOpen(false)} />
              {isAdmin && <MobileNavLink to="/admin" icon={<Shield className="w-4 h-4" />} label="Admin" onClick={() => setOpen(false)} />}
              {user ? (
                <>
                  <MobileNavLink to="/profile" icon={<User className="w-4 h-4" />} label="Profile" onClick={() => setOpen(false)} />
                  <button
                    onClick={() => { handleLogout(); setOpen(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </>
              ) : (
                <>
                  <MobileNavLink to="/login" icon={<User className="w-4 h-4" />} label="Login" onClick={() => setOpen(false)} />
                  <MobileNavLink to="/register" icon={<User className="w-4 h-4" />} label="Register" onClick={() => setOpen(false)} />
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function NavLink({ to, icon, label }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all"
    >
      {icon} {label}
    </Link>
  );
}

function MobileNavLink({ to, icon, label, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all"
    >
      {icon} {label}
    </Link>
  );
}
