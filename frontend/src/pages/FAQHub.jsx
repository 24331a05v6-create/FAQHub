import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bookmark,
  Share2,
  Mic,
  MicOff,
  X,
  HelpCircle,
  ExternalLink,
  FolderOpen,
  Folder,
  FileText,
  Hash,
  Eye,
  Minus,
  GitBranch,
  Pin,
  BarChart3,
  Network,
} from "lucide-react";
import toast from "react-hot-toast";
import { faqAPI } from "../api";
import { useAuth } from "../context/AuthContext";
import { useDebounce } from "../hooks/useDebounce";
import MindMap from "../components/faq/MindMap";
import { FAQSkeleton } from "../components/ui/Skeleton";

const catColors = {
  "About the Internship": { bg: "bg-blue-50 dark:bg-blue-900/20", border: "border-blue-200 dark:border-blue-800", dot: "bg-blue-500", text: "text-blue-700 dark:text-blue-300" },
  "Timing and Dates": { bg: "bg-amber-50 dark:bg-amber-900/20", border: "border-amber-200 dark:border-amber-800", dot: "bg-amber-500", text: "text-amber-700 dark:text-amber-300" },
  "NOC": { bg: "bg-emerald-50 dark:bg-emerald-900/20", border: "border-emerald-200 dark:border-emerald-800", dot: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-300" },
};

const defaultCatColor = { bg: "bg-gray-50 dark:bg-gray-800/50", border: "border-gray-200 dark:border-gray-700", dot: "bg-gray-400", text: "text-gray-700 dark:text-gray-300" };

export default function FAQHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [expandedFAQs, setExpandedFAQs] = useState(new Set());
  const [expandedCategories, setExpandedCategories] = useState(new Set(["About the Internship", "Timing and Dates", "NOC"]));
  const [listening, setListening] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeFaqId, setActiveFaqId] = useState(null);
  const [viewMode, setViewMode] = useState(() => localStorage.getItem("faq-view") || "tree");
  const { user } = useAuth();
  const navigate = useNavigate();
  const debouncedSearch = useDebounce(search, 400);

  const switchView = (mode) => { setViewMode(mode); localStorage.setItem("faq-view", mode); };

  const { data: faqData, isLoading } = useQuery({
    queryKey: ["faqs"],
    queryFn: () => faqAPI.getAll({ limit: 100 }),
  });

  const { data: searchData, isLoading: searchLoading } = useQuery({
    queryKey: ["faq-search", debouncedSearch],
    queryFn: () => faqAPI.search(debouncedSearch),
    enabled: debouncedSearch.length >= 2,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["faq-categories"],
    queryFn: faqAPI.getCategories,
  });

  const allFAQs = searchData?.faqs || faqData?.faqs || [];
  const categories = categoriesData || [];

  useEffect(() => {
    if (debouncedSearch && searchData?.faqs?.length === 0 && !searchLoading) {
      toast("No matching FAQs found. Redirecting you to ask a new query...", { icon: "🔄" });
      const timer = setTimeout(() => {
        navigate(`/raise-query?title=${encodeURIComponent(debouncedSearch)}`);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [debouncedSearch, searchData, searchLoading, navigate]);

  const groupedFAQs = useMemo(() => {
    const map = {};
    allFAQs.forEach((faq) => {
      if (!map[faq.category]) map[faq.category] = [];
      map[faq.category].push(faq);
    });
    return map;
  }, [allFAQs]);

  const toggleCategory = (cat) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat); else next.add(cat);
      return next;
    });
  };

  const toggleFAQ = (id) => {
    setExpandedFAQs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); setActiveFaqId(null); }
      else { next.add(id); setActiveFaqId(id); }
      return next;
    });
  };

  const handleBookmark = async (faqId) => {
    if (!user) return toast.error("Please login to bookmark");
    try {
      await faqAPI.bookmark(faqId);
      toast.success("Bookmark toggled");
    } catch { toast.error("Failed to update bookmark"); }
  };

  const handleShare = (faq) => {
    navigator.clipboard.writeText(`${window.location.origin}/faq?q=${encodeURIComponent(faq.question)}`);
    toast.success("Link copied to clipboard");
  };

  const handleVoiceSearch = useCallback(() => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      toast.error("Voice search not supported in this browser");
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    setListening(true);
    recognition.onresult = (event) => { setSearch(event.results[0][0].transcript); setListening(false); };
    recognition.onerror = () => { setListening(false); toast.error("Voice search failed"); };
    recognition.start();
  }, []);

  const isSearching = debouncedSearch.length >= 2;

  return (
    <div className="min-h-screen relative">
      {/* Sticky Search */}
      <div className="sticky top-16 z-40 bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-4 py-4 sm:px-6">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text" value={search}
              onChange={(e) => { setSearch(e.target.value); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Search the FAQ tree..."
              className="w-full pl-12 pr-24 py-3.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none shadow-sm transition-all"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {/* View toggle */}
              <div className="flex items-center gap-0.5 mr-1 pr-1 border-r border-gray-200 dark:border-gray-600">
                <button onClick={() => switchView("tree")} className={`p-1.5 rounded-md transition-all ${viewMode === "tree" ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"}`} title="Tree view">
                  <GitBranch className="w-4 h-4" />
                </button>
                <button onClick={() => switchView("mindmap")} className={`p-1.5 rounded-md transition-all ${viewMode === "mindmap" ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"}`} title="Mind map view">
                  <Network className="w-4 h-4" />
                </button>
              </div>
              <button onClick={handleVoiceSearch} className={`p-2 rounded-lg transition-colors ${listening ? "bg-red-100 text-red-500 animate-pulse" : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400"}`}>
                {listening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              {search && <button onClick={() => setSearch("")} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400"><X className="w-5 h-5" /></button>}
            </div>
            {showSuggestions && debouncedSearch.length >= 2 && searchData?.faqs?.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                {searchData.faqs.slice(0, 5).map((faq) => (
                  <button key={faq._id} onClick={() => { setSearch(faq.question); setShowSuggestions(false); }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <Search className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300 line-clamp-1">{faq.question}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6">
        {isSearching && (
          <div className="mb-6 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-lg px-4 py-2 border border-gray-200 dark:border-gray-700">
            <Search className="w-4 h-4" />
            Results for "<span className="font-medium text-gray-700 dark:text-gray-300">{debouncedSearch}</span>"
            <span className="text-gray-400">({searchData?.total || 0} found)</span>
          </div>
        )}

        {isLoading || searchLoading ? (
          <FAQSkeleton />
        ) : allFAQs.length === 0 ? (
          <div className="text-center py-16">
            <HelpCircle className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400">No FAQs found</h3>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Try a different search term</p>
          </div>
        ) : (
          viewMode === "mindmap" ? (
            <div className="px-4 pb-12">
              <MindMap faqs={allFAQs} categories={categories} />
            </div>
          ) : (
          <>
            {/* Tree map sidebar */}
            <aside className="hidden lg:block w-56 shrink-0">
              <div className="sticky top-40 space-y-1">
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3 px-3">Tree Map</div>
                {categories.map((cat) => {
                  const cc = catColors[cat] || defaultCatColor;
                  const count = (groupedFAQs[cat] || []).length;
                  const isExpanded = expandedCategories.has(cat);
                  const isActive = activeFaqId && allFAQs.find(f => f._id === activeFaqId)?.category === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => {
                        toggleCategory(cat);
                        const firstFaq = groupedFAQs[cat]?.[0];
                        if (firstFaq && !isExpanded) toggleFAQ(firstFaq._id);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center gap-2 ${isActive ? `${cc.bg} ${cc.text} font-medium` : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${cc.dot} shrink-0`} />
                      <span className="truncate flex-1">{cat}</span>
                      <span className="text-gray-400 dark:text-gray-500">{count}</span>
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* Tree view */}
            <div className="flex-1 min-w-0">
              {isSearching ? (
                <div className="space-y-2">
                  {allFAQs.map((faq) => (
                    <TreeLeaf
                      key={faq._id}
                      faq={faq}
                      expanded={expandedFAQs.has(faq._id)}
                      onToggle={() => toggleFAQ(faq._id)}
                      onBookmark={() => handleBookmark(faq._id)}
                      onShare={() => handleShare(faq)}
                      user={user}
                      isLast={true}
                      depth={0}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-0">
                  {/* Root node */}
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                      <HelpCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-gray-900 dark:text-white">FAQ Knowledge Base</h1>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{allFAQs.length} articles across {categories.length} categories</p>
                    </div>
                  </div>

                  {categories.map((cat, catIdx) => {
                    const catFAQs = groupedFAQs[cat] || [];
                    if (catFAQs.length === 0) return null;
                    const isExpanded = expandedCategories.has(cat);
                    const cc = catColors[cat] || defaultCatColor;
                    const isLastCat = catIdx === categories.length - 1;

                    return (
                      <div key={cat} className="relative">
                        {/* Category node */}
                        <div className={`relative ml-6 ${catIdx > 0 ? 'mt-1' : ''}`}>
                          {/* Vertical connector from previous */}
                          {catIdx > 0 && (
                            <div className="absolute -left-6 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />
                          )}
                          <button
                            onClick={() => toggleCategory(cat)}
                            className={`relative flex items-center gap-3 w-full px-4 py-3 rounded-xl border ${cc.border} ${cc.bg} hover:shadow-sm transition-all group`}
                          >
                            {/* Tree connector elbow */}
                            <div className="absolute -left-6 top-1/2 w-6 h-px bg-gray-200 dark:bg-gray-700" />
                            <motion.div animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
                              {isExpanded ? <FolderOpen className={`w-5 h-5 ${cc.text}`} /> : <Folder className={`w-5 h-5 ${cc.text}`} />}
                            </motion.div>
                            <span className={`font-semibold text-sm ${cc.text} flex-1 text-left`}>{cat}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-white/60 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400">{catFAQs.length}</span>
                          </button>
                        </div>

                        {/* Child FAQ nodes */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="relative ml-12 pl-0">
                                {/* Vertical line connecting children */}
                                <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />
                                {catFAQs.map((faq, faqIdx) => {
                                  const isLast = faqIdx === catFAQs.length - 1;
                                  return (
                                    <TreeLeaf
                                      key={faq._id}
                                      faq={faq}
                                      expanded={expandedFAQs.has(faq._id)}
                                      onToggle={() => toggleFAQ(faq._id)}
                                      onBookmark={() => handleBookmark(faq._id)}
                                      onShare={() => handleShare(faq)}
                                      user={user}
                                      isLast={isLast}
                                      depth={1}
                                      parentConnector={true}
                                    />
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )
      )}
      </div>
    </div>
  );
}

/* ─── Tree Leaf Node ─── */
function TreeLeaf({ faq, expanded, onToggle, onBookmark, onShare, user, isLast, depth, parentConnector }) {
  const [hovering, setHovering] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {/* Tree connector: vertical line from parent */}
      {parentConnector && (
        <div className={`absolute left-0 top-0 ${isLast ? 'h-6' : 'bottom-0'} w-px bg-gray-200 dark:bg-gray-700`} />
      )}
      {/* Tree connector: elbow to node */}
      {parentConnector && (
        <div className="absolute left-0 top-6 w-6 h-px bg-gray-200 dark:bg-gray-700" />
      )}

      <motion.div
        layout
        className={`relative ml-6 mb-1.5 rounded-xl border transition-all cursor-pointer ${
          expanded
            ? 'border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-900/10 shadow-sm'
            : hovering
              ? 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm'
              : 'border-transparent bg-white/50 dark:bg-gray-800/30 hover:bg-white dark:hover:bg-gray-800/60'
        }`}
        onClick={onToggle}
      >
        <div className="flex items-start gap-3 px-4 py-3">
          {/* Node icon */}
          <div className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors ${
            expanded ? 'text-indigo-500' : 'text-gray-400'
          }`}>
            <FileText className="w-4 h-4" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <span className={`text-sm leading-snug transition-colors ${
                expanded ? 'font-semibold text-indigo-700 dark:text-indigo-300' : 'font-medium text-gray-800 dark:text-gray-200'
              }`}>
                <span className="text-[10px] font-mono text-gray-400 dark:text-gray-500 mr-1.5">#{faq.faqNumber || "--"}</span>
                {faq.question}
              </span>
              <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                {user && (
                  <button onClick={() => onBookmark()}
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-indigo-500 transition-colors">
                    <Bookmark className="w-3.5 h-3.5" />
                  </button>
                )}
                <button onClick={() => onShare()}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-indigo-500 transition-colors">
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Tags row */}
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                <Eye className="w-3 h-3" /> {faq.views || 0}
              </span>
              {faq.tags?.slice(0, 3).map((tag) => (
                <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Expand indicator */}
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="mt-1 text-gray-400 shrink-0"
          >
            <Minus className="w-4 h-4" />
          </motion.div>
        </div>

        {/* Answer panel */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 pt-0 border-t border-indigo-100 dark:border-indigo-900/30 mx-4">
                <div className="pt-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {faq.answer}
                </div>
                {/* Feedback / actions */}
                <div className="flex items-center gap-3 mt-3 pt-2 border-t border-gray-100 dark:border-gray-700/50">
                  {faq.tags?.slice(3).map((tag) => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                      <Hash className="w-2.5 h-2.5" /> {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

}

