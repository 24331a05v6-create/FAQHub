import { useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Tag, HelpCircle, ArrowLeft, Search, Lightbulb, ExternalLink, CheckCircle, Loader2, FileText, X, Square, CheckSquare,
} from "lucide-react";
import toast from "react-hot-toast";
import { questionAPI, faqAPI } from "../api";
import { useAuth } from "../context/AuthContext";

export default function RaiseQuery() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: searchParams.get("title") || "",
    description: "",
    category: "",
    tags: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [searched, setSearched] = useState(false);
  const [bypassed, setBypassed] = useState(false);
  const [searchTitle, setSearchTitle] = useState("");
  const [checkFAQs, setCheckFAQs] = useState(false);
  const resultsRef = useRef(null);

  const { data: categoriesData } = useQuery({
    queryKey: ["faq-categories"],
    queryFn: faqAPI.getCategories,
  });
  const categories = categoriesData || [];

  const { data: suggestions, isFetching: searching } = useQuery({
    queryKey: ["faq-manual-search", searchTitle],
    queryFn: () => faqAPI.search(searchTitle),
    enabled: searchTitle.length >= 3,
  });

  const handleCheckFAQs = () => {
    if (!form.title.trim()) return;
    setSearchTitle(form.title);
    setSearched(true);
    setBypassed(false);
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  const handleToggleCheck = () => {
    if (checkFAQs) {
      setCheckFAQs(false);
      setSearched(false);
      setBypassed(false);
      setSearchTitle("");
    } else {
      if (!form.title.trim()) return;
      setCheckFAQs(true);
      handleCheckFAQs();
    }
  };

  const matched = suggestions?.faqs?.length > 0;
  const showBlock = searched && !bypassed && matched;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return toast.error("Please login to raise a query");
    if (!form.title.trim() || !form.description.trim() || !form.category) {
      return toast.error("Please fill in all required fields");
    }
    setSubmitting(true);
    try {
      await questionAPI.create({
        title: form.title,
        description: form.description,
        category: form.category,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      });
      toast.success("Question submitted successfully!");
      navigate("/community-qa");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit question");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDismiss = () => {
    setSearched(false);
    setBypassed(false);
    setSearchTitle("");
  };

  return (
    <div className="min-h-screen relative">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

            <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 mb-4">
              <HelpCircle className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Raise a Query</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Before raising a query, please refer to matching FAQs by checking your query using the check button.</p>
          </div>

          <form onSubmit={handleSubmit} className={`card-glass p-8 space-y-6 transition-all ${showBlock ? "opacity-40 pointer-events-none" : ""}`}>
            {/* Title + Checkbox */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => { setForm({ ...form, title: e.target.value }); setCheckFAQs(false); setSearched(false); setBypassed(false); }}
                placeholder="e.g., How do I reset my password?"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
              <label
                onClick={handleToggleCheck}
                className={`inline-flex items-center gap-2 mt-2.5 px-3 py-1.5 rounded-lg cursor-pointer transition-all select-none text-sm font-medium ${checkFAQs ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"}`}
              >
                {checkFAQs ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                {searching ? "Searching FAQs..." : "Check if this already exists in FAQs"}
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={6}
                placeholder="Describe your question in detail..."
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-y"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Tags <span className="text-gray-400">(optional)</span>
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={form.tags}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                    placeholder="password, reset, account"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || showBlock}
              className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
              ) : showBlock ? (
                <><Search className="w-4 h-4" /> Review FAQs above first</>
              ) : (
                <><Send className="w-4 h-4" /> Submit Question</>
              )}
            </button>
          </form>

          {/* Suggestions results */}
          <AnimatePresence>
            {searched && (
              <motion.div
                ref={resultsRef}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-6"
              >
                {searching ? (
                  <div className="card-glass p-8 text-center">
                    <Loader2 className="w-8 h-8 mx-auto text-indigo-500 animate-spin mb-3" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">Searching FAQs for matching questions...</p>
                  </div>
                ) : matched ? (
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border-2 border-emerald-200 dark:border-emerald-800 p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        <h3 className="font-semibold text-emerald-800 dark:text-emerald-300">
                          Found {suggestions.total} matching FAQ{suggestions.total > 1 ? "s" : ""}
                        </h3>
                      </div>
                      <button onClick={handleDismiss} className="p-1 rounded hover:bg-emerald-100 dark:hover:bg-emerald-800 text-emerald-500 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-emerald-700 dark:text-emerald-400 mb-3">
                      These existing FAQs look similar. Please check if any answer your question:
                    </p>
                    <div className="space-y-2 mb-4">
                      {suggestions.faqs.slice(0, 5).map((faq) => (
                        <a
                          key={faq._id}
                          href={`/faq?q=${encodeURIComponent(faq.question)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-gray-800 border border-emerald-200 dark:border-emerald-700 hover:border-emerald-400 dark:hover:border-emerald-500 transition-colors group"
                        >
                          <span className="text-[10px] font-mono text-emerald-400 mt-0.5 shrink-0">#{faq.faqNumber || "?"}</span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                              {faq.question}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">{faq.category}</span>
                              {faq.answer && <span className="text-[10px] text-emerald-500 line-clamp-1">{faq.answer.substring(0, 80)}...</span>}
                            </div>
                          </div>
                          <ExternalLink className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        </a>
                      ))}
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setBypassed(true)}
                        className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors"
                      >
                        <CheckCircle className="w-4 h-4 inline mr-1.5" /> None of these answer my question
                      </button>
                      <button
                        onClick={() => navigate("/faq")}
                        className="px-4 py-2.5 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                      >
                        Browse all FAQs
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 text-center">
                    <Lightbulb className="w-8 h-8 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">No matching FAQs found for "<strong>{searchTitle}</strong>"</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">You can proceed with raising your query.</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Helper text */}
          {!searched && (
            <div className="mt-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 text-center">
              <p className="text-sm text-amber-700 dark:text-amber-400">
                Before raising a query, please refer to matching FAQs by <strong>checking your query using the check button</strong>.
              </p>
            </div>
          )}

          {/* Bypass link when blocked */}
          {showBlock && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setBypassed(true)}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 underline transition-colors"
              >
                I've reviewed them, let me submit anyway
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

