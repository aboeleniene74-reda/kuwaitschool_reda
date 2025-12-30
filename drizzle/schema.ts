import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal } from "drizzle-orm/mysql-core";

/**
 * جدول المستخدمين الأساسي - يدعم نظام المصادقة
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "teacher", "student"]).default("student").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * جدول المواد الدراسية
 */
export const subjects = mysqlTable("subjects", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 100 }), // اسم أيقونة lucide-react
  color: varchar("color", { length: 50 }), // لون المادة للتمييز البصري
  teacherId: int("teacherId").references(() => users.id),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subject = typeof subjects.$inferSelect;
export type InsertSubject = typeof subjects.$inferInsert;

/**
 * جدول الدروس
 */
export const lessons = mysqlTable("lessons", {
  id: int("id").autoincrement().primaryKey(),
  subjectId: int("subjectId").notNull().references(() => subjects.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  content: text("content"), // محتوى الدرس النصي
  videoUrl: text("videoUrl"), // رابط الفيديو التعليمي
  pdfUrl: text("pdfUrl"), // رابط ملف PDF
  orderIndex: int("orderIndex").default(0).notNull(), // ترتيب الدرس
  isPublished: boolean("isPublished").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Lesson = typeof lessons.$inferSelect;
export type InsertLesson = typeof lessons.$inferInsert;

/**
 * جدول الاختبارات
 */
export const quizzes = mysqlTable("quizzes", {
  id: int("id").autoincrement().primaryKey(),
  subjectId: int("subjectId").notNull().references(() => subjects.id),
  lessonId: int("lessonId").references(() => lessons.id), // اختياري - يمكن أن يكون الاختبار عام للمادة
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  duration: int("duration"), // مدة الاختبار بالدقائق
  passingScore: decimal("passingScore", { precision: 5, scale: 2 }), // الدرجة المطلوبة للنجاح
  isPublished: boolean("isPublished").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Quiz = typeof quizzes.$inferSelect;
export type InsertQuiz = typeof quizzes.$inferInsert;

/**
 * جدول أسئلة الاختبارات
 */
export const questions = mysqlTable("questions", {
  id: int("id").autoincrement().primaryKey(),
  quizId: int("quizId").notNull().references(() => quizzes.id),
  questionText: text("questionText").notNull(),
  optionA: text("optionA").notNull(),
  optionB: text("optionB").notNull(),
  optionC: text("optionC").notNull(),
  optionD: text("optionD").notNull(),
  correctAnswer: mysqlEnum("correctAnswer", ["A", "B", "C", "D"]).notNull(),
  points: decimal("points", { precision: 5, scale: 2 }).default("1.00").notNull(),
  orderIndex: int("orderIndex").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Question = typeof questions.$inferSelect;
export type InsertQuestion = typeof questions.$inferInsert;

/**
 * جدول محاولات الاختبارات
 */
export const quizAttempts = mysqlTable("quizAttempts", {
  id: int("id").autoincrement().primaryKey(),
  quizId: int("quizId").notNull().references(() => quizzes.id),
  studentId: int("studentId").notNull().references(() => users.id),
  score: decimal("score", { precision: 5, scale: 2 }).notNull(),
  totalPoints: decimal("totalPoints", { precision: 5, scale: 2 }).notNull(),
  isPassed: boolean("isPassed").default(false).notNull(),
  startedAt: timestamp("startedAt").notNull(),
  completedAt: timestamp("completedAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type InsertQuizAttempt = typeof quizAttempts.$inferInsert;

/**
 * جدول إجابات الطلاب
 */
export const studentAnswers = mysqlTable("studentAnswers", {
  id: int("id").autoincrement().primaryKey(),
  attemptId: int("attemptId").notNull().references(() => quizAttempts.id),
  questionId: int("questionId").notNull().references(() => questions.id),
  selectedAnswer: mysqlEnum("selectedAnswer", ["A", "B", "C", "D"]).notNull(),
  isCorrect: boolean("isCorrect").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type StudentAnswer = typeof studentAnswers.$inferSelect;
export type InsertStudentAnswer = typeof studentAnswers.$inferInsert;

/**
 * جدول الواجبات
 */
export const assignments = mysqlTable("assignments", {
  id: int("id").autoincrement().primaryKey(),
  subjectId: int("subjectId").notNull().references(() => subjects.id),
  lessonId: int("lessonId").references(() => lessons.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  dueDate: timestamp("dueDate").notNull(),
  maxScore: decimal("maxScore", { precision: 5, scale: 2 }).default("100.00").notNull(),
  isPublished: boolean("isPublished").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Assignment = typeof assignments.$inferSelect;
export type InsertAssignment = typeof assignments.$inferInsert;

/**
 * جدول تسليمات الواجبات
 */
export const submissions = mysqlTable("submissions", {
  id: int("id").autoincrement().primaryKey(),
  assignmentId: int("assignmentId").notNull().references(() => assignments.id),
  studentId: int("studentId").notNull().references(() => users.id),
  fileUrl: text("fileUrl"), // رابط الملف المرفوع على S3
  fileKey: text("fileKey"), // مفتاح الملف في S3
  notes: text("notes"), // ملاحظات الطالب
  score: decimal("score", { precision: 5, scale: 2 }),
  feedback: text("feedback"), // ملاحظات المعلم
  isGraded: boolean("isGraded").default(false).notNull(),
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
  gradedAt: timestamp("gradedAt"),
});

export type Submission = typeof submissions.$inferSelect;
export type InsertSubmission = typeof submissions.$inferInsert;

/**
 * جدول تقدم الطلاب في الدروس
 */
export const lessonProgress = mysqlTable("lessonProgress", {
  id: int("id").autoincrement().primaryKey(),
  lessonId: int("lessonId").notNull().references(() => lessons.id),
  studentId: int("studentId").notNull().references(() => users.id),
  isCompleted: boolean("isCompleted").default(false).notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LessonProgress = typeof lessonProgress.$inferSelect;
export type InsertLessonProgress = typeof lessonProgress.$inferInsert;
