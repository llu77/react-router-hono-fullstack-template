import { Header } from "~/components/layout";
import { Card, CardContent, Button, Input } from "~/components/ui";
import { Settings, User, Lock, Bell, Database, Shield } from "lucide-react";

export function meta() {
  return [{ title: "الإعدادات | نظام إدارة الإيرادات" }];
}

const settingsSections = [
  {
    title: "الملف الشخصي",
    description: "تحديث بيانات الحساب الشخصي",
    icon: User,
    color: "blue",
  },
  {
    title: "الأمان",
    description: "تغيير كلمة المرور وإعدادات الأمان",
    icon: Lock,
    color: "red",
  },
  {
    title: "الإشعارات",
    description: "إدارة تفضيلات الإشعارات",
    icon: Bell,
    color: "yellow",
  },
  {
    title: "قاعدة البيانات",
    description: "النسخ الاحتياطي والاستعادة",
    icon: Database,
    color: "green",
  },
];

export default function SettingsPage() {
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    red: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    yellow: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
    green: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  };

  return (
    <div className="min-h-screen">
      <Header title="الإعدادات" subtitle="إدارة إعدادات النظام والحساب" />

      <div className="p-6 space-y-6">
        {/* Quick Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {settingsSections.map((section) => (
            <Card
              key={section.title}
              variant="bordered"
              className="cursor-pointer hover:shadow-md transition-all"
            >
              <CardContent className="p-5">
                <div
                  className={`w-12 h-12 rounded-xl ${colorClasses[section.color]} flex items-center justify-center mb-4`}
                >
                  <section.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {section.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {section.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Profile Settings */}
        <Card variant="bordered">
          <div className="p-5 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                الملف الشخصي
              </h3>
            </div>
          </div>
          <CardContent className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="الاسم الكامل" placeholder="أدخل الاسم الكامل" />
              <Input label="اسم المستخدم" placeholder="أدخل اسم المستخدم" disabled />
              <Input label="البريد الإلكتروني" type="email" placeholder="أدخل البريد الإلكتروني" />
              <Input label="رقم الهاتف" placeholder="أدخل رقم الهاتف" />
            </div>
            <div className="mt-4 flex justify-end">
              <Button>حفظ التغييرات</Button>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card variant="bordered">
          <div className="p-5 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                تغيير كلمة المرور
              </h3>
            </div>
          </div>
          <CardContent className="p-5">
            <div className="max-w-md space-y-4">
              <Input
                label="كلمة المرور الحالية"
                type="password"
                placeholder="أدخل كلمة المرور الحالية"
              />
              <Input
                label="كلمة المرور الجديدة"
                type="password"
                placeholder="أدخل كلمة المرور الجديدة"
              />
              <Input
                label="تأكيد كلمة المرور الجديدة"
                type="password"
                placeholder="أعد إدخال كلمة المرور الجديدة"
              />
              <Button variant="danger">تغيير كلمة المرور</Button>
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
