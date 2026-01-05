import { decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

/**
 * جدول المستخدمين - نظام المصادقة الأساسي
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "teacher"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * جدول الصفوف الدراسية
 * الصف العاشر، الحادي عشر، الثاني عشر
 */
export const grades = mysqlTable("grades", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(), // "الصف العاشر"
  nameEn: varchar("nameEn", { length: 100 }).notNull(), // "Grade 10"
  order: int("order").notNull(), // 10, 11, 12
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Grade = typeof grades.$inferSelect;
export type InsertGrade = typeof grades.$inferInsert;

/**
 * جدول المواد العلمية
 * كيمياء، أحياء، فيزياء، جيولوجيا
 */
export const subjects = mysqlTable("subjects", {
  id: int("id").autoincrement().primaryKey(),
  gradeId: int("gradeId").notNull().references(() => grades.id),
  name: varchar("name", { length: 100 }).notNull(), // "الكيمياء"
  nameEn: varchar("nameEn", { length: 100 }).notNull(), // "Chemistry"
  icon: varchar("icon", { length: 50 }), // اسم الأيقونة
  color: varchar("color", { length: 50 }).default("oklch(0.48 0.18 250)"), // لون المادة
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subject = typeof subjects.$inferSelect;
export type InsertSubject = typeof subjects.$inferInsert;

/**
 * جدول المذكرات الدراسية
 * المذكرات المتاحة للبيع لكل مادة
 */
export const notebooks = mysqlTable("notebooks", {
  id: int("id").autoincrement().primaryKey(),
  subjectId: int("subjectId").notNull().references(() => subjects.id),
  teacherId: int("teacherId").references(() => users.id), // المعلم صاحب المذكرة
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(), // السعر بالدينار الكويتي
  pages: int("pages"), // عدد الصفحات
  fileUrl: text("fileUrl"), // رابط ملف PDF الكامل (للمشترين فقط)
  previewUrl: text("previewUrl"), // رابط معاينة (صفحات مجانية)
  coverImageUrl: text("coverImageUrl"), // صورة الغلاف
  isPublished: boolean("isPublished").default(false).notNull(),
  isFeatured: boolean("isFeatured").default(false).notNull(), // مذكرة مميزة
  salesCount: int("salesCount").default(0).notNull(), // عدد المبيعات
  rating: decimal("rating", { precision: 3, scale: 2 }), // التقييم من 5
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Notebook = typeof notebooks.$inferSelect;
export type InsertNotebook = typeof notebooks.$inferInsert;

/**
 * جدول المشتريات
 * سجل شراء المذكرات من قبل المستخدمين
 */
export const purchases = mysqlTable("purchases", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  notebookId: int("notebookId").notNull().references(() => notebooks.id),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(), // السعر وقت الشراء
  paymentMethod: varchar("paymentMethod", { length: 50 }), // طريقة الدفع
  transactionId: varchar("transactionId", { length: 255 }), // معرف المعاملة
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).default("pending").notNull(),
  purchasedAt: timestamp("purchasedAt").defaultNow().notNull(),
});

export type Purchase = typeof purchases.$inferSelect;
export type InsertPurchase = typeof purchases.$inferInsert;

/**
 * جدول التقييمات
 * تقييمات المستخدمين للمذكرات
 */
export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  notebookId: int("notebookId").notNull().references(() => notebooks.id),
  rating: int("rating").notNull(), // من 1 إلى 5
  comment: text("comment"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

/**
 * جدول الإحصائيات
 * تتبع الزيارات والمشاهدات والتحميلات
 */
export const statistics = mysqlTable("statistics", {
  id: int("id").autoincrement().primaryKey(),
  notebookId: int("notebookId").references(() => notebooks.id), // null للزيارات العامة
  type: mysqlEnum("type", ["visit", "view", "download"]).notNull(),
  userId: int("userId").references(() => users.id), // null للزوار غير المسجلين
  ipAddress: varchar("ipAddress", { length: 45 }), // لتتبع الزوار الفريدين
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Statistic = typeof statistics.$inferSelect;
export type InsertStatistic = typeof statistics.$inferInsert;

/**
 * جدول التعليقات
 * تعليقات الزوار على المذكرات
 */
export const comments = mysqlTable("comments", {
  id: int("id").autoincrement().primaryKey(),
  notebookId: int("notebookId").notNull().references(() => notebooks.id),
  userId: int("userId").references(() => users.id), // null للزوار غير المسجلين
  authorName: varchar("authorName", { length: 100 }), // اسم الزائر إذا لم يكن مسجلاً
  authorEmail: varchar("authorEmail", { length: 320 }), // بريد اختياري
  content: text("content").notNull(),
  isApproved: boolean("isApproved").default(false).notNull(), // موافقة الأدمن
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Comment = typeof comments.$inferSelect;
export type InsertComment = typeof comments.$inferInsert;
