import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, CheckCircle, Loader2, Send, User, Mail, Clock } from "lucide-react";
import toast from "react-hot-toast";
import { adminQueryAPI } from "../api";

export default function AdminQueries() {
  const queryClient = useQueryClient();
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [answer, setAnswer] = useState("");

  const { data: queries = [], isLoading } = useQuery({
    queryKey: ["admin-queries-pending"],
    queryFn: adminQueryAPI.getPending,
  });

  const resolveMutation = useMutation({
    mutationFn: ({ id, answer }) => adminQueryAPI.resolve(id, answer),
    onSuccess: () => {
      toast.success("Query resolved! Student has been notified.");
      queryClient.invalidateQueries(["admin-queries-pending"]);
      setSelectedQuery(null);
      setAnswer("");
    },
    onError: () => toast.error("Failed to resolve query"),
  });

  const handleResolve = () => {
    if (!answer.trim()) return toast.error("Please enter an answer");
    resolveMutation.mutate({ id: selectedQuery._id, answer });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Student Admin Queries</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Questions only you can solve</p>
        </div>
      </div>

      {isLoading ? (
        <div className="card-glass p-8 text-center">
          <Loader2 className="w-8 h-8 mx-auto text-indigo-500 animate-spin" />
        </div>
      ) : queries.length === 0 ? (
        <div className="card-glass p-12 text-center">
          <CheckCircle className="w-16 h-16 mx-auto text-green-300 dark:text-green-700 mb-4" />
          <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400">All clear!</h3>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">No pending admin queries</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Query list */}
          <div className="lg:col-span-1 space-y-2">
            <p className="text-xs font-semibold uppercase text-gray-400 mb-2 px-1">Pending ({queries.length})</p>
            {queries.map((q) => (
              <motion.button
                key={q._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => { setSelectedQuery(q); setAnswer(""); }}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selectedQuery?._id === q._id
                    ? "border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 shadow-sm"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-amber-200 dark:hover:border-amber-800"
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{q.author?.name}</span>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">{q.title}</p>
                <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-400">
                  <Clock className="w-3 h-3" />
                  {new Date(q.createdAt).toLocaleDateString()}
                </div>
              </motion.button>
            ))}
          </div>

          {/* Detail + answer */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {selectedQuery ? (
                <motion.div
                  key={selectedQuery._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="card-glass p-6 space-y-4"
                >
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                        <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{selectedQuery.author?.name}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {selectedQuery.author?.email}
                        </p>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedQuery.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 whitespace-pre-wrap">{selectedQuery.description}</p>
                    <p className="text-[10px] text-gray-400 mt-3 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Submitted {new Date(selectedQuery.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Your Answer
                    </label>
                    <textarea
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      rows={5}
                      placeholder="Write your response to this student..."
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all resize-y"
                    />
                  </div>

                  <button
                    onClick={handleResolve}
                    disabled={resolveMutation.isPending || !answer.trim()}
                    className="w-full py-3 px-6 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {resolveMutation.isPending ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Resolving...</>
                    ) : (
                      <><Send className="w-4 h-4" /> Resolve & Notify Student</>
                    )}
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="card-glass p-12 text-center"
                >
                  <MessageSquare className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-sm text-gray-400">Select a query to view details and respond</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
