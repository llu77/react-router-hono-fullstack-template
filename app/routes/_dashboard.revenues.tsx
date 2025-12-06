import { useState, useMemo, useEffect } from "react";
import { Form, useActionData, useLoaderData, useNavigation } from "react-router";
import type { Route } from "./+types/_dashboard.revenues";
import { Header } from "~/components/layout";
import { Button, Input, Select, Card, CardContent, Alert, Badge } from "~/components/ui";
import {
  Save,
  CheckCircle,
  XCircle,
  Calculator,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { formatCurrency, getCurrentDate, formatDate } from "~/lib/utils";
import { db, employees, dailyRevenues, employeeRevenues, branches } from "~/db";
import { eq, and } from "drizzle-orm";
import { getTokenFromCookie, verifyToken } from "~/lib/auth";

// جلب بيانات الموظفين والإيراد الحالي
export async function loader({ request }: Route.LoaderArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const token = getTokenFromCookie(cookieHeader);
  const payload = token ? await verifyToken(token) : null;

  if (!payload) {
    return { employees: [], branches: [], currentRevenue: null, branchId: null };
  }

  // جلب الفروع
  const allBranches = db.select().from(branches).where(eq(branches.isActive, true)).all();

  // تحديد الفرع (للمدير يستخدم فرعه، للأدمن يمكنه اختيار أي فرع)
  const userBranchId = payload.role === "admin" ? null : payload.branchId;

  // جلب الموظفين
  let employeesList;
  if (userBranchId) {
    employeesList = db
      .select()
      .from(employees)
      .where(and(eq(employees.branchId, userBranchId), eq(employees.isActive, true)))
      .all();
  } else {
    employeesList = db.select().from(employees).where(eq(employees.isActive, true)).all();
  }

  // جلب إيراد اليوم إن وجد
  const today = getCurrentDate();
  let currentRevenue = null;
  let employeeRevenuesList: any[] = [];

  if (userBranchId) {
    currentRevenue = db
      .select()
      .from(dailyRevenues)
      .where(
        and(
          eq(dailyRevenues.date, today),
          eq(dailyRevenues.branchId, userBranchId)
        )
      )
      .get();

    if (currentRevenue) {
      employeeRevenuesList = db
        .select()
        .from(employeeRevenues)
        .where(eq(employeeRevenues.dailyRevenueId, currentRevenue.id))
        .all();
    }
  }

  return {
    employees: employeesList,
    branches: allBranches,
    currentRevenue,
    employeeRevenues: employeeRevenuesList,
    branchId: userBranchId,
    userRole: payload.role,
    today,
  };
}

// حفظ الإيراد
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const cookieHeader = request.headers.get("Cookie");
  const token = getTokenFromCookie(cookieHeader);
  const payload = token ? await verifyToken(token) : null;

  if (!payload) {
    return { error: "غير مصرح" };
  }

  const branchId = payload.branchId;
  if (!branchId) {
    return { error: "لم يتم تحديد الفرع" };
  }

  const today = getCurrentDate();
  const cash = parseFloat(formData.get("cash") as string) || 0;
  const network = parseFloat(formData.get("network") as string) || 0;
  const total = parseFloat(formData.get("total") as string) || 0;
  const isMatched = formData.get("isMatched") === "true";
  const mismatchReason = formData.get("mismatchReason") as string;

  // استخراج إيرادات الموظفين
  const employeeData: { employeeId: number; cash: number; network: number }[] = [];
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("emp_cash_")) {
      const empId = parseInt(key.replace("emp_cash_", ""));
      const empCash = parseFloat(value as string) || 0;
      const empNetwork = parseFloat(formData.get(`emp_network_${empId}`) as string) || 0;
      if (empId) {
        employeeData.push({ employeeId: empId, cash: empCash, network: empNetwork });
      }
    }
  }

  try {
    // التحقق من وجود سجل لليوم
    const existingRevenue = db
      .select()
      .from(dailyRevenues)
      .where(and(eq(dailyRevenues.date, today), eq(dailyRevenues.branchId, branchId)))
      .get();

    // حساب الموازنة
    const totalEmployeeRevenue = employeeData.reduce((sum, e) => sum + e.cash + e.network, 0);
    const balance = totalEmployeeRevenue - cash;

    let dailyRevenueId: number;

    if (existingRevenue) {
      // تحديث السجل الموجود
      db.update(dailyRevenues)
        .set({
          cash,
          network,
          balance,
          total,
          isMatched,
          mismatchReason: isMatched ? null : mismatchReason,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(dailyRevenues.id, existingRevenue.id))
        .run();

      dailyRevenueId = existingRevenue.id;

      // حذف إيرادات الموظفين القديمة
      db.delete(employeeRevenues)
        .where(eq(employeeRevenues.dailyRevenueId, dailyRevenueId))
        .run();
    } else {
      // إنشاء سجل جديد
      const result = db
        .insert(dailyRevenues)
        .values({
          date: today,
          branchId,
          cash,
          network,
          balance,
          total,
          isMatched,
          mismatchReason: isMatched ? null : mismatchReason,
          createdBy: payload.userId,
        })
        .returning()
        .get();

      dailyRevenueId = result.id;
    }

    // إضافة إيرادات الموظفين
    for (const emp of employeeData) {
      db.insert(employeeRevenues)
        .values({
          dailyRevenueId,
          employeeId: emp.employeeId,
          cashAmount: emp.cash,
          networkAmount: emp.network,
          totalAmount: emp.cash + emp.network,
        })
        .run();
    }

    return { success: true, message: "تم حفظ الإيراد بنجاح" };
  } catch (error) {
    console.error("Save error:", error);
    return { error: "حدث خطأ أثناء الحفظ" };
  }
}

export function meta() {
  return [{ title: "الإيرادات | نظام إدارة الإيرادات" }];
}

interface EmployeeRevenueEntry {
  employeeId: number;
  name: string;
  cash: number;
  network: number;
}

export default function RevenuesPage() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  // حالة النموذج
  const [cash, setCash] = useState(0);
  const [network, setNetwork] = useState(0);
  const [total, setTotal] = useState(0);
  const [mismatchReason, setMismatchReason] = useState("");
  const [employeeEntries, setEmployeeEntries] = useState<EmployeeRevenueEntry[]>([]);

  // تهيئة البيانات من loader
  useEffect(() => {
    if (loaderData.currentRevenue) {
      setCash(loaderData.currentRevenue.cash);
      setNetwork(loaderData.currentRevenue.network);
      setTotal(loaderData.currentRevenue.total);
      setMismatchReason(loaderData.currentRevenue.mismatchReason || "");
    }

    // تهيئة إيرادات الموظفين
    const entries: EmployeeRevenueEntry[] = loaderData.employees.map((emp) => {
      const existingEntry = loaderData.employeeRevenues?.find(
        (er: any) => er.employeeId === emp.id
      );
      return {
        employeeId: emp.id,
        name: emp.name,
        cash: existingEntry?.cashAmount || 0,
        network: existingEntry?.networkAmount || 0,
      };
    });
    setEmployeeEntries(entries);
  }, [loaderData]);

  // حساب المجاميع
  const calculations = useMemo(() => {
    const totalEmployeeCash = employeeEntries.reduce((sum, e) => sum + e.cash, 0);
    const totalEmployeeNetwork = employeeEntries.reduce((sum, e) => sum + e.network, 0);
    const totalEmployeeRevenue = totalEmployeeCash + totalEmployeeNetwork;
    const calculatedBalance = totalEmployeeRevenue - cash;
    const expectedTotal = cash + network;

    // التحقق من المطابقة
    const isBalanceMatched = Math.abs(calculatedBalance - network) < 0.01;
    const isTotalMatched = Math.abs(totalEmployeeRevenue - total) < 0.01 && Math.abs(expectedTotal - total) < 0.01;
    const isMatched = isBalanceMatched && isTotalMatched && total > 0;

    return {
      totalEmployeeCash,
      totalEmployeeNetwork,
      totalEmployeeRevenue,
      calculatedBalance,
      expectedTotal,
      isBalanceMatched,
      isTotalMatched,
      isMatched,
    };
  }, [employeeEntries, cash, network, total]);

  // تحديث إيراد موظف
  const updateEmployeeEntry = (
    employeeId: number,
    field: "cash" | "network",
    value: number
  ) => {
    setEmployeeEntries((prev) =>
      prev.map((entry) =>
        entry.employeeId === employeeId ? { ...entry, [field]: value } : entry
      )
    );
  };

  return (
    <div className="min-h-screen">
      <Header
        title="إدخال الإيراد اليومي"
        subtitle={formatDate(loaderData.today || getCurrentDate())}
      />

      <div className="p-6">
        {/* Alerts */}
        {actionData?.success && (
          <Alert variant="success" className="mb-6">
            {actionData.message}
          </Alert>
        )}
        {actionData?.error && (
          <Alert variant="error" className="mb-6">
            {actionData.error}
          </Alert>
        )}

        <Form method="post">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Revenue Input */}
            <Card variant="bordered" className="lg:col-span-2">
              <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    البيانات المالية الرئيسية
                  </h3>
                </div>
              </div>
              <CardContent className="p-5">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Input
                    label="الكاش"
                    name="cash"
                    type="number"
                    step="0.01"
                    value={cash}
                    onChange={(e) => setCash(parseFloat(e.target.value) || 0)}
                    className="text-lg font-semibold"
                  />
                  <Input
                    label="الشبكة"
                    name="network"
                    type="number"
                    step="0.01"
                    value={network}
                    onChange={(e) => setNetwork(parseFloat(e.target.value) || 0)}
                    className="text-lg font-semibold"
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      الموازنة (تلقائي)
                    </label>
                    <div className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-lg font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(calculations.calculatedBalance)}
                    </div>
                    <input type="hidden" name="balance" value={calculations.calculatedBalance} />
                  </div>
                  <Input
                    label="المجموع"
                    name="total"
                    type="number"
                    step="0.01"
                    value={total}
                    onChange={(e) => setTotal(parseFloat(e.target.value) || 0)}
                    className="text-lg font-semibold"
                  />
                </div>

                {/* Formula Explanation */}
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-700 dark:text-blue-300">
                  <Calculator className="w-4 h-4 inline ml-1" />
                  <strong>المعادلة:</strong> الموازنة = مجموع إيراد الموظفين - الكاش | المجموع = الكاش + الشبكة
                </div>
              </CardContent>
            </Card>

            {/* Verification Status */}
            <Card variant="bordered">
              <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  حالة المطابقة
                </h3>
              </div>
              <CardContent className="p-5">
                <div className="text-center">
                  {calculations.isMatched ? (
                    <div className="space-y-3">
                      <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                      <Badge variant="success" size="lg">
                        مطابق
                      </Badge>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        جميع المجاميع متطابقة
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <XCircle className="w-16 h-16 text-red-500 mx-auto" />
                      <Badge variant="error" size="lg">
                        غير مطابق
                      </Badge>
                      <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                        {!calculations.isBalanceMatched && (
                          <p>الموازنة لا تساوي الشبكة</p>
                        )}
                        {!calculations.isTotalMatched && (
                          <p>المجموع غير متطابق</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Summary */}
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">مجموع الموظفين:</span>
                    <span className="font-medium">{formatCurrency(calculations.totalEmployeeRevenue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">المجموع المدخل:</span>
                    <span className="font-medium">{formatCurrency(total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">الموازنة:</span>
                    <span className={calculations.isBalanceMatched ? "text-green-600" : "text-red-600"}>
                      {formatCurrency(calculations.calculatedBalance)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">الشبكة:</span>
                    <span className={calculations.isBalanceMatched ? "text-green-600" : "text-red-600"}>
                      {formatCurrency(network)}
                    </span>
                  </div>
                </div>

                <input type="hidden" name="isMatched" value={calculations.isMatched.toString()} />
              </CardContent>
            </Card>
          </div>

          {/* Employee Revenues */}
          <Card variant="bordered" className="mt-6">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                إيرادات الموظفين
              </h3>
            </div>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">
                        الموظف
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">
                        الكاش
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">
                        الشبكة
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">
                        المجموع
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {employeeEntries.map((entry) => (
                      <tr key={entry.employeeId} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                        <td className="px-4 py-3">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {entry.name}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            step="0.01"
                            name={`emp_cash_${entry.employeeId}`}
                            value={entry.cash || ""}
                            onChange={(e) =>
                              updateEmployeeEntry(
                                entry.employeeId,
                                "cash",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-28 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            step="0.01"
                            name={`emp_network_${entry.employeeId}`}
                            value={entry.network || ""}
                            onChange={(e) =>
                              updateEmployeeEntry(
                                entry.employeeId,
                                "network",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-28 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(entry.cash + entry.network)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                      <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">
                        الإجمالي
                      </td>
                      <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">
                        {formatCurrency(calculations.totalEmployeeCash)}
                      </td>
                      <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">
                        {formatCurrency(calculations.totalEmployeeNetwork)}
                      </td>
                      <td className="px-4 py-3 font-bold text-blue-600 dark:text-blue-400">
                        {formatCurrency(calculations.totalEmployeeRevenue)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Mismatch Reason (if not matched) */}
          {!calculations.isMatched && (
            <Card variant="bordered" className="mt-6 border-red-200 dark:border-red-800">
              <CardContent className="p-5">
                <Alert variant="warning" className="mb-4">
                  المجاميع غير متطابقة. يرجى كتابة سبب عدم المطابقة للمتابعة.
                </Alert>
                <Input
                  label="سبب عدم المطابقة"
                  name="mismatchReason"
                  value={mismatchReason}
                  onChange={(e) => setMismatchReason(e.target.value)}
                  placeholder="اكتب سبب الفرق في المجاميع..."
                  required={!calculations.isMatched}
                />
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <div className="mt-6 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="w-4 h-4 ml-2" />
              تحديث
            </Button>
            <Button
              type="submit"
              size="lg"
              isLoading={isSubmitting}
              disabled={!calculations.isMatched && !mismatchReason}
            >
              <Save className="w-5 h-5 ml-2" />
              حفظ الإيراد
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
