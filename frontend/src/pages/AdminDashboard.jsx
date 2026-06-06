import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Users, MessageSquare, HelpCircle, CheckCircle, Clock, BarChart3, Trash2, FileText, Activity, Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import { adminAPI } from "../api";
import { QuestionSkeleton } from "../components/ui/Skeleton";

const fadeUp = { hidden: { opacity: 0, y: 15 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05 } }) };

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const { data: analytics, isLoading: analyticsLoading } = useQuery({ queryKey: ["admin-analytics"], queryFn: adminAPI.getAnalytics, refetchInterval: 30000 });
  const { data: questionsData, isLoading: questionsLoading } = useQuery({ queryKey: ["admin-questions"], queryFn: () => adminAPI.getQuestions({ limit: 20 }) });

  const deleteQuestion = async (id) => {
    if (!window.confirm("Delete this question and all its answers?")) return;
    try { await adminAPI.deleteQuestion(id); toast.success("Question deleted"); queryClient.invalidateQueries({ queryKey: ["admin-questions"] }); queryClient.invalidateQueries({ queryKey: ["admin-analytics"] }); }
    catch { toast.error("Failed to delete"); }
  };

  const stats = [
    { label: "Total Users", value: analytics?.totalUsers || 0, icon: Users, color: "from-blue-500 to-cyan-500" },
    { label: "Questions", value: analytics?.totalQuestions || 0, icon: MessageSquare, color: "from-indigo-500 to-purple-500" },
    { label: "Answers", value: analytics?.totalAnswers || 0, icon: Activity, color: "from-purple-500 to-pink-500" },
    { label: "Published", value: analytics?.totalFAQs || 0, icon: FileText, color: "from-green-500 to-emerald-500" },
    { label: "Pending", value: analytics?.pendingQuestions || 0, icon: Clock, color: "from-amber-500 to-orange-500" },
    { label: "Resolved", value: analytics?.resolvedQuestions || 0, icon: CheckCircle, color: "from-emerald-500 to-teal-500" },
  ];

  return (
    <div className="min-h-screen relative">
      <div className="orb w-96 h-96 bg-indigo-500 top-10 -right-20" />
      <div className="orb w-72 h-72 bg-purple-500 bottom-10 -left-20" />
      <div className="relative z-10">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-3">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Admin</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Platform analytics and management</p>
        </div>

        {/* Stats */}
        {analyticsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="animate-pulse h-28 glass rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {stats.map((stat, i) => (
              <motion.div key={stat.label} variants={fadeUp} custom={i} initial="hidden" animate="visible" className="card-glass p-4 group">
                <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${stat.color} mb-3 group-hover:scale-110 transition-transform shadow-lg`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Category Distribution + Recent FAQs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="lg:col-span-2 card-glass p-5">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-500" /> Category Distribution
            </h2>
            {analytics?.categoryDistribution?.length > 0 ? (
              <div className="space-y-3">
                {analytics.categoryDistribution.map((cat) => (
                  <div key={cat._id} className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400 w-32 truncate">{cat._id}</span>
                    <div className="flex-1 h-2.5 bg-gray-100 dark:bg-gray-700/50 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${(cat.count / Math.max(...analytics.categoryDistribution.map((c) => c.count))) * 100}%` }}
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-10 text-right">{cat.count}</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-gray-400">No data yet</p>}
          </motion.div>

          <motion.div variants={fadeUp} custom={1} initial="hidden" animate="visible" className="card-glass p-5">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-500" /> Recent FAQs
            </h2>
            {analytics?.recentFAQs?.length > 0 ? (
              <div className="space-y-3">
                {analytics.recentFAQs.map((faq) => (
                  <div key={faq._id} className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 border-b border-gray-100 dark:border-gray-700/50 pb-2 last:border-0">{faq.question}</div>
                ))}
              </div>
            ) : <p className="text-sm text-gray-400">No FAQs published yet</p>}
          </motion.div>
        </div>

        {/* Questions table */}
        <motion.div variants={fadeUp} custom={2} initial="hidden" animate="visible" className="card-glass">
          <div className="p-5 border-b border-gray-200 dark:border-gray-700/50">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-500" /> Manage Questions
            </h2>
          </div>
          {questionsLoading ? (
            <div className="p-5"><QuestionSkeleton /></div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {questionsData?.questions?.slice(0, 10).map((q) => (
                <div key={q._id} className="p-5 flex items-start justify-between gap-4 hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-all">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${
                        q.status === "resolved" ? "bg-green-100 dark:bg-green-900/30 text-green-700" : "bg-amber-100 dark:bg-amber-900/30 text-amber-700"
                      }`}>{q.status}</span>
                      <span className="text-xs text-gray-400">{q.category}</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{q.title}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{q.description}</p>
                    <p className="text-xs text-gray-400 mt-1">by {q.author?.name || "Unknown"}</p>
                  </div>
                  <button onClick={() => deleteQuestion(q._id)} className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-all shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {questionsData?.questions?.length === 0 && <div className="p-8 text-center text-sm text-gray-400">No questions found</div>}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
