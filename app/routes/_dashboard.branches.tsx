import { Header } from "~/components/layout";
import { Card, CardContent, Badge, Button } from "~/components/ui";
import { Building2, Plus, MapPin, Users } from "lucide-react";

export function meta() {
  return [{ title: "الفروع | نظام إدارة الإيرادات" }];
}

const branchesData = [
  { id: 1, name: "الفرع الرئيسي", location: "الرياض - العليا", employees: 5, active: true },
  { id: 2, name: "فرع الشرق", location: "الدمام - الكورنيش", employees: 5, active: true },
  { id: 3, name: "فرع الغرب", location: "جدة - الحمرا", employees: 5, active: true },
];

export default function BranchesPage() {
  return (
    <div className="min-h-screen">
      <Header title="إدارة الفروع" subtitle="عرض وإدارة فروع الشركة" />

      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 text-gray-500">
            <Building2 className="w-5 h-5" />
            <span>إجمالي الفروع: {branchesData.length}</span>
          </div>
          <Button>
            <Plus className="w-4 h-4 ml-2" />
            إضافة فرع
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {branchesData.map((branch) => (
            <Card key={branch.id} variant="bordered" className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <Badge variant={branch.active ? "success" : "error"}>
                    {branch.active ? "نشط" : "غير نشط"}
                  </Badge>
                </div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                  {branch.name}
                </h3>
                <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{branch.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{branch.employees} موظفين</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-700 dark:text-blue-300 text-sm">
          <strong>ملاحظة:</strong> هذه صفحة تجريبية. سيتم إضافة الوظائف الكاملة في المراحل القادمة.
        </div>
      </div>
    </div>
  );
}
