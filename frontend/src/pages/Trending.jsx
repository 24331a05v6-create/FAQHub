import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { TrendingUp, Eye, Bookmark, BarChart3, Flame, Star, ChevronRight, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { faqAPI } from "../api";

const fadeUp = { hidden: { opacity: 0, y: 15 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05 } }) };

export default function Trending() {
  const [tab, setTab] = useState("viewed");
  const { data, isLoading } = useQuery({ queryKey: ["faq-trending"], queryFn: faqAPI.getTrending });

  const tabs = [
    { key: "viewed", label: "Most Viewed", icon: Eye },
    { key: "bookmarked", label: "Bookmarked", icon: Bookmark },
    { key: "trending", label: "Trending", icon: Flame },
    { key: "categories", label: "Categories", icon: BarChart3 },
  ];

  const faqs = tab === "viewed" ? data?.mostViewed : tab === "bookmarked" ? data?.mostBookmarked : tab === "trending" ? data?.highestTrending : null;

  return (
    <div className="min-h-screen relative">
      <div className="orb w-96 h-96 bg-orange-500 top-20 -right-20" />
      <div className="orb w-72 h-72 bg-purple-500 bottom-20 -left-20" />

      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8 relative z-10">
        <motion.div initial="hidden" animate="visible">
          <motion.div variants={fadeUp} className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Trending</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Trending</span> FAQs
            </h1>
            <p className="text-gray-500 dark:text-gray-400">Priority-based tracking of frequently asked questions</p>
          </motion.div>

          {/* Tabs */}
          <motion.div variants={fadeUp} custom={1} className="flex items-center gap-1 mb-8 glass rounded-2xl p-1.5 overflow-x-auto">
            {tabs.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  tab === t.key ? "gradient-primary text-white shadow-lg shadow-indigo-500/20" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                }`}>
                <t.icon className="w-4 h-4" />{t.label}
              </button>
            ))}
          </motion.div>

          {isLoading ? (
            <div className="text-center py-16"><Loader2 className="w-8 h-8 mx-auto text-indigo-500 animate-spin" /></div>
          ) : tab === "categories" ? (
            <CategoryStats data={data?.byCategory || []} />
          ) : (
            <FAQList faqs={faqs || []} tab={tab} />
          )}
        </motion.div>
      </div>
    </div>
  );
}

function FAQList({ faqs, tab }) {
  if (!faqs.length) {
    return (
      <div className="text-center py-16 card-glass">
        <Star className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
        <p className="text-sm text-gray-500 dark:text-gray-400">No data available yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => (
        <motion.div key={faq._id} variants={fadeUp} custom={i} initial="hidden" animate="visible" className="card-glass p-4 group">
          <div className="flex items-start gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
              i < 3 ? "gradient-primary text-white shadow-lg shadow-indigo-500/20" : "glass text-gray-500"
            }`}>{i + 1}</div>
            <div className="flex-1 min-w-0">
              <Link to={`/faq?q=${encodeURIComponent(faq.question)}`} className="group/link">
                <h3 className="font-semibold text-gray-900 dark:text-white group-hover/link:text-indigo-600 dark:group-hover/link:text-indigo-400 transition-colors">
                  {faq.question}
                </h3>
              </Link>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{faq.answer}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-[10px] px-2 py-0.5 rounded-lg glass font-medium text-gray-500">{faq.category}</span>
                <span className="flex items-center gap-1 text-[10px] text-gray-400"><Eye className="w-3 h-3" /> {faq.views || 0}</span>
                <span className="flex items-center gap-1 text-[10px] text-gray-400"><Bookmark className="w-3 h-3" /> {faq.bookmarks || 0}</span>
                {faq.trendingScore > 0 && (
                  <span className="flex items-center gap-1 text-[10px] text-orange-500 font-medium"><Flame className="w-3 h-3" /> {faq.trendingScore}</span>
                )}
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 shrink-0 mt-1 group-hover:text-indigo-500 transition-colors" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function CategoryStats({ data }) {
  if (!data.length) {
    return (
      <div className="text-center py-16 card-glass">
        <BarChart3 className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
        <p className="text-sm text-gray-500 dark:text-gray-400">No category data available</p>
      </div>
    );
  }

  const maxViews = Math.max(...data.map((d) => d.totalViews || 1));

  return (
    <div className="space-y-3">
      {data.map((cat, i) => (
        <motion.div key={cat._id} variants={fadeUp} custom={i} initial="hidden" animate="visible" className="card-glass p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                i < 3 ? "gradient-primary text-white" : "glass text-gray-500"
              }`}>{i + 1}</span>
              <h3 className="font-semibold text-gray-900 dark:text-white">{cat._id}</h3>
            </div>
            <span className="text-xs text-gray-500 font-medium">{cat.count} FAQs</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-700/50 rounded-full h-2 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full transition-all" style={{ width: `${(cat.totalViews / maxViews) * 100}%` }} />
          </div>
          <p className="text-[10px] text-gray-400 mt-1.5">{cat.totalViews?.toLocaleString()} total views</p>
        </motion.div>
      ))}
    </div>
  );
}
