import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'sqlPassword123!',
  database: process.env.DB_NAME || 'trivia_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Run database schema updates to ensure duration_seconds exists
async function runAutoMigrations() {
  try {
    const [columns] = await pool.query(
      `SHOW COLUMNS FROM quiz_results LIKE 'duration_seconds'`
    );
    if (columns.length === 0) {
      console.log('Adding duration_seconds column to quiz_results table...');
      await pool.query(
        `ALTER TABLE quiz_results ADD COLUMN duration_seconds INT DEFAULT NULL`
      );
      console.log('duration_seconds column added successfully.');
    }
  } catch (err) {
    // Table might not exist yet if seed/migration script hasn't run. That is fine.
    console.log('Auto-migration notice: quiz_results table may not exist yet or connection is pending.');
  }
}
runAutoMigrations();

export default {
  query: async (sql, params) => {
    const [results] = await pool.query(sql, params);
    return results;
  },
  pool
};
