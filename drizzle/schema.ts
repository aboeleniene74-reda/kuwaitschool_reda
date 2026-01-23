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
 * جدول الفصول الدراسية
 * الفصل الأول والفصل الثاني
 */
export const semesters = mysqlTable("semesters", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(), // "الفصل الأول"
  nameEn: varchar("nameEn", { length: 100 }).notNull(), // "First Semester"
  order: int("order").notNull(), // 1, 2
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Semester = typeof semesters.$inferSelect;
export type InsertSemester = typeof semesters.$inferInsert;

/**
 * جدول أقسام المحتوى
 * الأقسام السبعة لكل فصل دراسي
 */
export const contentCategories = mysqlTable("content_categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  nameEn: varchar("nameEn", { length: 100 }).notNull(),
  order: int("order").notNull(), // 1-7
  icon: varchar("icon", { length: 50 }),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ContentCategory = typeof contentCategories.$inferSelect;
export type InsertContentCategory = typeof contentCategories.$inferInsert;

/**
 * جدول المذكرات الدراسية
 * المذكرات المتاحة للبيع لكل مادة
 */
export const notebooks = mysqlTable("notebooks", {
  id: int("id").autoincrement().primaryKey(),
  subjectId: int("subjectId").notNull().references(() => subjects.id),
  semesterId: int("semesterId").notNull().references(() => semesters.id),
  categoryId: int("categoryId").notNull().references(() => contentCategories.id),
  gradeId: int("gradeId").notNull().references(() => grades.id), // للبحث السريع
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
  userId: int("userId").references(() => users.id), // اختياري للزوار غير المسجلين
  notebookId: int("notebookId").notNull().references(() => notebooks.id),
  rating: int("rating").notNull(), // من 1 إلى 5
  comment: text("comment"),
  visitorName: varchar("visitorName", { length: 100 }), // اسم الزائر إذا لم يكن مسجلاً
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

/**
 * جدول الحصص الدراسية أونلاين
 * الحصص المعلن عنها للطلاب
 */
export const sessions = mysqlTable("sessions", {
  id: int("id").autoincrement().primaryKey(),
  teacherId: int("teacherId").notNull().references(() => users.id),
  subjectId: int("subjectId").references(() => subjects.id), // المادة (اختياري)
  gradeId: int("gradeId").references(() => grades.id), // الصف (اختياري)
  title: varchar("title", { length: 255 }).notNull(), // عنوان الحصة
  description: text("description"), // وصف الحصة
  sessionDate: timestamp("sessionDate").notNull(), // تاريخ ووقت الحصة
  duration: int("duration").notNull(), // مدة الحصة بالدقائق
  meetingLink: text("meetingLink").notNull(), // رابط Zoom/Google Meet/إلخ
  maxStudents: int("maxStudents"), // الحد الأقصى للطلاب (null = غير محدود)
  price: decimal("price", { precision: 10, scale: 2 }).default("0.00").notNull(), // السعر (0 = مجاني)
  isPublished: boolean("isPublished").default(true).notNull(),
  uniqueSlug: varchar("uniqueSlug", { length: 100 }).notNull().unique(), // معرف فريد للرابط
  status: mysqlEnum("status", ["scheduled", "live", "completed", "cancelled"]).default("scheduled").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;

/**
 * جدول حجوزات الحصص
 * الطلاب المسجلين في كل حصة
 */
export const sessionBookings = mysqlTable("session_bookings", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull().references(() => sessions.id),
  userId: int("userId").references(() => users.id), // null للحجوزات بدون تسجيل
  studentName: varchar("studentName", { length: 100 }), // اسم الطالب إذا لم يكن مسجلاً
  studentEmail: varchar("studentEmail", { length: 320 }), // بريد الطالب
  studentPhone: varchar("studentPhone", { length: 20 }), // هاتف الطالب
  status: mysqlEnum("status", ["confirmed", "cancelled", "attended"]).default("confirmed").notNull(),
  bookedAt: timestamp("bookedAt").defaultNow().notNull(),
});

export type SessionBooking = typeof sessionBookings.$inferSelect;
export type InsertSessionBooking = typeof sessionBookings.$inferInsert;

/**
 * جدول تقييمات الموقع العامة
 */
export const siteRatings = mysqlTable("site_ratings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id, { onDelete: "set null" }),
  rating: int("rating").notNull(), // 1-5 نجوم
  comment: text("comment"),
  visitorName: varchar("visitorName", { length: 255 }), // للزوار بدون تسجيل
  visitorEmail: varchar("visitorEmail", { length: 320 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SiteRating = typeof siteRatings.$inferSelect;
export type InsertSiteRating = typeof siteRatings.$inferInsert;

/**
 * جدول تقييمات الحصص
 */
export const sessionRatings = mysqlTable("session_ratings", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull().references(() => sessions.id, { onDelete: "cascade" }),
  userId: int("userId").references(() => users.id, { onDelete: "set null" }),
  rating: int("rating").notNull(), // 1-5 نجوم
  review: text("review"), // مراجعة مفصلة
  studentName: varchar("studentName", { length: 255 }), // للطلاب بدون تسجيل
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SessionRating = typeof sessionRatings.$inferSelect;
export type InsertSessionRating = typeof sessionRatings.$inferInsert;

/**
 * جدول التعليقات المباشرة أثناء الحصة
 */
export const liveComments = mysqlTable("live_comments", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull().references(() => sessions.id, { onDelete: "cascade" }),
  userId: int("userId").references(() => users.id, { onDelete: "set null" }),
  comment: text("comment").notNull(),
  studentName: varchar("studentName", { length: 255 }), // للطلاب بدون تسجيل
  isRead: mysqlEnum("isRead", ["yes", "no"]).default("no").notNull(), // هل قرأه المعلم
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LiveComment = typeof liveComments.$inferSelect;
export type InsertLiveComment = typeof liveComments.$inferInsert;

/**
 * جدول الإعلانات
 * البانرات الإعلانية في الصفحة الرئيسية
 */
export const announcements = mysqlTable("announcements", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: mysqlEnum("type", ["info", "success", "warning", "error"]).default("info").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = typeof announcements.$inferInsert;


/**
 * جدول إعدادات الموقع
 * لتخزين المحتوى القابل للتعديل
 */
export const siteSettings = mysqlTable("site_settings", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 255 }).notNull().unique(),
  value: text("value"),
  type: mysqlEnum("type", ["text", "textarea", "number", "boolean", "json"]).default("text").notNull(),
  label: varchar("label", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }).notNull(), // general, about, contact, etc.
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SiteSetting = typeof siteSettings.$inferSelect;
export type InsertSiteSetting = typeof siteSettings.$inferInsert;


/**
 * جدول الإشعارات
 * لإرسال إشعارات مخصصة للمستخدمين
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id"), // null = إشعار لجميع المستخدمين
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: mysqlEnum("type", ["info", "success", "warning", "error", "notebook", "session"]).default("info").notNull(),
  link: varchar("link", { length: 500 }), // رابط اختياري
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  readAt: timestamp("read_at"),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
