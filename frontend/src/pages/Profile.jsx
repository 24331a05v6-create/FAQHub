import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, Calendar, Award, MessageSquare, CheckCircle,
  HelpCircle, Bell, CheckCheck, ChevronDown, ChevronUp, Sparkles, Loader2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const authFetch = (url, opts = {}) => {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  return fetch(url, {
    ...opts,
    headers: { "Content-Type": "application/json", ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {}), ...opts.headers },
  }).then((r) => r.json());
};

const API = {
  getProfile: () => authFetch("/api/users/me"),
  getQuestions: (status) => authFetch(`/api/users/me/questions?status=${status || ""}`),
  getAnswers: () => authFetch("/api/users/me/answers"),
  getNotifications: () => authFetch("/api/users/me/notifications"),
  markRead: (ids) => authFetch("/api/users/me/notifications/read", { method: "PATCH", body: JSON.stringify({ ids }) }),
  getAdminQueries: () => authFetch("/api/admin-queries/my"),
};

const TABS = [
  { key: "questions", label: "Raised", icon: HelpCircle },
  { key: "resolved", label: "Resolved", icon: CheckCircle },
  { key: "answers", label: "Answers", icon: MessageSquare },
  { key: "admin-queries", label: "Admin Queries", icon: Bell },
  { key: "notifications", label: "Alerts", icon: Bell },
];

const fadeUp = { hidden: { opacity: 0, y: 15 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05 } }) };

export default function Profile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("questions");
  const [expanded, setExpanded] = useState(null);

  const { data: profileData, isLoading: loadingProfile } = useQuery({ queryKey: ["user-profile"], queryFn: API.getProfile, enabled: !!user });
  const { data: questionsData } = useQuery({ queryKey: ["my-questions", tab === "resolved" ? "resolved" : tab === "questions" ? "" : null], queryFn: () => API.getQuestions(tab === "resolved" ? "resolved" : ""), enabled: !!user && (tab === "questions" || tab === "resolved") });
  const { data: answersData } = useQuery({ queryKey: ["my-answers"], queryFn: API.getAnswers, enabled: !!user && tab === "answers" });
  const { data: notifData, refetch: refetchNotifs } = useQuery({ queryKey: ["my-notifications"], queryFn: API.getNotifications, enabled: !!user && tab === "notifications" });
  const { data: adminQueriesData } = useQuery({ queryKey: ["my-admin-queries"], queryFn: API.getAdminQueries, enabled: !!user && tab === "admin-queries" });

  const markReadMutation = useMutation({ mutationFn: (ids) => API.markRead(ids), onSuccess: () => { refetchNotifs(); queryClient.invalidateQueries({ queryKey: ["user-profile"] }); } });

  const profile = profileData?.user;
  const stats = profileData?.stats;
  const questions = questionsData?.questions || [];
  const answers = answersData?.answers || [];
  const notifications = notifData?.notifications || [];
  const unread = notifData?.unread || 0;
  const adminQueries = adminQueriesData || [];

  if (!user) return null;

  return (
    <div className="min-h-screen relative">
      <div className="orb w-96 h-96 bg-indigo-500 top-10 -right-20" />
      <div className="orb w-72 h-72 bg-purple-500 bottom-10 -left-20" />

      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8 relative z-10">
        {/* Profile header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="card-glass p-6 mb-6 relative overflow-hidden">
          <div className="absolute inset-0 gradient-mesh" />
          <div className="relative z-10 flex items-start gap-5">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-white text-2xl font-bold shrink-0 shadow-xl shadow-indigo-500/20">
              {profile?.name?.[0]?.toUpperCase() || user.name?.[0]?.toUpperCase() || "?"}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{profile?.name || user.name}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {profile?.email || user.email}</span>
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Joined {new Date(profile?.createdAt || user.createdAt).toLocaleDateString()}</span>
                {profile?.role === "admin" && <span className="badge-glow">Admin</span>}
              </div>
              <div className="flex items-center gap-4 mt-3 flex-wrap text-sm">
                <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300"><HelpCircle className="w-4 h-4 text-indigo-400" /> {stats?.totalQuestions || 0} Raised</span>
                <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300"><CheckCircle className="w-4 h-4 text-green-400" /> {stats?.resolvedQuestions || 0} Resolved</span>
                <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300"><MessageSquare className="w-4 h-4 text-blue-400" /> {stats?.totalAnswers || 0} Answers</span>
                <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300"><Award className="w-4 h-4 text-amber-400" /> {stats?.approvedAnswers || 0} Approved</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 glass rounded-2xl p-1.5 overflow-x-auto">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${tab === t.key ? "gradient-primary text-white shadow-lg shadow-indigo-500/20" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"}`}>
              <t.icon className="w-4 h-4" />{t.label}
              {t.key === "notifications" && unread > 0 && <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold">{unread}</span>}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === "questions" && <QuestionsList questions={questions} emptyMsg="You haven't raised any queries yet." expanded={expanded} setExpanded={setExpanded} />}
        {tab === "resolved" && <QuestionsList questions={questions} emptyMsg="No resolved queries yet." resolved expanded={expanded} setExpanded={setExpanded} />}
        {tab === "answers" && <AnswersList answers={answers} expanded={expanded} setExpanded={setExpanded} />}
        {tab === "admin-queries" && <AdminQueriesList queries={adminQueries} expanded={expanded} setExpanded={setExpanded} />}
        {tab === "notifications" && <NotificationsList notifications={notifications} unread={unread} onMarkRead={(ids) => markReadMutation.mutate(ids)} onMarkAllRead={() => markReadMutation.mutate([])} />}
      </div>
    </div>
  );
}

function QuestionsList({ questions, emptyMsg, resolved, expanded, setExpanded }) {
  if (!questions.length) {
    return <div className="text-center py-16 card-glass"><HelpCircle className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" /><p className="text-sm text-gray-500 dark:text-gray-400">{emptyMsg}</p></div>;
  }
  return (
    <div className="space-y-3">
      {questions.map((q) => (
        <motion.div key={q._id} layout className="card-glass overflow-hidden">
          <button onClick={() => setExpanded(expanded === q._id ? null : q._id)} className="w-full p-4 text-left flex items-start gap-3 hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-all">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-medium ${resolved || q.status === "resolved" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"}`}>{q.status || "pending"}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-lg glass font-medium text-gray-500">{q.category}</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{q.title}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{q.description}</p>
              <p className="text-[10px] text-gray-400 mt-1.5">{new Date(q.createdAt).toLocaleDateString()}</p>
            </div>
            {expanded === q._id ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 mt-1" />}
          </button>
          <AnimatePresence>
            {expanded === q._id && (
              <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden border-t border-gray-100 dark:border-gray-700/50">
                <div className="p-4 text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{q.description}</div>
                {q.tags?.length > 0 && <div className="px-4 pb-4 flex gap-1.5 flex-wrap">{q.tags.map((t) => <span key={t} className="px-2 py-0.5 rounded-lg glass text-[10px] text-indigo-600 dark:text-indigo-400">#{t}</span>)}</div>}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}

function AnswersList({ answers }) {
  if (!answers.length) {
    return <div className="text-center py-16 card-glass"><MessageSquare className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" /><p className="text-sm text-gray-500 dark:text-gray-400">You haven't submitted any answers yet.</p></div>;
  }
  return (
    <div className="space-y-3">
      {answers.map((a) => (
        <motion.div key={a._id} layout className="card-glass p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-medium ${a.isApproved ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"}`}>{a.isApproved ? "Approved" : a.status || "Pending"}</span>
            <span className="text-xs text-gray-400">{new Date(a.createdAt).toLocaleDateString()}</span>
            <span className="text-xs text-gray-400 ml-auto">{a.upvotes || 0} upvotes</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">On: <span className="font-medium text-gray-700 dark:text-gray-300">{a.question?.title || "Unknown question"}</span></p>
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{a.content}</p>
        </motion.div>
      ))}
    </div>
  );
}

function AdminQueriesList({ queries, expanded, setExpanded }) {
  if (!queries.length) {
    return <div className="text-center py-16 card-glass"><Bell className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" /><p className="text-sm text-gray-500 dark:text-gray-400">You haven't asked any admin queries yet.</p></div>;
  }
  return (
    <div className="space-y-3">
      {queries.map((q) => (
        <motion.div key={q._id} layout className="card-glass overflow-hidden">
          <button onClick={() => setExpanded(expanded === q._id ? null : q._id)} className="w-full p-4 text-left flex items-start gap-3 hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-all">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-medium ${q.status === "resolved" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"}`}>{q.status}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 font-medium">Admin Query</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{q.title}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{q.description}</p>
              <p className="text-[10px] text-gray-400 mt-1.5">{new Date(q.createdAt).toLocaleDateString()}</p>
            </div>
            {expanded === q._id ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 mt-1" />}
          </button>
          <AnimatePresence>
            {expanded === q._id && (
              <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden border-t border-gray-100 dark:border-gray-700/50">
                <div className="p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap mb-3">{q.description}</p>
                  {q.answer && (
                    <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2 mb-1.5">
                        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <span className="text-xs font-semibold text-green-700 dark:text-green-400">Admin Response</span>
                        {q.resolvedAt && <span className="text-[10px] text-green-500">{new Date(q.resolvedAt).toLocaleDateString()}</span>}
                      </div>
                      <p className="text-sm text-green-800 dark:text-green-300 whitespace-pre-wrap">{q.answer}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}

function NotificationsList({ notifications, unread, onMarkRead, onMarkAllRead }) {
  if (!notifications.length) {
    return <div className="text-center py-16 card-glass"><Bell className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" /><p className="text-sm text-gray-500 dark:text-gray-400">No notifications yet.</p></div>;
  }
  return (
    <div>
      {unread > 0 && (
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-sm text-gray-500 dark:text-gray-400">{unread} unread</span>
          <button onClick={onMarkAllRead} className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"><CheckCheck className="w-3.5 h-3.5" /> Mark all read</button>
        </div>
      )}
      <div className="space-y-2">
        {notifications.map((n) => (
          <motion.div key={n._id} layout className={`p-4 rounded-2xl border transition-all ${n.read ? "card-glass" : "card-glass border-indigo-200 dark:border-indigo-800 glow-sm"}`}>
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${n.read ? "bg-gray-300 dark:bg-gray-600" : "bg-indigo-500 animate-pulse"}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-1.5 py-0.5 rounded-lg text-[10px] font-medium ${
                    n.type === "success" ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" :
                    n.type === "warning" ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" :
                    n.type === "error" ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" :
                    "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                  }`}>{n.type}</span>
                  <span className="text-[10px] text-gray-400">{new Date(n.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">{n.message}</p>
                {n.link && <a href={n.link} className="text-xs text-indigo-500 hover:underline mt-1 inline-block font-medium">View details →</a>}
              </div>
              {!n.read && (
                <button onClick={() => onMarkRead([n._id])} className="p-1 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/20 text-indigo-400 transition-all" title="Mark read"><CheckCheck className="w-4 h-4" /></button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
