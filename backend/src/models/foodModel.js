import { pool } from '../config/db.js';
import { like, likeStart } from '../utils/sql.js';

const SELECT = `f.id, f.restaurant_id, f.category_id, f.name, f.description, f.price, f.image,
                f.is_veg, f.is_available,
                r.name AS restaurant_name, r.location AS restaurant_location, c.name AS category_name`;
const FROM = `FROM foods f
              JOIN restaurants r ON r.id = f.restaurant_id
              JOIN categories c ON c.id = f.category_id`;

// Foods customers can order: available items from Approved restaurants.
export async function search({ q, categoryId, veg, sort, restaurantId, limit = 60 } = {}) {
  const where = ["r.status = 'Approved'", 'f.is_available = 1'];
  const params = [];
  if (q) { where.push('(f.name LIKE ? OR c.name LIKE ?)'); params.push(like(q), like(q)); }
  if (categoryId) { where.push('f.category_id = ?'); params.push(categoryId); }
  if (veg === 1 || veg === 0) { where.push('f.is_veg = ?'); params.push(veg); }
  if (restaurantId) { where.push('f.restaurant_id = ?'); params.push(restaurantId); }

  let orderBy;
  const orderParams = [];
  if (sort === 'price_asc') orderBy = 'f.price ASC, f.name';
  else if (sort === 'price_desc') orderBy = 'f.price DESC, f.name';
  else if (q) { orderBy = 'CASE WHEN f.name LIKE ? THEN 0 ELSE 1 END, f.name'; orderParams.push(likeStart(q)); }
  else orderBy = 'r.rating DESC, f.name';

  const [rows] = await pool.query(
    `SELECT ${SELECT} ${FROM} WHERE ${where.join(' AND ')} ORDER BY ${orderBy} LIMIT ?`,
    [...params, ...orderParams, limit]
  );
  return rows;
}

// Most ordered items first (rejected orders do not count).
export async function popular(limit = 8) {
  const [rows] = await pool.query(
    `SELECT ${SELECT}, COALESCE(s.sold, 0) AS sold
       ${FROM}
       LEFT JOIN (SELECT oi.food_id, SUM(oi.quantity) AS sold
                    FROM order_items oi JOIN orders o ON o.id = oi.order_id
                   WHERE o.status <> 'Rejected' GROUP BY oi.food_id) s ON s.food_id = f.id
      WHERE r.status = 'Approved' AND f.is_available = 1
      ORDER BY sold DESC, r.rating DESC, f.id
      LIMIT ?`,
    [limit]
  );
  return rows;
}

export async function findPublicById(id) {
  const [rows] = await pool.query(`SELECT ${SELECT} ${FROM} WHERE f.id = ? AND r.status = 'Approved'`, [id]);
  return rows[0] || null;
}

export async function findById(id) {
  const [rows] = await pool.query(
    `SELECT ${SELECT}, r.status AS restaurant_status ${FROM} WHERE f.id = ?`, [id]);
  return rows[0] || null;
}

// Restaurant menu page (customers): shows unavailable items too, marked as such.
export async function listForRestaurant(restaurantId) {
  const [rows] = await pool.query(
    `SELECT ${SELECT} ${FROM} WHERE f.restaurant_id = ? ORDER BY c.id, f.name`, [restaurantId]);
  return rows;
}

export async function findOwned(id, restaurantId) {
  const [rows] = await pool.query(`SELECT ${SELECT} ${FROM} WHERE f.id = ? AND f.restaurant_id = ?`, [id, restaurantId]);
  return rows[0] || null;
}

export async function create(data) {
  const [result] = await pool.query(
    `INSERT INTO foods (restaurant_id, category_id, name, description, price, image, is_veg, is_available)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [data.restaurantId, data.categoryId, data.name, data.description, data.price, data.image, data.isVeg ? 1 : 0, data.isAvailable ? 1 : 0]
  );
  return result.insertId;
}

export async function update(id, restaurantId, data) {
  await pool.query(
    `UPDATE foods SET category_id = ?, name = ?, description = ?, price = ?, image = ?, is_veg = ?, is_available = ?
      WHERE id = ? AND restaurant_id = ?`,
    [data.categoryId, data.name, data.description, data.price, data.image, data.isVeg ? 1 : 0, data.isAvailable ? 1 : 0, id, restaurantId]
  );
}

export async function setAvailability(id, restaurantId, isAvailable) {
  await pool.query('UPDATE foods SET is_available = ? WHERE id = ? AND restaurant_id = ?', [isAvailable ? 1 : 0, id, restaurantId]);
}

export async function remove(id, restaurantId) {
  await pool.query('DELETE FROM foods WHERE id = ? AND restaurant_id = ?', [id, restaurantId]);
}

export async function countForRestaurant(restaurantId) {
  const [[row]] = await pool.query('SELECT COUNT(*) AS total FROM foods WHERE restaurant_id = ?', [restaurantId]);
  return row.total;
}

export async function countAll() {
  const [[row]] = await pool.query('SELECT COUNT(*) AS total FROM foods');
  return row.total;
}
