import { Outlet, redirect } from "react-router";
import type { Route } from "./+types/_dashboard";
import { DashboardLayout } from "~/components/layout";
import { getTokenFromCookie, verifyToken } from "~/lib/auth";
import { db, users, branches } from "~/db";
import { eq } from "drizzle-orm";

// التحقق من المصادقة لجميع صفحات الداشبورد
export async function loader({ request }: Route.LoaderArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const token = getTokenFromCookie(cookieHeader);

  if (!token) {
    return redirect("/login");
  }

  const payload = await verifyToken(token);

  if (!payload) {
    return redirect("/login");
  }

  // جلب بيانات المستخدم الكاملة
  const user = db
    .select()
    .from(users)
    .where(eq(users.id, payload.userId))
    .get();

  if (!user || !user.isActive) {
    return redirect("/login");
  }

  // جلب اسم الفرع
  let branchName: string | undefined;
  if (user.branchId) {
    const branch = db
      .select()
      .from(branches)
      .where(eq(branches.id, user.branchId))
      .get();
    branchName = branch?.name;
  }

  return {
    user: {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role || "employee",
      branchId: user.branchId,
      branchName,
    },
  };
}

export default function DashboardLayoutRoute({
  loaderData,
}: Route.ComponentProps) {
  const { user } = loaderData;

  return (
    <DashboardLayout user={user}>
      <Outlet context={{ user }} />
    </DashboardLayout>
  );
}
