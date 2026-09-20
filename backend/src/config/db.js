// One shared MySQL connection pool used by every model.
import mysql from 'mysql2/promise';
import { env } from './env.js';

export const pool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  decimalNumbers: true, // return DECIMAL columns as JS numbers
});

export async function checkDatabase() {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch (err) {
    console.error('\nCould not connect to MySQL:', err.code || err.message);
    console.error('Is the Docker container running?  ->  docker compose up -d');
    console.error('Do the DB_* values in backend/.env match docker-compose.yml?\n');
    return false;
  }
}
