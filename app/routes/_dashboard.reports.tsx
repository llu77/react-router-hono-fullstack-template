import { Header } from "~/components/layout";
import { Card, CardContent } from "~/components/ui";
import { BarChart3, TrendingUp, FileText, Download, Calendar } from "lucide-react";
import { formatCurrency } from "~/lib/utils";

export function meta() {
  return [{ title: "التقارير | نظام إدارة الإيرادات" }];
}

const reportTypes = [
  {
    title: "تقرير الإيرادات اليومية",
    description: "عرض تفصيلي للإيرادات يومياً",
    icon: Calendar,
    color: "blue",
  },
  {
    title: "تقرير الإيرادات الشهرية",
    description: "ملخص الإيرادات لكل شهر",
    icon: BarChart3,
    color: "green",
  },
  {
    title: "تقرير أداء الموظفين",
    description: "إحصائيات أداء كل موظف",
    icon: TrendingUp,
    color: "purple",
  },
  {
    title: "تقرير المطابقة",
    description: "تفاصيل حالات المطابقة وعدم المطابقة",
    icon: FileText,
    color: "orange",
  },
];

const monthlyStats = [
  { month: "يناير", revenue: 125000, matched: 28, mismatched: 3 },
  { month: "ديسمبر", revenue: 118000, matched: 29, mismatched: 2 },
  { month: "نوفمبر", revenue: 132000, matched: 27, mismatched: 3 },
];

export default function ReportsPage() {
  const colorClasses: Record<string, string> = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
  };

  return (
    <div className="min-h-screen">
      <Header title="التقارير" subtitle="عرض وتصدير التقارير المالية" />

      <div className="p-6 space-y-6">
        {/* Report Types */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {reportTypes.map((report) => (
            <Card
              key={report.title}
              variant="bordered"
              className="cursor-pointer hover:shadow-md transition-all hover:-translate-y-1"
            >
              <CardContent className="p-5">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[report.color]} flex items-center justify-center text-white mb-4`}
                >
                  <report.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {report.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {report.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Monthly Summary */}
        <Card variant="bordered">
          <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              ملخص الأشهر الأخيرة
            </h3>
            <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm">
              <Download className="w-4 h-4" />
              تصدير Excel
            </button>
          </div>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">الشهر</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">إجمالي الإيرادات</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">أيام مطابقة</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">أيام غير مطابقة</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">نسبة المطابقة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {monthlyStats.map((stat) => {
                    const total = stat.matched + stat.mismatched;
                    const percentage = ((stat.matched / total) * 100).toFixed(1);
                    return (
                      <tr key={stat.month} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                          {stat.month}
                        </td>
                        <td className="px-4 py-3 text-gray-900 dark:text-white">
                          {formatCurrency(stat.revenue)}
                        </td>
                        <td className="px-4 py-3 text-green-600">{stat.matched}</td>
                        <td className="px-4 py-3 text-red-600">{stat.mismatched}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-500 rounded-full"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {percentage}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-700 dark:text-blue-300 text-sm">
          <strong>ملاحظة:</strong> هذه صفحة تجريبية. سيتم إضافة الوظائف الكاملة في المراحل القادمة.
        </div>
      </div>
    </div>
  );
}
