import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronRight,
  HelpCircle,
  X,
  MessageSquare,
} from "lucide-react";

const CAT_COLORS = [
  { bg: "#6366f1", bar: "#818cf8" },
  { bg: "#8b5cf6", bar: "#a78bfa" },
  { bg: "#ec4899", bar: "#f472b6" },
  { bg: "#f59e0b", bar: "#fbbf24" },
  { bg: "#10b981", bar: "#34d399" },
  { bg: "#3b82f6", bar: "#60a5fa" },
  { bg: "#ef4444", bar: "#f87171" },
  { bg: "#14b8a6", bar: "#2dd4bf" },
  { bg: "#f97316", bar: "#fb923c" },
  { bg: "#a855f7", bar: "#c084fc" },
  { bg: "#06b6d4", bar: "#22d3ee" },
];

const CATEGORY_ORDER = [
  "About the Internship",
  "Timing and Dates",
  "NOC",
  "Selection, Offer Letter & Certificate",
  "Work, Mentorship & Projects",
  "Communication Channels",
  "Interviews",
  "Certificate",
  "Rosetta Journal",
  "Phase 1 Coursework",
  "OTHERS",
];

export default function MindMap({ faqs, categories }) {
  const [expandedCat, setExpandedCat] = useState(null);
  const [popupFaq, setPopupFaq] = useState(null);

  const sorted = [...categories].sort((a, b) => {
    const ai = CATEGORY_ORDER.indexOf(a);
    const bi = CATEGORY_ORDER.indexOf(b);
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });

  const faqByCategory = {};
  sorted.forEach((cat) => {
    faqByCategory[cat] = faqs.filter((f) => f.category === cat);
  });

  const toggleCat = (cat) => {
    setExpandedCat((prev) => (prev === cat ? null : cat));
    setPopupFaq(null);
  };

  return (
    <div className="w-full min-h-[70vh] flex flex-col items-center justify-center py-6">
      <div className="w-full max-w-[80vw] mx-auto">
        {/* Root node */}
        <div className="flex flex-col items-center mb-4">
          <div className="px-10 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-2xl shadow-2xl">
            FAQHub
          </div>
          <div className="w-px h-8 bg-gray-400 dark:bg-gray-500" />
        </div>

        {/* Category nodes */}
        <div className="flex flex-wrap justify-center gap-5">
          {sorted.map((cat, i) => {
            const color = CAT_COLORS[i % CAT_COLORS.length];
            const count = (faqByCategory[cat] || []).length;
            const isExpanded = expandedCat === cat;

            return (
              <div key={cat} className="flex flex-col items-center">
                <div className="w-px h-5 bg-gray-400 dark:bg-gray-500" />

                {/* Category node */}
                <button
                  onClick={() => toggleCat(cat)}
                  className="relative rounded-2xl px-6 py-4 text-white text-sm font-bold shadow-xl hover:scale-105 transition-transform min-w-[170px] text-center"
                  style={{ background: color.bg }}
                >
                  <div className="flex items-center justify-center gap-2">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                    <span className="truncate max-w-[130px]">{cat}</span>
                  </div>
                  <div className="mt-2 h-1.5 bg-white/30 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, count * 15)}%`,
                        background: color.bar,
                      }}
                    />
                  </div>
                  <div className="text-[11px] opacity-80 mt-1">
                    {count} {count === 1 ? "Question" : "Questions"}
                  </div>
                </button>

                {/* Expanded: question list dropdown */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="relative mt-3"
                    >
                      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-px h-2.5 bg-gray-400 dark:bg-gray-500" />

                      {/* Question list box */}
                      <div
                        className="w-[340px] max-h-[350px] overflow-y-auto rounded-2xl border-2 shadow-2xl bg-white dark:bg-gray-800"
                        style={{ borderColor: color.bg }}
                      >
                        <div
                          className="px-4 py-3 text-white text-sm font-bold uppercase tracking-wider flex items-center justify-between sticky top-0 z-10"
                          style={{ background: color.bg }}
                        >
                          <span>{cat}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCat(cat);
                            }}
                            className="hover:bg-white/20 rounded-lg p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        {(faqByCategory[cat] || []).map((faq) => (
                          <button
                            key={faq._id}
                            onClick={() => setPopupFaq(faq)}
                            className="w-full text-left px-4 py-3.5 text-sm border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300 transition-colors flex items-start gap-3"
                          >
                            <HelpCircle className="w-4 h-4 mt-0.5 shrink-0 text-gray-400 dark:text-gray-500" />
                            <span className="line-clamp-2 leading-relaxed">
                              {faq.question}
                            </span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Stats */}
        <div className="flex justify-center mt-8">
          <div className="text-sm text-gray-400 dark:text-gray-500">
            {sorted.length} categories | {faqs.length} FAQs — Click a category to
            explore
          </div>
        </div>
      </div>

      {/* Answer popup overlay */}
      <AnimatePresence>
        {popupFaq && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setPopupFaq(null)}
            />

            {/* Popup box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              {/* Header */}
              <div className="px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-between">
                <div className="flex items-center gap-3 text-white">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">FAQ #{popupFaq.faqNumber}</h3>
                    <p className="text-xs text-white/70">{popupFaq.category}</p>
                  </div>
                </div>
                <button
                  onClick={() => setPopupFaq(null)}
                  className="text-white/80 hover:text-white hover:bg-white/20 rounded-xl p-2 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Question */}
              <div className="px-6 pt-5 pb-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center shrink-0 mt-0.5">
                    <HelpCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white leading-relaxed">
                    {popupFaq.question}
                  </h4>
                </div>
              </div>

              {/* Divider */}
              <div className="mx-6 border-t border-gray-200 dark:border-gray-700" />

              {/* Answer */}
              <div className="px-6 py-5 max-h-[50vh] overflow-y-auto">
                <div className="text-base text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {popupFaq.answer}
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="text-xs text-gray-400 dark:text-gray-500">
                  Category: {popupFaq.category}
                </div>
                <button
                  onClick={() => setPopupFaq(null)}
                  className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
