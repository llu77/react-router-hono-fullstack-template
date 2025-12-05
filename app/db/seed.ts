import { db } from "./index";
import { branches, users, employees } from "./schema";
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

  console.log("🎉 اكتملت عملية البذر بنجاح!");
  console.log("\n📋 بيانات تسجيل الدخول:");
  console.log("   المدير: admin / admin123");
  console.log("   مدير فرع: manager1 / user123");
  console.log("   موظف: emp1 / user123");
}

// تشغيل البذر
seed().catch(console.error);
