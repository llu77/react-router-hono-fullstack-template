import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  // الصفحة الرئيسية - تحويل إلى تسجيل الدخول
  index("routes/home.tsx"),

  // صفحة تسجيل الدخول
  route("login", "routes/login.tsx"),

  // صفحة تسجيل الخروج
  route("logout", "routes/logout.tsx"),

  // Dashboard Layout مع الصفحات الداخلية
  layout("routes/_dashboard.tsx", [
    route("dashboard", "routes/_dashboard._index.tsx", { index: true }),
    route("dashboard/revenues", "routes/_dashboard.revenues.tsx"),
    route("dashboard/employees", "routes/_dashboard.employees.tsx"),
    route("dashboard/branches", "routes/_dashboard.branches.tsx"),
    route("dashboard/reports", "routes/_dashboard.reports.tsx"),
    route("dashboard/settings", "routes/_dashboard.settings.tsx"),
  ]),
] satisfies RouteConfig;
