import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  grades, 
  subjects, 
  notebooks, 
  purchases, 
  reviews,
  statistics,
  comments,
  sessions,
  sessionBookings,
  siteRatings,
  sessionRatings,
  liveComments,
  InsertGrade,
  InsertSubject,
  InsertNotebook,
  InsertPurchase,
  InsertReview,
  InsertStatistic,
  InsertComment,
  InsertSession,
  InsertSessionBooking,
  InsertSiteRating,
  InsertSessionRating,
  InsertLiveComment
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

// ============= User Functions =============

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

// ============= Grade Functions =============

export async function getAllGrades() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(grades).orderBy(grades.order);
}

export async function getGradeById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(grades).where(eq(grades.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createGrade(grade: InsertGrade) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(grades).values(grade);
}

// ============= Subject Functions =============

export async function getSubjectsByGrade(gradeId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(subjects).where(eq(subjects.gradeId, gradeId));
}

export async function getSubjectById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(subjects).where(eq(subjects.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createSubject(subject: InsertSubject) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(subjects).values(subject);
}

// ============= Notebook Functions =============

export async function getNotebooksBySubject(subjectId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(notebooks)
    .where(and(
      eq(notebooks.subjectId, subjectId),
      eq(notebooks.isPublished, true)
    ))
    .orderBy(desc(notebooks.isFeatured), desc(notebooks.createdAt));
}

export async function getNotebookById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(notebooks).where(eq(notebooks.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createNotebook(notebook: InsertNotebook) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(notebooks).values(notebook);
}

export async function getAllNotebooks() {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(notebooks)
    .orderBy(desc(notebooks.createdAt));
}

// ============= Purchase Functions =============

export async function createPurchase(purchase: InsertPurchase) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(purchases).values(purchase);
}

export async function getUserPurchases(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(purchases)
    .where(eq(purchases.userId, userId))
    .orderBy(desc(purchases.purchasedAt));
}

export async function checkUserPurchased(userId: number, notebookId: number) {
  const db = await getDb();
  if (!db) return false;
  
  const result = await db
    .select()
    .from(purchases)
    .where(and(
      eq(purchases.userId, userId),
      eq(purchases.notebookId, notebookId),
      eq(purchases.status, "completed")
    ))
    .limit(1);
    
  return result.length > 0;
}

// ============= Review Functions =============

export async function createReview(review: InsertReview) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(reviews).values(review);
}

export async function getNotebookReviews(notebookId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(reviews)
    .where(eq(reviews.notebookId, notebookId))
    .orderBy(desc(reviews.createdAt));
}

// ============= Statistics Functions =============

export async function trackStatistic(stat: InsertStatistic) {
  const db = await getDb();
  if (!db) return;
  
  try {
    await db.insert(statistics).values(stat);
  } catch (error) {
    console.error("[Database] Failed to track statistic:", error);
  }
}

export async function getNotebookStats(notebookId: number) {
  const db = await getDb();
  if (!db) return { views: 0, downloads: 0 };
  
  try {
    const stats = await db
      .select()
      .from(statistics)
      .where(and(
        eq(statistics.notebookId, notebookId)
      ));
    
    const views = stats.filter(s => s.type === "view").length;
    const downloads = stats.filter(s => s.type === "download").length;
    
    return { views, downloads };
  } catch (error) {
    console.error("[Database] Failed to get notebook stats:", error);
    return { views: 0, downloads: 0 };
  }
}

export async function getTotalVisits() {
  const db = await getDb();
  if (!db) return 0;
  
  try {
    const visits = await db
      .select()
      .from(statistics)
      .where(eq(statistics.type, "visit"));
    
    return visits.length;
  } catch (error) {
    console.error("[Database] Failed to get total visits:", error);
    return 0;
  }
}

export async function getAllNotebooksStats() {
  const db = await getDb();
  if (!db) return [];
  
  try {
    const allNotebooks = await db.select().from(notebooks);
    const statsPromises = allNotebooks.map(async (notebook) => {
      const stats = await getNotebookStats(notebook.id);
      return {
        notebookId: notebook.id,
        title: notebook.title,
        ...stats
      };
    });
    
    return await Promise.all(statsPromises);
  } catch (error) {
    console.error("[Database] Failed to get all notebooks stats:", error);
    return [];
  }
}

// ============= Comments Functions =============

export async function createComment(comment: InsertComment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    await db.insert(comments).values(comment);
  } catch (error) {
    console.error("[Database] Failed to create comment:", error);
    throw error;
  }
}

export async function getNotebookComments(notebookId: number, includeUnapproved = false) {
  const db = await getDb();
  if (!db) return [];
  
  try {
    const conditions = [eq(comments.notebookId, notebookId)];
    if (!includeUnapproved) {
      conditions.push(eq(comments.isApproved, true));
    }
    
    return await db
      .select()
      .from(comments)
      .where(and(...conditions))
      .orderBy(desc(comments.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get comments:", error);
    return [];
  }
}

export async function approveComment(commentId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    await db
      .update(comments)
      .set({ isApproved: true })
      .where(eq(comments.id, commentId));
  } catch (error) {
    console.error("[Database] Failed to approve comment:", error);
    throw error;
  }
}

export async function deleteComment(commentId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    await db.delete(comments).where(eq(comments.id, commentId));
  } catch (error) {
    console.error("[Database] Failed to delete comment:", error);
    throw error;
  }
}

export async function getAllPendingComments() {
  const db = await getDb();
  if (!db) return [];
  
  try {
    return await db
      .select()
      .from(comments)
      .where(eq(comments.isApproved, false))
      .orderBy(desc(comments.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get pending comments:", error);
    return [];
  }
}


// ============= Session Functions =============

export async function createSession(session: InsertSession) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(sessions).values(session);
}

export async function getAllSessions() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(sessions).orderBy(desc(sessions.sessionDate));
}

export async function getSessionBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(sessions).where(eq(sessions.uniqueSlug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getSessionById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(sessions).where(eq(sessions.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateSession(id: number, data: Partial<InsertSession>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(sessions).set(data).where(eq(sessions.id, id));
}

export async function deleteSession(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(sessions).where(eq(sessions.id, id));
}

export async function getUpcomingSessions() {
  const db = await getDb();
  if (!db) return [];
  
  const now = new Date();
  return await db.select().from(sessions)
    .where(and(
      eq(sessions.isPublished, true),
      eq(sessions.status, "scheduled")
    ))
    .orderBy(sessions.sessionDate);
}

// ============= Session Booking Functions =============

export async function createBooking(booking: InsertSessionBooking) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(sessionBookings).values(booking);
}

export async function getBookingsBySession(sessionId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(sessionBookings)
    .where(eq(sessionBookings.sessionId, sessionId))
    .orderBy(desc(sessionBookings.bookedAt));
}

export async function getBookingsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(sessionBookings)
    .where(eq(sessionBookings.userId, userId))
    .orderBy(desc(sessionBookings.bookedAt));
}

export async function getBookingCount(sessionId: number) {
  const db = await getDb();
  if (!db) return 0;
  
  const result = await db.select().from(sessionBookings)
    .where(and(
      eq(sessionBookings.sessionId, sessionId),
      eq(sessionBookings.status, "confirmed")
    ));
  
  return result.length;
}

export async function cancelBooking(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(sessionBookings)
    .set({ status: "cancelled" })
    .where(eq(sessionBookings.id, id));
}


// ==================== Site Ratings ====================

export async function createSiteRating(rating: InsertSiteRating) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(siteRatings).values(rating);
  return result;
}

export async function getAllSiteRatings() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(siteRatings).orderBy(desc(siteRatings.createdAt));
}

export async function getAverageSiteRating() {
  const db = await getDb();
  if (!db) return { average: 0, count: 0 };
  
  const ratings = await db.select().from(siteRatings);
  if (ratings.length === 0) return { average: 0, count: 0 };
  
  const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
  return {
    average: sum / ratings.length,
    count: ratings.length
  };
}

// ==================== Session Ratings ====================

export async function createSessionRating(rating: InsertSessionRating) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(sessionRatings).values(rating);
  return result;
}

export async function getSessionRatings(sessionId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(sessionRatings)
    .where(eq(sessionRatings.sessionId, sessionId))
    .orderBy(desc(sessionRatings.createdAt));
}

export async function getAverageSessionRating(sessionId: number) {
  const db = await getDb();
  if (!db) return { average: 0, count: 0 };
  
  const ratings = await db
    .select()
    .from(sessionRatings)
    .where(eq(sessionRatings.sessionId, sessionId));
    
  if (ratings.length === 0) return { average: 0, count: 0 };
  
  const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
  return {
    average: sum / ratings.length,
    count: ratings.length
  };
}

// ==================== Live Comments ====================

export async function createLiveComment(comment: InsertLiveComment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(liveComments).values(comment);
  return result;
}

export async function getSessionLiveComments(sessionId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(liveComments)
    .where(eq(liveComments.sessionId, sessionId))
    .orderBy(liveComments.createdAt);
}

export async function markCommentAsRead(commentId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(liveComments)
    .set({ isRead: "yes" })
    .where(eq(liveComments.id, commentId));
}

export async function getUnreadCommentsCount(sessionId: number) {
  const db = await getDb();
  if (!db) return 0;
  
  const comments = await db
    .select()
    .from(liveComments)
    .where(and(
      eq(liveComments.sessionId, sessionId),
      eq(liveComments.isRead, "no")
    ));
    
  return comments.length;
}
