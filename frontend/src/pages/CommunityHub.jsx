import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  Check,
  CheckCheck,
  Send,
  AlertTriangle,
  Users,
  ClipboardList,
  X,
  CheckSquare,
  Square,
  BookOpen,
  Loader2,
  Eye,
} from "lucide-react";
import toast from "react-hot-toast";
import { questionAPI, answerAPI, adminAPI } from "../api";
import { useAuth } from "../context/AuthContext";
import { QuestionSkeleton } from "../components/ui/Skeleton";

export default function CommunityHub() {
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [answers, setAnswers] = useState({});
  const [newAnswers, setNewAnswers] = useState({});
  const [selectedQuestions, setSelectedQuestions] = useState(new Set());
  const [filter, setFilter] = useState("pending");
  const [resolveTarget, setResolveTarget] = useState(null);

  const { data: questionsData, isLoading } = useQuery({
    queryKey: ["questions", filter],
    queryFn: () => questionAPI.getAll({ status: filter }),
  });

  const questions = questionsData?.questions || [];

  const resolveMutation = useMutation({
    mutationFn: (answerId) => adminAPI.approveAnswer(answerId),
    onSuccess: () => {
      toast.success("Question resolved and published to FAQs!");
      setResolveTarget(null);
      queryClient.invalidateQueries({ queryKey: ["questions"] });
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to resolve"),
  });

  const handleToggleQuestion = async (qId) => {
    if (expandedQuestion === qId) {
      setExpandedQuestion(null);
      return;
    }
    setExpandedQuestion(qId);
    try {
      const answersData = await answerAPI.getByQuestion(qId);
      setAnswers((prev) => ({ ...prev, [qId]: answersData }));
    } catch {
      toast.error("Failed to load answers");
    }
  };

  const submitAnswer = async (questionId) => {
    const content = newAnswers[questionId];
    if (!content?.trim()) return toast.error("Please write an answer");
    if (!user) return toast.error("Please login to answer");
    try {
      const newAnswer = await answerAPI.create(questionId, { content });
      setAnswers((prev) => ({ ...prev, [questionId]: [...(prev[questionId] || []), newAnswer] }));
      setNewAnswers((prev) => ({ ...prev, [questionId]: "" }));
      toast.success("Answer submitted!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit answer");
    }
  };

  const handleUpvote = async (answerId, questionId) => {
    if (!user) return toast.error("Please login to vote");
    try {
      const result = await answerAPI.upvote(answerId);
      setAnswers((prev) => ({
        ...prev,
        [questionId]: prev[questionId]?.map((a) =>
          a._id === answerId ? { ...a, upvotes: result.upvotes, upvotedBy: result.upvotedBy } : a
        ),
      }));
    } catch {
      toast.error("Failed to upvote");
    }
  };

  const handleGroupQueries = async () => {
    const ids = Array.from(selectedQuestions);
    if (ids.length < 2) return toast.error("Select at least 2 questions");
    try {
      await adminAPI.groupQueries(ids);
      toast.success("Queries grouped successfully");
      setSelectedQuestions(new Set());
      queryClient.invalidateQueries({ queryKey: ["questions"] });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to group queries");
    }
  };

  const toggleSelect = (id) => {
    setSelectedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const hasUpvoted = (answer) => answer.upvotedBy?.includes(user?._id);

  return (
    <div className="min-h-screen relative">
      <div className="orb w-96 h-96 bg-purple-500 top-10 -right-20" />
      <div className="orb w-72 h-72 bg-indigo-500 bottom-10 -left-20" />
      <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8 relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-3">
              <MessageSquare className="w-4 h-4 text-indigo-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Community</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Community Q&A</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {isAdmin ? "Moderate and manage community questions" : "Help others by answering questions"}
            </p>
          </div>
          {isAdmin && (
            <div className="flex items-center gap-2">
              {selectedQuestions.size >= 2 && (
                <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} onClick={handleGroupQueries}
                  className="btn-primary flex items-center gap-2"><span><Users className="w-4 h-4 inline mr-1" /> Group ({selectedQuestions.size})</span></motion.button>
              )}
            </div>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 mb-6 glass rounded-2xl p-1.5 overflow-x-auto">
          {[
            { key: "pending", label: "Pending", icon: AlertTriangle, color: "amber" },
            { key: "resolved", label: "Resolved", icon: Check, color: "green" },
            { key: "", label: "All", icon: null, color: "gray" },
          ].map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                filter === f.key ? "gradient-primary text-white shadow-lg shadow-indigo-500/20" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
              }`}>
              {f.icon && <f.icon className="w-4 h-4" />}{f.label}
            </button>
          ))}
        </div>

        {isAdmin && selectedQuestions.size > 0 && (
          <div className="mb-4 p-3 glass rounded-2xl border border-indigo-200 dark:border-indigo-800 flex items-center justify-between">
            <span className="text-sm text-indigo-700 dark:text-indigo-300">
              {selectedQuestions.size} question(s) selected for grouping
            </span>
            <button
              onClick={() => setSelectedQuestions(new Set())}
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Clear selection
            </button>
          </div>
        )}

        {isLoading ? (
          <QuestionSkeleton />
        ) : questions.length === 0 ? (
          <div className="text-center py-16 card-glass">
            <ClipboardList className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400">No questions yet</h3>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Be the first to ask something!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((question) => (
              <motion.div
                key={question._id}
                layout
                className="card-glass overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex items-start gap-3">
                    {isAdmin && (
                      <button
                        onClick={() => toggleSelect(question._id)}
                        className="mt-1 text-gray-400 hover:text-indigo-500 transition-colors"
                      >
                        {selectedQuestions.has(question._id) ? (
                          <CheckSquare className="w-5 h-5 text-indigo-500" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {question.author?.name?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {question.author?.name || "Anonymous"}
                          </span>
                          <span className="text-xs text-gray-400 ml-2">
                            {new Date(question.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <span className={`ml-auto px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          question.status === "resolved"
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                            : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                        }`}>
                          {question.status}
                        </span>
                      </div>

                      <button
                        onClick={() => handleToggleQuestion(question._id)}
                        className="w-full text-left"
                      >
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                          {question.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                          {question.description}
                        </p>
                      </button>

                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-400">
                          {question.category}
                        </span>
                        {question.tags?.map((tag) => (
                          <span key={tag} className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-xs text-indigo-600 dark:text-indigo-400">
                            #{tag}
                          </span>
                        ))}
                        <button
                          onClick={() => handleToggleQuestion(question._id)}
                          className="ml-auto text-xs text-gray-400 hover:text-indigo-500 transition-colors flex items-center gap-1"
                        >
                          {expandedQuestion === question._id ? (
                            <><ChevronUp className="w-4 h-4" /> Hide answers</>
                          ) : (
                            <><ChevronDown className="w-4 h-4" /> Show answers</>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedQuestion === question._id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-t border-gray-100 dark:border-gray-700"
                    >
                      <div className="p-5 space-y-4">
                        {(answers[question._id] || [])
                          .sort((a, b) => b.upvotes - a.upvotes)
                          .map((answer) => (
                            <motion.div
                              key={answer._id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`p-4 rounded-xl border ${
                                answer.isApproved
                                  ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10"
                                  : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                  {answer.author?.name?.[0]?.toUpperCase() || "?"}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                      {answer.author?.name || "Anonymous"}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                      {new Date(answer.createdAt).toLocaleDateString()}
                                    </span>
                                    {answer.isApproved && (
                                      <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 flex items-center gap-1">
                                        <CheckCheck className="w-3 h-3" /> Approved
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                                    {answer.content}
                                  </p>
                                  <div className="flex items-center gap-3 mt-3">
                                    <button
                                      onClick={() => handleUpvote(answer._id, question._id)}
                                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                        hasUpvoted(answer)
                                          ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                                          : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                                      }`}
                                    >
                                      <ThumbsUp className="w-3.5 h-3.5" /> {answer.upvotes || 0}
                                    </button>
                                    {isAdmin && !answer.isApproved && (
                                      <button
                                        onClick={() => setResolveTarget({ answer, question })}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
                                      >
                                        <BookOpen className="w-3.5 h-3.5" /> Resolve &amp; Publish
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}

                        {user && (
                          <div className="flex gap-2">
                            <textarea
                              value={newAnswers[question._id] || ""}
                              onChange={(e) =>
                                setNewAnswers((prev) => ({ ...prev, [question._id]: e.target.value }))
                              }
                              placeholder="Write your answer..."
                              rows={2}
                              className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none text-sm"
                            />
                            <button
                              onClick={() => submitAnswer(question._id)}
                              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors self-end"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Resolve modal */}
      <AnimatePresence>
        {resolveTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setResolveTarget(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-lg overflow-hidden"
            >
              <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-500" />
                    Resolve &amp; Publish to FAQ
                  </h3>
                  <button onClick={() => setResolveTarget(null)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  This will mark the question as <strong>resolved</strong> and publish the answer as a new FAQ entry visible to everyone.
                </p>

                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
                  <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-1">Question</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{resolveTarget.question.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">{resolveTarget.question.category}</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Answer by</p>
                    <span className="text-xs text-gray-900 dark:text-white">{resolveTarget.answer.author?.name || "Anonymous"}</span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap line-clamp-4">{resolveTarget.answer.content}</p>
                </div>

                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-1">
                    <Eye className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <p className="text-xs font-medium text-green-700 dark:text-green-400">FAQ Preview</p>
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Q: {resolveTarget.question.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">A: {resolveTarget.answer.content}</p>
                </div>
              </div>

              <div className="p-5 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-3">
                <button
                  onClick={() => setResolveTarget(null)}
                  className="px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => resolveMutation.mutate(resolveTarget.answer._id)}
                  disabled={resolveMutation.isPending}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  {resolveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />}
                  Publish as FAQ
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
