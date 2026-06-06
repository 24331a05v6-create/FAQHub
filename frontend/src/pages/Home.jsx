import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen, MessageSquare, PlusCircle, Shield, Search, Users, CheckCircle,
  Sparkles, Brain, Zap, Globe, ArrowRight, Star, ChevronRight, Bot,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" } }),
};

const stats = [
  { value: "75+", label: "FAQs", icon: BookOpen },
  { value: "11", label: "Categories", icon: Globe },
  { value: "100%", label: "Free", icon: Zap },
  { value: "24/7", label: "AI Support", icon: Bot },
];

const features = [
  {
    icon: Search,
    title: "Smart Search",
    description: "Find answers instantly with intelligent search across all FAQ categories.",
    color: "from-blue-500 to-cyan-500",
    bg: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    icon: MessageSquare,
    title: "Community Q&A",
    description: "Ask questions, answer peers, and upvote the best responses.",
    color: "from-purple-500 to-pink-500",
    bg: "bg-purple-50 dark:bg-purple-900/20",
  },
  {
    icon: Shield,
    title: "Trusted Content",
    description: "Admin-moderated answers ensure high-quality, reliable information.",
    color: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
  },
  {
    icon: Brain,
    title: "AI Chatbot",
    description: "Get instant answers from our AI assistant in 10+ languages.",
    color: "from-orange-500 to-red-500",
    bg: "bg-orange-50 dark:bg-orange-900/20",
  },
];

const testimonials = [
  { name: "Priya S.", role: "Intern, IIT Ropar", text: "FAQHub made my onboarding so smooth. Every question I had was already answered!", rating: 5 },
  { name: "Rahul M.", role: "Mentor", text: "The best platform for VINS interns. Clean, organized, and always up to date.", rating: 5 },
  { name: "Anita K.", role: "Intern, 2024", text: "The AI chatbot helped me 24/7. No more waiting for replies on WhatsApp!", rating: 5 },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center gradient-hero">
        {/* Floating orbs */}
        <div className="orb w-72 h-72 bg-indigo-500 top-20 -left-20 animate-float" />
        <div className="orb w-96 h-96 bg-purple-500 bottom-10 -right-20 animate-float" style={{ animationDelay: "1.5s" }} />
        <div className="orb w-48 h-48 bg-pink-500 top-40 right-1/4 animate-float" style={{ animationDelay: "0.8s" }} />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-20 pb-16">
          <motion.div initial="hidden" animate="visible" className="text-center">
            {/* Badge */}
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 glow-sm">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">AI-Powered Knowledge Platform</span>
            </motion.div>

            {/* Title */}
            <motion.h1 variants={fadeUp} custom={1} className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
              <span className="text-gray-900 dark:text-white">Your </span>
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
                FAQ
              </span>
              <span className="text-gray-900 dark:text-white"> Hub</span>
              <br />
              <span className="text-gray-900 dark:text-white">Reimagined</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p variants={fadeUp} custom={2} className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              A community-driven Q&A platform with AI assistance.
              Find answers, ask questions, and help others — all in one place.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={fadeUp} custom={3} className="flex items-center justify-center gap-4 flex-wrap">
              <Link to="/faq" className="btn-primary text-base px-8 py-3.5 rounded-2xl group flex items-center gap-2">
                <span>Explore FAQs</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform relative z-10" />
              </Link>
              {user ? (
                <Link to="/raise-query" className="btn-glass text-base px-8 py-3.5 rounded-2xl">
                  Ask a Question
                </Link>
              ) : (
                <Link to="/register" className="btn-glass text-base px-8 py-3.5 rounded-2xl flex items-center gap-2">
                  Get Started Free <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </motion.div>

            {/* Stats */}
            <motion.div variants={fadeUp} custom={4} className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-16 max-w-3xl mx-auto">
              {stats.map((stat, i) => (
                <div key={i} className="card-glass p-4 text-center group hover:glow-sm">
                  <div className="w-10 h-10 rounded-xl gradient-primary mx-auto mb-2 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4">
              <Zap className="w-4 h-4 text-indigo-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Features</span>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Everything you need
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              Built for students, by students. One platform to rule them all.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="card-glass p-6 group cursor-default"
              >
                <div className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center`}>
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 relative gradient-mesh">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Loved by interns
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-lg text-gray-500 dark:text-gray-400">
              See what others are saying about FAQHub
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="card-glass p-6"
              >
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-sm">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">{t.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="relative rounded-3xl overflow-hidden"
          >
            <div className="absolute inset-0 gradient-primary opacity-90" />
            <div className="absolute inset-0 noise" />
            <div className="relative z-10 px-8 py-16 sm:px-16 text-center">
              <Bot className="w-16 h-16 text-white/80 mx-auto mb-6" />
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to get started?
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-lg mx-auto">
                Join hundreds of interns who use FAQHub every day. Find answers instantly or ask the AI assistant.
              </p>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <Link to="/faq" className="px-8 py-3.5 bg-white text-indigo-600 font-bold rounded-2xl hover:bg-gray-100 transition-colors shadow-xl flex items-center gap-2">
                  <BookOpen className="w-5 h-5" /> Browse FAQs
                </Link>
                {!user && (
                  <Link to="/register" className="btn-glass text-base px-8 py-3.5 rounded-2xl">
                    Create Account
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">FAQHub</span>
          </div>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Built with care for the Vicharanashala community
          </p>
        </div>
      </footer>
    </div>
  );
}
