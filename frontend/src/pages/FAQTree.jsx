import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Folder, FolderOpen, ChevronRight, ChevronLeft, Search, BookOpen, FileText, ArrowLeft, Loader2,
} from "lucide-react";
import { faqAPI } from "../api";

export default function FAQTree() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [search, setSearch] = useState("");

  const { data: faqsData, isLoading } = useQuery({
    queryKey: ["faqs-tree"],
    queryFn: () => faqAPI.getAll({ limit: 200 }),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["faq-categories"],
    queryFn: faqAPI.getCategories,
  });

  const faqs = faqsData?.faqs || [];
  const categories = categoriesData || [];

  const filteredFAQs = faqs.filter((faq) => {
    if (!faq.category || faq.category !== selectedCategory) return false;
    if (search) {
      const q = search.toLowerCase();
      return faq.question?.toLowerCase().includes(q) || faq.answer?.toLowerCase().includes(q);
    }
    return true;
  });

  const categoryFAQs = faqs.filter((faq) => faq.category === selectedCategory);

  const handleCategoryClick = (cat) => {
    setSelectedCategory(cat);
    setSelectedQuestion(null);
    setSearch("");
  };

  const handleBack = () => {
    if (selectedQuestion) {
      setSelectedQuestion(null);
    } else if (selectedCategory) {
      setSelectedCategory(null);
      setSearch("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a]">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <button onClick={handleBack}
            className={`flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-4 transition-colors ${!selectedCategory ? "invisible" : ""}`}
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 mb-4">
              <BookOpen className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">FAQ Explorer</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Browse by category → question → answer</p>
          </div>
        </motion.div>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-4 text-sm">
          <span className={`cursor-pointer ${!selectedCategory ? "text-indigo-600 dark:text-indigo-400 font-medium" : "text-gray-400 hover:text-indigo-500"}`}
            onClick={() => { setSelectedCategory(null); setSelectedQuestion(null); setSearch(""); }}>
            Categories
          </span>
          {selectedCategory && (
            <>
              <ChevronRight className="w-3 h-3 text-gray-400" />
              <span className={`cursor-pointer ${!selectedQuestion ? "text-indigo-600 dark:text-indigo-400 font-medium" : "text-gray-400 hover:text-indigo-500"}`}
                onClick={() => setSelectedQuestion(null)}>
                {selectedCategory}
              </span>
            </>
          )}
          {selectedQuestion && (
            <>
              <ChevronRight className="w-3 h-3 text-gray-400" />
              <span className="text-indigo-600 dark:text-indigo-400 font-medium truncate max-w-[200px]">
                {selectedQuestion.question}
              </span>
            </>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <Loader2 className="w-8 h-8 mx-auto text-indigo-500 animate-spin" />
          </div>
        ) : !selectedCategory ? (
          /* LEVEL 1: Categories */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
          >
            {categories.map((cat, i) => {
              const count = faqs.filter((f) => f.category === cat).length;
              return (
                <motion.button
                  key={cat}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleCategoryClick(cat)}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 text-left hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mb-3 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
                    <Folder className="w-5 h-5 text-indigo-500 group-hover:text-indigo-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm">{cat}</h3>
                  <p className="text-xs text-gray-400 mt-1">{count} question{count !== 1 ? "s" : ""}</p>
                </motion.button>
              );
            })}
          </motion.div>
        ) : !selectedQuestion ? (
          /* LEVEL 2: Questions List */
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-indigo-500" />
                  <h2 className="font-semibold text-gray-900 dark:text-white">{selectedCategory}</h2>
                  <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                    {categoryFAQs.length} questions
                  </span>
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search questions..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
            <div className="max-h-[500px] overflow-y-auto">
              {filteredFAQs.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">
                  No questions found
                </div>
              ) : (
                filteredFAQs.map((faq, i) => (
                  <button
                    key={faq._id}
                    onClick={() => setSelectedQuestion(faq)}
                    className="w-full text-left px-4 py-3 border-b border-gray-100 dark:border-gray-700/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-colors flex items-center gap-3 group"
                  >
                    <span className="text-[10px] font-mono text-indigo-400 w-6 text-right shrink-0">
                      #{faq.faqNumber || "?"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                        {faq.question}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                  </button>
                ))
              )}
            </div>
          </motion.div>
        ) : (
          /* LEVEL 3: Answer Display */
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-indigo-400">#{selectedQuestion.faqNumber || "?"}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                  {selectedQuestion.category}
                </span>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedQuestion.question}</h2>
              {selectedQuestion.tags?.length > 0 && (
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {selectedQuestion.tags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-[10px] text-gray-500">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-green-600 dark:text-green-400">Answer</span>
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {selectedQuestion.answer}
              </div>
              <div className="flex items-center gap-4 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-400">
                <span>{selectedQuestion.views || 0} views</span>
                <span>{selectedQuestion.bookmarks || 0} bookmarks</span>
                <span>{new Date(selectedQuestion.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
