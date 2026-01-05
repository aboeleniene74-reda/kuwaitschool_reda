import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL not found");
  process.exit(1);
}

const connection = await mysql.createConnection(DATABASE_URL);
const db = drizzle(connection);

try {
  // Create sessions table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      teacherId INT,
      subjectId INT,
      gradeId INT,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      sessionDate DATETIME NOT NULL,
      duration INT NOT NULL,
      meetingLink TEXT NOT NULL,
      maxStudents INT,
      price DECIMAL(10,2),
      isPublished BOOLEAN DEFAULT FALSE,
      uniqueSlug VARCHAR(255) NOT NULL UNIQUE,
      status ENUM('scheduled', 'ongoing', 'completed', 'cancelled') DEFAULT 'scheduled',
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (teacherId) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (subjectId) REFERENCES subjects(id) ON DELETE SET NULL,
      FOREIGN KEY (gradeId) REFERENCES grades(id) ON DELETE SET NULL
    )
  `);
  
  // Create session_bookings table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS session_bookings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      sessionId INT NOT NULL,
      userId INT,
      studentName VARCHAR(255),
      studentEmail VARCHAR(320),
      studentPhone VARCHAR(50),
      status ENUM('confirmed', 'cancelled') DEFAULT 'confirmed',
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sessionId) REFERENCES sessions(id) ON DELETE CASCADE,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
    )
  `);
  
  console.log("✅ Sessions tables created successfully");
} catch (error) {
  console.error("❌ Error creating tables:", error);
} finally {
  await connection.end();
}
