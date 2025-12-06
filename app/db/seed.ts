import { db } from "./index";
import { branches, users, employees, expenseCategories } from "./schema";
import { hash } from "bcryptjs";

/**
 * ملف البذر - يقوم بإضافة البيانات الافتراضية
 */
async function seed() {
  console.log("🌱 بدء عملية البذر...");

  // إضافة الفروع
  console.log("📍 إضافة الفروع...");
  const branchData = [
    { name: "الفرع الرئيسي", location: "الرياض - العليا" },
    { name: "فرع الشرق", location: "الدمام - الكورنيش" },
    { name: "فرع الغرب", location: "جدة - الحمرا" },
  ];

  const insertedBranches = db.insert(branches).values(branchData).returning().all();
  console.log(`✅ تم إضافة ${insertedBranches.length} فروع`);

  // إضافة المستخدمين
  console.log("👤 إضافة المستخدمين...");
  const adminPasswordHash = await hash("admin123", 10);
  const userPasswordHash = await hash("user123", 10);

  const userData = [
    {
      username: "admin",
      passwordHash: adminPasswordHash,
      fullName: "مدير النظام",
      role: "admin" as const,
      branchId: insertedBranches[0].id,
    },
    {
      username: "manager1",
      passwordHash: userPasswordHash,
      fullName: "أحمد المدير",
      role: "manager" as const,
      branchId: insertedBranches[0].id,
    },
    {
      username: "emp1",
      passwordHash: userPasswordHash,
      fullName: "سارة الموظفة",
      role: "employee" as const,
      branchId: insertedBranches[0].id,
    },
  ];

  const insertedUsers = db.insert(users).values(userData).returning().all();
  console.log(`✅ تم إضافة ${insertedUsers.length} مستخدمين`);

  // إضافة الموظفين لكل فرع
  console.log("👥 إضافة الموظفين...");
  const employeeNames = [
    "أحمد محمد",
    "سارة علي",
    "خالد حسن",
    "فاطمة أحمد",
    "محمد سعيد",
  ];

  const allEmployees: { name: string; employeeCode: string; branchId: number }[] = [];

  insertedBranches.forEach((branch, branchIndex) => {
    employeeNames.forEach((name, empIndex) => {
      allEmployees.push({
        name,
        employeeCode: `EMP-${branchIndex + 1}-${empIndex + 1}`,
        branchId: branch.id,
      });
    });
  });

  const insertedEmployees = db.insert(employees).values(allEmployees).returning().all();
  console.log(`✅ تم إضافة ${insertedEmployees.length} موظفين`);

  // إضافة فئات المصاريف
  console.log("💰 إضافة فئات المصاريف...");
  const categoriesData = [
    { code: "electricity",         name: "كهرباء",              icon: "Zap",           color: "yellow",  sortOrder: 1 },
    { code: "internet",            name: "انترنت",              icon: "Wifi",          color: "blue",    sortOrder: 2 },
    { code: "shop_supplies",       name: "أغراض محل",           icon: "ShoppingBag",   color: "purple",  sortOrder: 3 },
    { code: "improvements",        name: "تحسينات",             icon: "Wrench",        color: "gray",    sortOrder: 4 },
    { code: "weekly_bonus",        name: "بونص أسبوعي",         icon: "Gift",          color: "green",   sortOrder: 5 },
    { code: "paper",               name: "ورق",                 icon: "FileText",      color: "slate",   sortOrder: 6 },
    { code: "violation",           name: "مخالفة",              icon: "AlertTriangle", color: "red",     sortOrder: 7 },
    { code: "residency",           name: "إصدار/تجديد إقامات",  icon: "CreditCard",    color: "indigo",  sortOrder: 8 },
    { code: "health_certificates", name: "شهادات صحية",         icon: "Heart",         color: "pink",    sortOrder: 9 },
    { code: "government_fees",     name: "رسوم حكومية",         icon: "Building",      color: "amber",   sortOrder: 10 },
    { code: "shop_permits",        name: "تصاريح محل",          icon: "FileCheck",     color: "teal",    sortOrder: 11 },
    { code: "housing_rent",        name: "إيجار سكن",           icon: "Home",          color: "orange",  sortOrder: 12 },
    { code: "shop_rent",           name: "إيجار محل",           icon: "Store",         color: "cyan",    sortOrder: 13 },
    { code: "travel_tickets",      name: "تذاكر سفر",           icon: "Plane",         color: "sky",     sortOrder: 14 },
    { code: "advance_payment",     name: "سلفة",                icon: "HandCoins",     color: "emerald", sortOrder: 15 },
  ];

  const insertedCategories = db.insert(expenseCategories).values(categoriesData).returning().all();
  console.log(`✅ تم إضافة ${insertedCategories.length} فئة مصاريف`);

  console.log("🎉 اكتملت عملية البذر بنجاح!");
  console.log("\n📋 بيانات تسجيل الدخول:");
  console.log("   المدير: admin / admin123");
  console.log("   مدير فرع: manager1 / user123");
  console.log("   موظف: emp1 / user123");
}

// تشغيل البذر
seed().catch(console.error);
