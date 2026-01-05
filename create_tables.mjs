import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

try {
  // Create statistics table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS statistics (
      id INT AUTO_INCREMENT PRIMARY KEY,
      notebookId INT NULL,
      type ENUM('visit', 'view', 'download') NOT NULL,
      userId INT NULL,
      ipAddress VARCHAR(45) NULL,
      userAgent TEXT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      FOREIGN KEY (notebookId) REFERENCES notebooks(id) ON DELETE CASCADE,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
    )
  `);
  console.log("✓ Created statistics table");

  // Create comments table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS comments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      notebookId INT NOT NULL,
      userId INT NULL,
      authorName VARCHAR(100) NULL,
      authorEmail VARCHAR(320) NULL,
      content TEXT NOT NULL,
      isApproved BOOLEAN DEFAULT FALSE NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
      FOREIGN KEY (notebookId) REFERENCES notebooks(id) ON DELETE CASCADE,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
    )
  `);
  console.log("✓ Created comments table");

  console.log("\n✅ All tables created successfully!");
} catch (error) {
  console.error("❌ Error:", error.message);
} finally {
  await connection.end();
}
