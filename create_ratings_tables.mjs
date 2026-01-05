import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

try {
  // Create site_ratings table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS site_ratings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT DEFAULT NULL,
      rating INT NOT NULL,
      comment TEXT,
      visitorName VARCHAR(255),
      visitorEmail VARCHAR(320),
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
    )
  `);
  
  // Create session_ratings table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS session_ratings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      sessionId INT NOT NULL,
      userId INT DEFAULT NULL,
      rating INT NOT NULL,
      review TEXT,
      studentName VARCHAR(255),
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      FOREIGN KEY (sessionId) REFERENCES sessions(id) ON DELETE CASCADE,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
    )
  `);
  
  // Create live_comments table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS live_comments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      sessionId INT NOT NULL,
      userId INT DEFAULT NULL,
      comment TEXT NOT NULL,
      studentName VARCHAR(255),
      isRead ENUM('yes', 'no') DEFAULT 'no' NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      FOREIGN KEY (sessionId) REFERENCES sessions(id) ON DELETE CASCADE,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
    )
  `);
  
  console.log("✅ جداول التقييمات والتعليقات تم إنشاؤها بنجاح");
} catch (error) {
  console.error("❌ خطأ:", error);
} finally {
  await connection.end();
}
