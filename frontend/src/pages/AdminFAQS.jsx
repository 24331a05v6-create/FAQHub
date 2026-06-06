import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Plus, Trash2, Pin, PinOff, X, Loader2, Tag, Save, Search, AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";
import { adminAPI, faqAPI } from "../api";

export default function AdminFAQS() {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ question: "", answer: "", category: "", tags: "" });

  const { data: faqs, isLoading } = useQuery({
    queryKey: ["admin-faqs"],
    queryFn: adminAPI.getFAQs,
  });

  const { data: categories } = useQuery({
    queryKey: ["faq-categories"],
    queryFn: faqAPI.getCategories,
  });

  const createMutation = useMutation({
    mutationFn: (data) => adminAPI.createFAQ(data),
    onSuccess: () => {
      toast.success("FAQ added successfully!");
      setForm({ question: "", answer: "", category: "", tags: "" });
      setShowAdd(false);
      queryClient.invalidateQueries({ queryKey: ["admin-faqs"] });
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to add FAQ"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminAPI.deleteFAQ(id),
    onSuccess: () => {
      toast.success("FAQ deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-faqs"] });
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to delete FAQ"),
  });

  const pinMutation = useMutation({
    mutationFn: (id) => adminAPI.togglePinFAQ(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-faqs"] }),
    onError: (err) => toast.error(err.response?.data?.message || "Failed to toggle pin"),
  });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.question.trim() || !form.answer.trim() || !form.category) {
      return toast.error("Question, answer, and category are required");
    }
    createMutation.mutate({
      question: form.question,
      answer: form.answer,
      category: form.category,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
    });
  };

  const faqList = Array.isArray(faqs) ? faqs : [];
  const filtered = search
    ? faqList.filter((f) =>
        f.question?.toLowerCase().includes(search.toLowerCase()) ||
        f.answer?.toLowerCase().includes(search.toLowerCase()) ||
        f.category?.toLowerCase().includes(search.toLowerCase())
      )
    : faqList;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Manage FAQs</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Add, pin, or remove FAQ entries</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {showAdd ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showAdd ? "Cancel" : "Add FAQ"}
        </button>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAdd}
            className="mb-6 p-5 card-glass space-y-4 overflow-hidden"
          >
            <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-500" /> New FAQ Entry
            </h3>
            <input
              value={form.question}
              onChange={(e) => setForm({ ...form, question: e.target.value })}
              placeholder="Question"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
            <textarea
              value={form.answer}
              onChange={(e) => setForm({ ...form, answer: e.target.value })}
              rows={4}
              placeholder="Answer"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-y"
            />
            <div className="grid grid-cols-2 gap-4">
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="">Select category</option>
                {categories?.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="Tags (comma separated)"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save FAQ
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search FAQs..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 mx-auto text-indigo-500 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 card-glass">
          <BookOpen className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">No FAQs found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((faq) => (
            <motion.div
              key={faq._id}
              layout
              className="card-glass p-4 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono text-indigo-400">#{faq.faqNumber || "?"}</span>
                    {faq.isPinned && <Pin className="w-3 h-3 text-amber-500" />}
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">{faq.category}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{faq.question}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{faq.answer}</p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400">
                    <span>{faq.views} views</span>
                    <span>{faq.bookmarks} bookmarks</span>
                    <span>{new Date(faq.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => pinMutation.mutate(faq._id)}
                    className={`p-2 rounded-lg transition-colors ${
                      faq.isPinned
                        ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                    }`}
                    title={faq.isPinned ? "Unpin" : "Pin"}
                  >
                    {faq.isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete FAQ #${faq.faqNumber}: ${faq.question}?`)) {
                        deleteMutation.mutate(faq._id);
                      }
                    }}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

