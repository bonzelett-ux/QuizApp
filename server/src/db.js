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

export default {
  query: async (sql, params) => {
    const [results] = await pool.query(sql, params);
    return results;
  },
  pool
};
