import { pool } from '../config/db.js';

// food_count = items customers can currently order; total_foods = every item in the category
const SELECT = `
  SELECT c.id, c.name, c.emoji, c.image,
         (SELECT COUNT(*) FROM foods f JOIN restaurants r ON r.id = f.restaurant_id
           WHERE f.category_id = c.id AND f.is_available = 1 AND r.status = 'Approved') AS food_count,
         (SELECT COUNT(*) FROM foods f WHERE f.category_id = c.id) AS total_foods
    FROM categories c`;

export async function list() {
  const [rows] = await pool.query(`${SELECT} ORDER BY c.id`);
  return rows;
}

export async function findById(id) {
  const [rows] = await pool.query(`${SELECT} WHERE c.id = ?`, [id]);
  return rows[0] || null;
}

export async function findByName(name) {
  const [rows] = await pool.query('SELECT id FROM categories WHERE name = ?', [name]);
  return rows[0] || null;
}

export async function create({ name, emoji, image }) {
  const [result] = await pool.query('INSERT INTO categories (name, emoji, image) VALUES (?, ?, ?)', [name, emoji || null, image || null]);
  return result.insertId;
}

export async function update(id, { name, emoji }) {
  await pool.query('UPDATE categories SET name = ?, emoji = ? WHERE id = ?', [name, emoji || null, id]);
}

export async function remove(id) {
  await pool.query('DELETE FROM categories WHERE id = ?', [id]);
}

export async function countAll() {
  const [[row]] = await pool.query('SELECT COUNT(*) AS total FROM categories');
  return row.total;
}
