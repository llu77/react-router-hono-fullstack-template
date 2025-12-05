import type { Route } from "./+types/_dashboard._index";
import { Header } from "~/components/layout";
import { Card, CardContent, Badge } from "~/components/ui";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  Wallet,
  Users,
  Calendar,
  ArrowUpLeft,
  ArrowDownLeft,
} from "lucide-react";
import { formatCurrency, formatDate, getCurrentDate } from "~/lib/utils";

export function meta() {
  return [
    { title: "لوحة التحكم | نظام إدارة الإيرادات" },
  ];
}

// بيانات تجريبية للعرض
const stats = [
  {
    title: "إجمالي الإيرادات",
    value: 125000,
    change: 12.5,
    isPositive: true,
    icon: DollarSign,
    color: "blue",
  },
  {
    title: "الكاش",
    value: 75000,
    change: 8.2,
    isPositive: true,
    icon: Wallet,
    color: "green",
  },
  {
    title: "الشبكة",
    value: 50000,
    change: -3.1,
    isPositive: false,
    icon: CreditCard,
    color: "purple",
  },
  {
    title: "عدد الموظفين",
    value: 15,
    change: 0,
    isPositive: true,
    icon: Users,
    color: "orange",
  },
];

const recentTransactions = [
  { date: "2024-01-15", cash: 5200, network: 3800, total: 9000, status: "matched" },
  { date: "2024-01-14", cash: 4800, network: 4200, total: 9000, status: "matched" },
  { date: "2024-01-13", cash: 5500, network: 3200, total: 8700, status: "mismatched" },
  { date: "2024-01-12", cash: 6000, network: 4000, total: 10000, status: "matched" },
  { date: "2024-01-11", cash: 4500, network: 3500, total: 8000, status: "matched" },
];

export default function DashboardIndex({ }: Route.ComponentProps) {
  const colorClasses: Record<string, string> = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
  };

  return (
    <div className="min-h-screen">
      <Header
        title="لوحة التحكم"
        subtitle={`اليوم: ${formatDate(getCurrentDate())}`}
      />

      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.title} variant="bordered" padding="none">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {stat.title.includes("عدد")
                        ? stat.value
                        : formatCurrency(stat.value)}
                    </p>
                    {stat.change !== 0 && (
                      <div className="flex items-center gap-1 mt-2">
                        {stat.isPositive ? (
                          <ArrowUpLeft className="w-4 h-4 text-green-500" />
                        ) : (
                          <ArrowDownLeft className="w-4 h-4 text-red-500" />
                        )}
                        <span
                          className={`text-sm font-medium ${
                            stat.isPositive ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          {Math.abs(stat.change)}%
                        </span>
                        <span className="text-xs text-gray-400">من الشهر الماضي</span>
                      </div>
                    )}
                  </div>
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[stat.color]} flex items-center justify-center text-white shadow-lg`}
                  >
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Transactions & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Transactions */}
          <Card variant="bordered" padding="none" className="lg:col-span-2">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  آخر العمليات
                </h3>
                <a
                  href="/dashboard/revenues"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  عرض الكل
                </a>
              </div>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentTransactions.map((tx, i) => (
                <div
                  key={i}
                  className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatDate(tx.date)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        كاش: {formatCurrency(tx.cash)} | شبكة: {formatCurrency(tx.network)}
                      </p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(tx.total)}
                    </p>
                    <Badge
                      variant={tx.status === "matched" ? "success" : "error"}
                      size="sm"
                    >
                      {tx.status === "matched" ? "مطابق" : "غير مطابق"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card variant="bordered" padding="md">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              إجراءات سريعة
            </h3>
            <div className="space-y-3">
              <a
                href="/dashboard/revenues"
                className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                <DollarSign className="w-5 h-5" />
                <span>إضافة إيراد جديد</span>
              </a>
              <a
                href="/dashboard/employees"
                className="flex items-center gap-3 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
              >
                <Users className="w-5 h-5" />
                <span>إدارة الموظفين</span>
              </a>
              <a
                href="/dashboard/reports"
                className="flex items-center gap-3 p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
              >
                <TrendingUp className="w-5 h-5" />
                <span>عرض التقارير</span>
              </a>
            </div>

            {/* Monthly Summary */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                ملخص الشهر الحالي
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">الأيام المسجلة</span>
                  <span className="font-medium text-gray-900 dark:text-white">15 / 31</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">نسبة المطابقة</span>
                  <span className="font-medium text-green-600 dark:text-green-400">93%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">متوسط اليومي</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(8500)}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Info Banner */}
        <Card variant="bordered" className="bg-gradient-to-r from-blue-500 to-indigo-600 border-0">
          <div className="flex items-center justify-between text-white">
            <div>
              <h3 className="font-semibold text-lg">مرحباً بك في نظام إدارة الإيرادات</h3>
              <p className="text-blue-100 mt-1">
                يمكنك إضافة الإيرادات اليومية ومتابعة الإحصائيات من هذه اللوحة
              </p>
            </div>
            <a
              href="/dashboard/revenues"
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              ابدأ الآن
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}
