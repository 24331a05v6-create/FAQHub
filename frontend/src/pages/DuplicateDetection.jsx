import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Copy,
  GitMerge,
  Search,
  CheckCircle,
  XCircle,
  Sliders,
  RefreshCw,
  FileText,
  HelpCircle,
  Percent,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";
import { adminAPI } from "../api";
import { QuestionSkeleton } from "../components/ui/Skeleton";

export default function DuplicateDetection() {
  const queryClient = useQueryClient();
  const [results, setResults] = useState(null);
  const [mergeModal, setMergeModal] = useState(null);
  const [mergeAnswerMode, setMergeAnswerMode] = useState("keep_primary");
  const [similarityTextA, setSimilarityTextA] = useState("");
  const [similarityTextB, setSimilarityTextB] = useState("");
  const [similarityResult, setSimilarityResult] = useState(null);

  const detectMutation = useMutation({
    mutationFn: adminAPI.detectDuplicates,
    onSuccess: (data) => { setResults(data); toast.success("Detection complete"); },
    onError: () => toast.error("Failed to detect duplicates"),
  });

  const mergeMutation = useMutation({
    mutationFn: (data) => adminAPI.mergeDuplicates(data),
    onSuccess: () => {
      toast.success("Duplicates merged");
      setMergeModal(null);
      setMergeAnswerMode("keep_primary");
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
    },
    onError: () => toast.error("Failed to merge"),
  });

  const checkSimilarityMutation = useMutation({
    mutationFn: () => adminAPI.checkSimilarity(similarityTextA, similarityTextB),
    onSuccess: (data) => setSimilarityResult(data),
    onError: () => toast.error("Failed to check similarity"),
  });

  const handleMerge = () => {
    if (!mergeModal) return;
    mergeMutation.mutate({
      primaryId: mergeModal.primaryId,
      duplicateIds: [mergeModal.duplicateId],
      type: mergeModal.type,
      mergeAnswer: mergeAnswerMode,
    });
  };

  return (
    <div className="min-h-screen relative">
      <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center">
              <Copy className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Duplicate Detection</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {results ? `${results.highCount} high confidence · ${results.possibleCount} possible` : "TF-IDF cosine similarity analysis"}
              </p>
            </div>
          </div>
          <button onClick={() => detectMutation.mutate()} disabled={detectMutation.isPending}
            className="px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white text-sm font-medium transition-colors flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${detectMutation.isPending ? "animate-spin" : ""}`} />
            Run Detection
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Detection results */}
          <div className="lg:col-span-2 space-y-4">
            {!results ? (
              <div className="text-center py-16 card-glass">
                <Search className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400">No results yet</h3>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Click "Run Detection" to scan for duplicates</p>
              </div>
            ) : (
              <>
                <div className="card-glass p-5">
                  <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-5 h-5 text-red-500" /> High Confidence ({results.highCount})
                  </h2>
                  {results.highConfidence.length === 0 ? (
                    <p className="text-sm text-gray-400">None found</p>
                  ) : (
                    <div className="space-y-2">
                      {results.highConfidence.map((pair, i) => (
                        <DuplicatePair key={i} pair={pair} onMerge={setMergeModal} />
                      ))}
                    </div>
                  )}
                </div>

                <div className="card-glass p-5">
                  <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                    <Sliders className="w-5 h-5 text-amber-500" /> Possible ({results.possibleCount})
                  </h2>
                  {results.possible.length === 0 ? (
                    <p className="text-sm text-gray-400">None found</p>
                  ) : (
                    <div className="space-y-2">
                      {results.possible.map((pair, i) => (
                        <DuplicatePair key={i} pair={pair} onMerge={setMergeModal} />
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Similarity checker side panel */}
          <div className="card-glass p-5 h-fit sticky top-24">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <Percent className="w-5 h-5 text-indigo-500" /> Manual Check
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Text A</label>
                <textarea value={similarityTextA} onChange={(e) => setSimilarityTextA(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm resize-none h-20 outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Text B</label>
                <textarea value={similarityTextB} onChange={(e) => setSimilarityTextB(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm resize-none h-20 outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <button onClick={() => checkSimilarityMutation.mutate()} disabled={!similarityTextA || !similarityTextB || checkSimilarityMutation.isPending}
                className="w-full py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-sm font-medium transition-colors">
                Check Similarity
              </button>
              {similarityResult && (
                <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {(similarityResult.similarity * 100).toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500">similarity score</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Merge Modal */}
        <AnimatePresence>
          {mergeModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
              onClick={() => setMergeModal(null)}>
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 w-full max-w-lg shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                    <GitMerge className="w-5 h-5 text-rose-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Merge Duplicates</h3>
                    <p className="text-xs text-gray-500">Keep primary, merge duplicate into it</p>
                  </div>
                </div>
                <div className="space-y-3 mb-4">
                  <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800">
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mb-1">Primary</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{mergeModal.a.text}</p>
                  </div>
                  <div className="flex justify-center text-gray-400"><GitMerge className="w-5 h-5" /></div>
                  <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800">
                    <p className="text-xs text-rose-600 dark:text-rose-400 font-medium mb-1">Duplicate</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{mergeModal.b.text}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Answer merge strategy</label>
                    <select value={mergeAnswerMode} onChange={(e) => setMergeAnswerMode(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm outline-none">
                      <option value="keep_primary">Keep primary answer</option>
                      <option value="longer">Keep longer answer</option>
                      <option value="combine">Combine both answers</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-2 justify-end">
                  <button onClick={() => setMergeModal(null)}
                    className="px-4 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">Cancel</button>
                  <button onClick={handleMerge}
                    className="px-4 py-2 rounded-lg text-sm bg-rose-500 hover:bg-rose-600 text-white transition-colors flex items-center gap-1.5">
                    <GitMerge className="w-4 h-4" /> Merge
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function DuplicatePair({ pair, onMerge }) {
  return (
    <div className="p-3 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-1">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">{pair.a.type}</span>
            <span className="text-xs text-gray-500 line-clamp-1">{pair.a.text}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400">{pair.b.type}</span>
            <span className="text-xs text-gray-500 line-clamp-1">{pair.b.text}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-xs font-bold px-2 py-1 rounded ${pair.similarity > 0.85 ? "bg-red-100 dark:bg-red-900/30 text-red-600" : "bg-amber-100 dark:bg-amber-900/30 text-amber-600"}`}>
            {(pair.similarity * 100).toFixed(0)}%
          </span>
          <button onClick={() => onMerge({ primaryId: pair.a.id, duplicateId: pair.b.id, type: pair.a.type, a: pair.a, b: pair.b })}
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-rose-500 transition-colors">
            <GitMerge className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

