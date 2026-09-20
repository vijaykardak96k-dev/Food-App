import { pool } from '../config/db.js';

export async function listByUser(userId) {
  const [rows] = await pool.query(
    'SELECT id, full_address, city, pincode, phone, created_at FROM addresses WHERE user_id = ? ORDER BY id DESC', [userId]);
  return rows;
}

export async function findOwned(id, userId) {
  const [rows] = await pool.query(
    'SELECT id, full_address, city, pincode, phone, created_at FROM addresses WHERE id = ? AND user_id = ?', [id, userId]);
  return rows[0] || null;
}

export async function create({ userId, fullAddress, city, pincode, phone }) {
  const [result] = await pool.query(
    'INSERT INTO addresses (user_id, full_address, city, pincode, phone) VALUES (?, ?, ?, ?, ?)',
    [userId, fullAddress, city, pincode, phone || null]
  );
  return result.insertId;
}

export async function remove(id, userId) {
  const [result] = await pool.query('DELETE FROM addresses WHERE id = ? AND user_id = ?', [id, userId]);
  return result.affectedRows > 0;
}
