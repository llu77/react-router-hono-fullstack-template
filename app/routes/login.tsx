import { useState } from "react";
import { Form, useActionData, useNavigation, redirect } from "react-router";
import type { Route } from "./+types/login";
import { Button, Input, Card, CardContent, Alert } from "~/components/ui";
import { Lock, User, LogIn } from "lucide-react";
import { db, users } from "~/db";
import { eq } from "drizzle-orm";
import { verifyPassword, createToken, createAuthCookie, getTokenFromCookie, verifyToken } from "~/lib/auth";

// التحقق من تسجيل الدخول المسبق
export async function loader({ request }: Route.LoaderArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const token = getTokenFromCookie(cookieHeader);

  if (token) {
    const payload = await verifyToken(token);
    if (payload) {
      return redirect("/dashboard");
    }
  }

  return null;
}

// معالجة تسجيل الدخول
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  // التحقق من المدخلات
  if (!username || !password) {
    return { error: "يرجى إدخال اسم المستخدم وكلمة المرور" };
  }

  try {
    // البحث عن المستخدم
    const user = db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .get();

    if (!user) {
      return { error: "اسم المستخدم أو كلمة المرور غير صحيحة" };
    }

    if (!user.isActive) {
      return { error: "هذا الحساب معطل، يرجى التواصل مع المسؤول" };
    }

    // التحقق من كلمة المرور
    const isValidPassword = await verifyPassword(password, user.passwordHash);

    if (!isValidPassword) {
      return { error: "اسم المستخدم أو كلمة المرور غير صحيحة" };
    }

    // تحديث آخر تسجيل دخول
    db.update(users)
      .set({ lastLogin: new Date().toISOString() })
      .where(eq(users.id, user.id))
      .run();

    // إنشاء التوكن
    const token = await createToken({
      userId: user.id,
      username: user.username,
      role: user.role || "employee",
      branchId: user.branchId,
    });

    // إعادة التوجيه مع الكوكي
    return redirect("/dashboard", {
      headers: {
        "Set-Cookie": createAuthCookie(token),
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return { error: "حدث خطأ أثناء تسجيل الدخول" };
  }
}

// Meta tags
export function meta() {
  return [
    { title: "تسجيل الدخول | نظام إدارة الإيرادات" },
    { name: "description", content: "صفحة تسجيل الدخول لنظام إدارة الإيرادات" },
  ];
}

export default function LoginPage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4"
      dir="rtl"
    >
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white mb-4 shadow-lg shadow-blue-500/30">
            <LogIn className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            نظام إدارة الإيرادات
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            قم بتسجيل الدخول للوصول إلى لوحة التحكم
          </p>
        </div>

        {/* Login Card */}
        <Card variant="elevated" padding="lg">
          <CardContent>
            {/* Error Alert */}
            {actionData?.error && (
              <Alert variant="error" className="mb-6">
                {actionData.error}
              </Alert>
            )}

            <Form method="post" className="space-y-5">
              {/* Username */}
              <Input
                name="username"
                label="اسم المستخدم"
                placeholder="أدخل اسم المستخدم"
                autoComplete="username"
                required
                leftIcon={<User className="w-5 h-5" />}
              />

              {/* Password */}
              <div className="relative">
                <Input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  label="كلمة المرور"
                  placeholder="أدخل كلمة المرور"
                  autoComplete="current-password"
                  required
                  leftIcon={<Lock className="w-5 h-5" />}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-12 top-9 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? "إخفاء" : "إظهار"}
                </button>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isSubmitting}
              >
                {isSubmitting ? "جارٍ تسجيل الدخول..." : "تسجيل الدخول"}
              </Button>
            </Form>

            {/* Demo Credentials */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-3">
                بيانات تجريبية للدخول:
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 text-center">
                  <span className="text-gray-500 dark:text-gray-400">مدير:</span>
                  <div className="font-mono text-gray-700 dark:text-gray-300">admin / admin123</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 text-center">
                  <span className="text-gray-500 dark:text-gray-400">موظف:</span>
                  <div className="font-mono text-gray-700 dark:text-gray-300">emp1 / user123</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          جميع الحقوق محفوظة © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
