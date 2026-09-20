import { pool } from '../config/db.js';
import { like } from '../utils/sql.js';

const PUBLIC_FIELDS = 'id, name, email, phone, role, is_active, created_at';

export async function findById(id) {
  const [rows] = await pool.query(`SELECT ${PUBLIC_FIELDS} FROM users WHERE id = ?`, [id]);
  return rows[0] || null;
}

// includes password_hash - only used for login
export async function findByEmail(email) {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0] || null;
}

export async function create({ name, email, passwordHash, phone, role }, conn = pool) {
  const [result] = await conn.query(
    'INSERT INTO users (name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?)',
    [name, email, passwordHash, phone, role]
  );
  return result.insertId;
}

export async function list({ role, q } = {}) {
  const where = [];
  const params = [];
  if (role) { where.push('u.role = ?'); params.push(role); }
  if (q) { where.push('(u.name LIKE ? OR u.email LIKE ?)'); params.push(like(q), like(q)); }
  const [rows] = await pool.query(
    `SELECT u.id, u.name, u.email, u.phone, u.role, u.is_active, u.created_at,
            (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) AS order_count
       FROM users u
       ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY u.created_at DESC, u.id DESC`,
    params
  );
  return rows;
}

export async function setActive(id, isActive) {
  await pool.query('UPDATE users SET is_active = ? WHERE id = ?', [isActive ? 1 : 0, id]);
}

export async function countAll() {
  const [[row]] = await pool.query('SELECT COUNT(*) AS total FROM users');
  return row.total;
}
