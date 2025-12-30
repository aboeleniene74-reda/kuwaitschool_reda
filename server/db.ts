import { eq, and, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  subjects, lessons, quizzes, questions, 
  quizAttempts, studentAnswers, assignments, 
  submissions, lessonProgress,
  type Subject, type Lesson, type Quiz, type Question,
  type QuizAttempt, type Assignment, type Submission,
  type LessonProgress
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ المواد الدراسية ============

export async function getAllSubjects() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(subjects).where(eq(subjects.isActive, true)).orderBy(subjects.name);
}

export async function getSubjectById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(subjects).where(eq(subjects.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createSubject(data: typeof subjects.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(subjects).values(data);
  return result;
}

export async function updateSubject(id: number, data: Partial<Subject>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(subjects).set(data).where(eq(subjects.id, id));
}

// ============ الدروس ============

export async function getLessonsBySubject(subjectId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(lessons)
    .where(and(eq(lessons.subjectId, subjectId), eq(lessons.isPublished, true)))
    .orderBy(lessons.orderIndex);
}

export async function getAllLessonsForTeacher(subjectId?: number) {
  const db = await getDb();
  if (!db) return [];
  if (subjectId) {
    return await db.select().from(lessons)
      .where(eq(lessons.subjectId, subjectId))
      .orderBy(lessons.orderIndex);
  }
  return await db.select().from(lessons).orderBy(lessons.orderIndex);
}

export async function getLessonById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(lessons).where(eq(lessons.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createLesson(data: typeof lessons.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(lessons).values(data);
  return result;
}

export async function updateLesson(id: number, data: Partial<Lesson>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(lessons).set(data).where(eq(lessons.id, id));
}

// ============ الاختبارات ============

export async function getQuizzesBySubject(subjectId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(quizzes)
    .where(and(eq(quizzes.subjectId, subjectId), eq(quizzes.isPublished, true)))
    .orderBy(desc(quizzes.createdAt));
}

export async function getAllQuizzesForTeacher(subjectId?: number) {
  const db = await getDb();
  if (!db) return [];
  if (subjectId) {
    return await db.select().from(quizzes)
      .where(eq(quizzes.subjectId, subjectId))
      .orderBy(desc(quizzes.createdAt));
  }
  return await db.select().from(quizzes).orderBy(desc(quizzes.createdAt));
}

export async function getQuizById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(quizzes).where(eq(quizzes.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createQuiz(data: typeof quizzes.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(quizzes).values(data);
  return result;
}

export async function updateQuiz(id: number, data: Partial<Quiz>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(quizzes).set(data).where(eq(quizzes.id, id));
}

// ============ الأسئلة ============

export async function getQuestionsByQuiz(quizId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(questions)
    .where(eq(questions.quizId, quizId))
    .orderBy(questions.orderIndex);
}

export async function createQuestion(data: typeof questions.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(questions).values(data);
  return result;
}

export async function updateQuestion(id: number, data: Partial<Question>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(questions).set(data).where(eq(questions.id, id));
}

export async function deleteQuestion(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(questions).where(eq(questions.id, id));
}

// ============ محاولات الاختبارات ============

export async function createQuizAttempt(data: typeof quizAttempts.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(quizAttempts).values(data);
  return result;
}

export async function getStudentQuizAttempts(studentId: number, quizId?: number) {
  const db = await getDb();
  if (!db) return [];
  if (quizId) {
    return await db.select().from(quizAttempts)
      .where(and(eq(quizAttempts.studentId, studentId), eq(quizAttempts.quizId, quizId)))
      .orderBy(desc(quizAttempts.completedAt));
  }
  return await db.select().from(quizAttempts)
    .where(eq(quizAttempts.studentId, studentId))
    .orderBy(desc(quizAttempts.completedAt));
}

export async function createStudentAnswer(data: typeof studentAnswers.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(studentAnswers).values(data);
  return result;
}

// ============ الواجبات ============

export async function getAssignmentsBySubject(subjectId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(assignments)
    .where(and(eq(assignments.subjectId, subjectId), eq(assignments.isPublished, true)))
    .orderBy(desc(assignments.dueDate));
}

export async function getAllAssignmentsForTeacher(subjectId?: number) {
  const db = await getDb();
  if (!db) return [];
  if (subjectId) {
    return await db.select().from(assignments)
      .where(eq(assignments.subjectId, subjectId))
      .orderBy(desc(assignments.dueDate));
  }
  return await db.select().from(assignments).orderBy(desc(assignments.dueDate));
}

export async function getAssignmentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(assignments).where(eq(assignments.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createAssignment(data: typeof assignments.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(assignments).values(data);
  return result;
}

export async function updateAssignment(id: number, data: Partial<Assignment>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(assignments).set(data).where(eq(assignments.id, id));
}

// ============ تسليمات الواجبات ============

export async function getSubmissionsByAssignment(assignmentId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(submissions)
    .where(eq(submissions.assignmentId, assignmentId))
    .orderBy(desc(submissions.submittedAt));
}

export async function getStudentSubmission(assignmentId: number, studentId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(submissions)
    .where(and(eq(submissions.assignmentId, assignmentId), eq(submissions.studentId, studentId)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createSubmission(data: typeof submissions.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(submissions).values(data);
  return result;
}

export async function updateSubmission(id: number, data: Partial<Submission>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(submissions).set(data).where(eq(submissions.id, id));
}

// ============ تقدم الطلاب ============

export async function getLessonProgress(lessonId: number, studentId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(lessonProgress)
    .where(and(eq(lessonProgress.lessonId, lessonId), eq(lessonProgress.studentId, studentId)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function markLessonComplete(lessonId: number, studentId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getLessonProgress(lessonId, studentId);
  if (existing) {
    await db.update(lessonProgress)
      .set({ isCompleted: true, completedAt: new Date() })
      .where(eq(lessonProgress.id, existing.id));
  } else {
    await db.insert(lessonProgress).values({
      lessonId,
      studentId,
      isCompleted: true,
      completedAt: new Date(),
    });
  }
}

export async function getStudentProgress(studentId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(lessonProgress)
    .where(eq(lessonProgress.studentId, studentId));
}

// ============ إحصائيات ============

export async function getStudentStats(studentId: number) {
  const db = await getDb();
  if (!db) return null;

  const [completedLessons] = await db.select({ count: sql<number>`count(*)` })
    .from(lessonProgress)
    .where(and(eq(lessonProgress.studentId, studentId), eq(lessonProgress.isCompleted, true)));

  const [quizResults] = await db.select({ 
    count: sql<number>`count(*)`,
    avgScore: sql<number>`avg(${quizAttempts.score})`,
    totalPoints: sql<number>`sum(${quizAttempts.totalPoints})`
  })
    .from(quizAttempts)
    .where(eq(quizAttempts.studentId, studentId));

  const [submittedAssignments] = await db.select({ count: sql<number>`count(*)` })
    .from(submissions)
    .where(eq(submissions.studentId, studentId));

  return {
    completedLessons: completedLessons?.count || 0,
    quizzesTaken: quizResults?.count || 0,
    averageScore: quizResults?.avgScore || 0,
    assignmentsSubmitted: submittedAssignments?.count || 0,
  };
}
