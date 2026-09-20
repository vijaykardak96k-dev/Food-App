import { pool } from '../config/db.js';
import * as userModel from './userModel.js';
import { like } from '../utils/sql.js';

const FIELDS = `r.id, r.owner_id, r.name, r.description, r.cuisine, r.location, r.image,
                r.rating, r.price_level, r.status, r.created_at`;
const CATEGORIES = `(SELECT GROUP_CONCAT(DISTINCT c.name ORDER BY c.name SEPARATOR ', ')
                       FROM foods f JOIN categories c ON c.id = f.category_id
                      WHERE f.restaurant_id = r.id) AS categories`;

// Customers only ever see Approved restaurants.
export async function listApproved({ q, categoryId } = {}) {
  const where = ["r.status = 'Approved'"];
  const params = [];
  if (q) { where.push('(r.name LIKE ? OR r.cuisine LIKE ?)'); params.push(like(q), like(q)); }
  if (categoryId) {
    where.push('EXISTS (SELECT 1 FROM foods f WHERE f.restaurant_id = r.id AND f.category_id = ? AND f.is_available = 1)');
    params.push(categoryId);
  }
  const [rows] = await pool.query(
    `SELECT ${FIELDS}, ${CATEGORIES},
            (SELECT COUNT(*) FROM foods f WHERE f.restaurant_id = r.id AND f.is_available = 1) AS food_count
       FROM restaurants r
      WHERE ${where.join(' AND ')}
      ORDER BY r.rating DESC, r.name`,
    params
  );
  return rows;
}

export async function findApprovedById(id) {
  const [rows] = await pool.query(`SELECT ${FIELDS}, ${CATEGORIES} FROM restaurants r WHERE r.id = ? AND r.status = 'Approved'`, [id]);
  return rows[0] || null;
}

export async function findById(id) {
  const [rows] = await pool.query(`SELECT ${FIELDS}, ${CATEGORIES} FROM restaurants r WHERE r.id = ?`, [id]);
  return rows[0] || null;
}

export async function findByOwner(ownerId) {
  const [rows] = await pool.query(`SELECT ${FIELDS} FROM restaurants r WHERE r.owner_id = ?`, [ownerId]);
  return rows[0] || null;
}

// Creates the owner account and the restaurant together (both or neither).
export async function registerWithOwner({ owner, restaurant }) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const ownerId = await userModel.create({ ...owner, role: 'restaurant' }, conn);
    const [result] = await conn.query(
      `INSERT INTO restaurants (owner_id, name, description, cuisine, location, image, status)
       VALUES (?, ?, ?, ?, ?, ?, 'Pending')`,
      [ownerId, restaurant.name, restaurant.description, restaurant.cuisine, restaurant.location, '/images/placeholder.svg']
    );
    await conn.commit();
    return { ownerId, restaurantId: result.insertId };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function listForAdmin({ status, q } = {}) {
  const where = [];
  const params = [];
  if (status) { where.push('r.status = ?'); params.push(status); }
  if (q) { where.push('(r.name LIKE ? OR r.location LIKE ?)'); params.push(like(q), like(q)); }
  const [rows] = await pool.query(
    `SELECT ${FIELDS}, u.name AS owner_name, u.email AS owner_email, u.phone AS owner_phone,
            (SELECT COUNT(*) FROM foods f WHERE f.restaurant_id = r.id) AS food_count,
            (SELECT COUNT(*) FROM orders o WHERE o.restaurant_id = r.id) AS order_count
       FROM restaurants r JOIN users u ON u.id = r.owner_id
       ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY FIELD(r.status, 'Pending', 'Approved', 'Inactive'), r.name`,
    params
  );
  return rows;
}

export async function setStatus(id, status) {
  await pool.query('UPDATE restaurants SET status = ? WHERE id = ?', [status, id]);
}

export async function countAll() {
  const [[row]] = await pool.query('SELECT COUNT(*) AS total, COALESCE(SUM(status = \'Pending\'), 0) AS pending FROM restaurants');
  return row;
}
