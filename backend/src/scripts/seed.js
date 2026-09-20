// Creates the tables (database/schema.sql) and, unless --schema-only is given,
// wipes them and loads the sample data (database/seed.sql).
//   npm run db:init  -> create tables only (keeps existing data)
//   npm run seed     -> reset everything and load sample data
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import { env } from '../config/env.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbFolder = path.resolve(__dirname, '../../../database');
const schemaOnly = process.argv.includes('--schema-only');
const TABLES = ['order_items', 'orders', 'cart_items', 'cart', 'addresses', 'foods', 'categories', 'restaurants', 'users'];

let conn;
try {
  conn = await mysql.createConnection({
    host: env.db.host, port: env.db.port, user: env.db.user, password: env.db.password, multipleStatements: true, charset: 'utf8mb4',
  });
} catch (err) {
  console.error('\nCould not connect to MySQL:', err.code || err.message);
  console.error('Start it with `docker compose up -d`, wait ~20 seconds, then try again.\n');
  process.exit(1);
}

try {
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${env.db.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await conn.query(`USE \`${env.db.database}\``);

  if (!schemaOnly) {
    await conn.query(`SET FOREIGN_KEY_CHECKS = 0; DROP TABLE IF EXISTS ${TABLES.join(', ')}; SET FOREIGN_KEY_CHECKS = 1;`);
  }
  await conn.query(await fs.readFile(path.join(dbFolder, 'schema.sql'), 'utf8'));
  console.log('Tables are ready.');

  if (!schemaOnly) {
    const hash = await bcrypt.hash(env.demoPassword, 10);
    const seedSql = (await fs.readFile(path.join(dbFolder, 'seed.sql'), 'utf8')).replaceAll('__DEMO_PASSWORD_HASH__', () => hash);
    await conn.query(seedSql);
    console.log('Sample data loaded. Demo accounts use the DEMO_PASSWORD from backend/.env.');
  }
} catch (err) {
  console.error('\nDatabase setup failed:', err.sqlMessage || err.message, '\n');
  process.exitCode = 1;
} finally {
  await conn.end();
}
