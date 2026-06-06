import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Shield, BarChart3, CheckCircle, Copy, Key, BookOpen, Sparkles, MessageSquare } from "lucide-react";

const adminTabs = [
  { label: "Overview", path: "/admin", icon: BarChart3 },
  { label: "Moderation", path: "/admin/moderation", icon: CheckCircle },
  { label: "FAQs", path: "/admin/faqs", icon: BookOpen },
  { label: "Admin Queries", path: "/admin/admin-queries", icon: MessageSquare },
  { label: "Duplicates", path: "/admin/duplicates", icon: Copy },
  { label: "Credentials", path: "/admin/credentials", icon: Key },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen relative">
      <div className="orb w-96 h-96 bg-indigo-500 top-10 -right-20" />
      <div className="orb w-72 h-72 bg-purple-500 bottom-10 -left-20" />
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-xl shadow-indigo-500/20">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full badge-glow mb-1">
              <Sparkles className="w-3 h-3" /> Admin
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Platform management and moderation</p>
          </div>
        </div>

        <div className="flex items-center gap-1 mb-6 glass rounded-2xl p-1.5 overflow-x-auto">
          {adminTabs.map((tab) => {
            const isActive = location.pathname === tab.path;
            return (
              <button key={tab.path} onClick={() => navigate(tab.path)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  isActive ? "gradient-primary text-white shadow-lg shadow-indigo-500/20" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                }`}>
                <tab.icon className="w-4 h-4" />{tab.label}
              </button>
            );
          })}
        </div>

        <Outlet />
      </div>
    </div>
  );
}
