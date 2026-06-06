import { BookOpen } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0f172a]">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <BookOpen className="w-5 h-5 text-indigo-500" />
            <span className="font-semibold">FAQHub</span>
          </div>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            &copy; {new Date().getFullYear()} FAQHub. Community-driven Q&A platform.
          </p>
        </div>
      </div>
    </footer>
  );
}
