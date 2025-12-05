import { Sidebar } from "./Sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: {
    fullName: string;
    role: string;
    branchName?: string;
  };
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex" dir="rtl">
      {/* Sidebar */}
      <Sidebar user={user} />

      {/* Main Content */}
      <main className="flex-1 lg:mr-0 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
