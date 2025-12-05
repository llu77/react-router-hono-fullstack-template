import { NavLink, Form } from "react-router";
import { cn } from "~/lib/utils";
import {
  LayoutDashboard,
  Receipt,
  Users,
  Building2,
  BarChart3,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  user: {
    fullName: string;
    role: string;
    branchName?: string;
  };
}

const menuItems = [
  {
    title: "لوحة التحكم",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "الإيرادات",
    href: "/dashboard/revenues",
    icon: Receipt,
  },
  {
    title: "الموظفين",
    href: "/dashboard/employees",
    icon: Users,
  },
  {
    title: "الفروع",
    href: "/dashboard/branches",
    icon: Building2,
  },
  {
    title: "التقارير",
    href: "/dashboard/reports",
    icon: BarChart3,
  },
  {
    title: "الإعدادات",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export function Sidebar({ user }: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const roleLabels: Record<string, string> = {
    admin: "مدير النظام",
    manager: "مدير فرع",
    employee: "موظف",
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 right-4 z-40 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md"
      >
        <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 right-0 z-50",
          "w-72 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700",
          "flex flex-col transition-transform duration-300",
          isMobileOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        )}
      >
        {/* Close button for mobile */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden absolute top-4 left-4 p-2 text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
              R
            </div>
            <div>
              <h1 className="font-bold text-gray-900 dark:text-white">
                نظام الإيرادات
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                إدارة ومتابعة
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === "/dashboard"}
              onClick={() => setIsMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                  "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50",
                  isActive && [
                    "bg-blue-50 dark:bg-blue-900/20",
                    "text-blue-600 dark:text-blue-400",
                    "font-medium",
                  ]
                )
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.title}</span>
              <ChevronRight className="w-4 h-4 mr-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </NavLink>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          {/* User Card */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold">
                {user.fullName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white truncate">
                  {user.fullName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {roleLabels[user.role] || user.role}
                </p>
              </div>
            </div>
            {user.branchName && (
              <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  {user.branchName}
                </p>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <Form action="/logout" method="post">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>تسجيل الخروج</span>
            </button>
          </Form>
        </div>
      </aside>
    </>
  );
}
