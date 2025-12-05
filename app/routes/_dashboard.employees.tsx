import { Header } from "~/components/layout";
import { Card, CardContent, Badge, Button } from "~/components/ui";
import { Users, Plus, Edit2, Trash2 } from "lucide-react";

export function meta() {
  return [{ title: "الموظفين | نظام إدارة الإيرادات" }];
}

// بيانات تجريبية
const employeesData = [
  { id: 1, name: "أحمد محمد", code: "EMP-1-1", branch: "الفرع الرئيسي", active: true },
  { id: 2, name: "سارة علي", code: "EMP-1-2", branch: "الفرع الرئيسي", active: true },
  { id: 3, name: "خالد حسن", code: "EMP-1-3", branch: "الفرع الرئيسي", active: true },
  { id: 4, name: "فاطمة أحمد", code: "EMP-1-4", branch: "الفرع الرئيسي", active: false },
  { id: 5, name: "محمد سعيد", code: "EMP-1-5", branch: "الفرع الرئيسي", active: true },
];

export default function EmployeesPage() {
  return (
    <div className="min-h-screen">
      <Header title="إدارة الموظفين" subtitle="عرض وإدارة بيانات الموظفين" />

      <div className="p-6">
        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 text-gray-500">
            <Users className="w-5 h-5" />
            <span>إجمالي الموظفين: {employeesData.length}</span>
          </div>
          <Button>
            <Plus className="w-4 h-4 ml-2" />
            إضافة موظف
          </Button>
        </div>

        {/* Employees Table */}
        <Card variant="bordered">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">#</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">الاسم</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">الكود</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">الفرع</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">الحالة</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {employeesData.map((emp) => (
                    <tr key={emp.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-4 py-3 text-gray-500">{emp.id}</td>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{emp.name}</td>
                      <td className="px-4 py-3 font-mono text-sm text-gray-500">{emp.code}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{emp.branch}</td>
                      <td className="px-4 py-3">
                        <Badge variant={emp.active ? "success" : "error"}>
                          {emp.active ? "نشط" : "غير نشط"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Info */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-700 dark:text-blue-300 text-sm">
          <strong>ملاحظة:</strong> هذه صفحة تجريبية. سيتم إضافة الوظائف الكاملة في المراحل القادمة.
        </div>
      </div>
    </div>
  );
}
