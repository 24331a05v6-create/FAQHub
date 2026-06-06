import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  CheckCircle,
  XCircle,
  RefreshCw,
  MessageSquare,
  Clock,
  User,
  ThumbsUp,
  Edit3,
  AlertTriangle,
  ChevronRight,
  Search,
} from "lucide-react";
import toast from "react-hot-toast";
import { adminAPI } from "../api";
import { useAuth } from "../context/AuthContext";
import { QuestionSkeleton } from "../components/ui/Skeleton";

export default function ModerationDashboard() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [rejectModal, setRejectModal] = useState(null);
  const [changesModal, setChangesModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [changeNotes, setChangeNotes] = useState("");

  const { data: pending, isLoading } = useQuery({
    queryKey: ["moderation-pending"],
    queryFn: adminAPI.getModerationPending,
    refetchInterval: 15000,
  });

  const { data: stats } = useQuery({
    queryKey: ["moderation-stats"],
    queryFn: adminAPI.getModerationStats,
  });

  const { data: pendingCount } = useQuery({
    queryKey: ["moderation-pending-count"],
    queryFn: adminAPI.getModerationPendingCount,
    refetchInterval: 15000,
  });

  const approveMutation = useMutation({
    mutationFn: adminAPI.moderateApprove,
    onSuccess: () => {
      toast.success("Answer approved");
      queryClient.invalidateQueries({ queryKey: ["moderation-pending"] });
      queryClient.invalidateQueries({ queryKey: ["moderation-pending-count"] });
      queryClient.invalidateQueries({ queryKey: ["moderation-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-analytics"] });
    },
    onError: () => toast.error("Failed to approve answer"),
  });

  const rejectMutation = useMutation({
    mutationFn: (data) => adminAPI.moderateReject(rejectModal, data),
    onSuccess: () => {
      toast.success("Answer rejected");
      setRejectModal(null);
      setRejectReason("");
      queryClient.invalidateQueries({ queryKey: ["moderation-pending"] });
      queryClient.invalidateQueries({ queryKey: ["moderation-pending-count"] });
      queryClient.invalidateQueries({ queryKey: ["moderation-stats"] });
    },
    onError: () => toast.error("Failed to reject answer"),
  });

  const changesMutation = useMutation({
    mutationFn: (data) => adminAPI.moderateRequestChanges(changesModal, data),
    onSuccess: () => {
      toast.success("Changes requested");
      setChangesModal(null);
      setChangeNotes("");
      queryClient.invalidateQueries({ queryKey: ["moderation-pending"] });
      queryClient.invalidateQueries({ queryKey: ["moderation-pending-count"] });
      queryClient.invalidateQueries({ queryKey: ["moderation-stats"] });
    },
    onError: () => toast.error("Failed to request changes"),
  });

  const handleKeyDown = useCallback((e, answerId) => {
    if (e.key === "a" || e.key === "A") {
      if (!e.repeat) approveMutation.mutate(answerId);
    }
    if (e.key === "r" || e.key === "R") {
      if (!e.repeat) setRejectModal(answerId);
    }
    if (e.key === "c" || e.key === "C") {
      if (!e.repeat) setChangesModal(answerId);
    }
  }, [approveMutation]);

  const filtered = pending?.filter((a) =>
    a.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.question?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-xl shadow-indigo-500/20">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Moderation Queue</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {pendingCount?.count || 0} pending reviews
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {stats && (
              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 glass rounded-xl px-4 py-2">
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-yellow-500" />{stats.pending} pending</span>
                <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-green-500" />{stats.approved} approved</span>
                <span className="flex items-center gap-1"><XCircle className="w-3.5 h-3.5 text-red-500" />{stats.rejected} rejected</span>
              </div>
            )}
            <button onClick={() => queryClient.invalidateQueries({ queryKey: ["moderation-pending"] })}
              className="p-2 rounded-xl glass text-gray-500 hover:text-indigo-500 transition-all">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by answer content or question title..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm" />
        </div>

        <div className="text-xs text-gray-400 mb-3 flex items-center gap-4">
          <span><kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 font-mono">A</kbd> Approve</span>
          <span><kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 font-mono">R</kbd> Reject</span>
          <span><kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 font-mono">C</kbd> Request Changes</span>
        </div>

        {isLoading ? (
          <div className="space-y-3"><QuestionSkeleton /><QuestionSkeleton /><QuestionSkeleton /></div>
        ) : filtered?.length === 0 ? (
          <div className="text-center py-16">
            <CheckCircle className="w-16 h-16 mx-auto text-green-300 dark:text-green-700 mb-4" />
            <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400">Queue is clear</h3>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">All answers have been reviewed</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered?.map((answer) => (
              <motion.div
                key={answer._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                tabIndex={0}
                onKeyDown={(e) => handleKeyDown(e, answer._id)}
                className="card-glass p-5 group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                        {answer.question?.title || "Unknown Question"}
                      </span>
                      <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500">
                        {answer.question?.category || "Uncategorized"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap line-clamp-3">
                      {answer.content}
                    </p>
                    <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><User className="w-3 h-3" />{answer.author?.name || "Anonymous"}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(answer.createdAt).toLocaleDateString()}</span>
                      {answer.question?.author && (
                        <span>Asked by {answer.question.author.name}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => approveMutation.mutate(answer._id)}
                      className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
                      title="Approve (A)">
                      <CheckCircle className="w-5 h-5" />
                    </button>
                    <button onClick={() => setRejectModal(answer._id)}
                      className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                      title="Reject (R)">
                      <XCircle className="w-5 h-5" />
                    </button>
                    <button onClick={() => setChangesModal(answer._id)}
                      className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
                      title="Request Changes (C)">
                      <Edit3 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Reject Modal */}
        <AnimatePresence>
          {rejectModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
              onClick={() => { setRejectModal(null); setRejectReason(""); }}>
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 w-full max-w-md shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Reject Answer</h3>
                    <p className="text-xs text-gray-500">Provide a reason for rejection</p>
                  </div>
                </div>
                <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Reason for rejection..."
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-sm min-h-[100px] resize-none" />
                <div className="flex items-center gap-2 mt-4 justify-end">
                  <button onClick={() => { setRejectModal(null); setRejectReason(""); }}
                    className="px-4 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">Cancel</button>
                  <button onClick={() => rejectMutation.mutate(rejectReason || "Does not meet quality standards")}
                    className="px-4 py-2 rounded-lg text-sm bg-red-500 hover:bg-red-600 text-white transition-colors flex items-center gap-1.5">
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Changes Modal */}
        <AnimatePresence>
          {changesModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
              onClick={() => { setChangesModal(null); setChangeNotes(""); }}>
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 w-full max-w-md shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <Edit3 className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Request Changes</h3>
                    <p className="text-xs text-gray-500">Provide notes on what to improve</p>
                  </div>
                </div>
                <textarea value={changeNotes} onChange={(e) => setChangeNotes(e.target.value)}
                  placeholder="What changes are needed?"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-sm min-h-[100px] resize-none" />
                <div className="flex items-center gap-2 mt-4 justify-end">
                  <button onClick={() => { setChangesModal(null); setChangeNotes(""); }}
                    className="px-4 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">Cancel</button>
                  <button onClick={() => changesMutation.mutate(changeNotes || "Please revise your answer")}
                    className="px-4 py-2 rounded-lg text-sm bg-amber-500 hover:bg-amber-600 text-white transition-colors flex items-center gap-1.5">
                    <Edit3 className="w-4 h-4" /> Request Changes
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
    </>
  );
}
