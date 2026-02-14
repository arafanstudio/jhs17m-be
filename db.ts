import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

// Aiven MySQL usually requires SSL and provides a connection URI
const dbConfig = process.env.DATABASE_URL 
  ? process.env.DATABASE_URL 
  : {
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "3306"),
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_DATABASE || "school_db",
      ssl: process.env.DB_SSL === "true" ? {
        rejectUnauthorized: false // Often needed for Aiven if not providing CA cert
      } : undefined
    };

const pool = mysql.createPool(dbConfig);

export async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();
    await connection.query(
      `CREATE TABLE IF NOT EXISTS articles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        image_url VARCHAR(255),
        category ENUM('student', 'teacher') NOT NULL DEFAULT 'student',
        author VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    );
    connection.release();
    console.log("Database and 'articles' table initialized successfully.");
  } catch (error) {
    console.error("Error initializing database:", error);
    // Continue even if table already exists (in case of schema updates)
    console.log("Note: If the articles table already exists, you may need to manually add 'category' and 'author' columns.");
    console.log("Run these SQL commands if needed:");
    console.log("ALTER TABLE articles ADD COLUMN category ENUM('student', 'teacher') NOT NULL DEFAULT 'student';");
    console.log("ALTER TABLE articles ADD COLUMN author VARCHAR(255) NOT NULL DEFAULT 'Unknown';");
    // Exit the process if database initialization fails
    process.exit(1);
  }
}

export default pool;
