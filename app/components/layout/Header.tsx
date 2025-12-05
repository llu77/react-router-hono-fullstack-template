import { Bell, Search, Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // تحقق من الإعداد المحفوظ أو تفضيل النظام
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Title */}
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="hidden md:flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="بحث..."
              className="bg-transparent border-none outline-none text-sm text-gray-700 dark:text-gray-300 placeholder:text-gray-400 w-48"
            />
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title={isDark ? "الوضع الفاتح" : "الوضع الداكن"}
          >
            {isDark ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </div>
      </div>
    </header>
  );
}
