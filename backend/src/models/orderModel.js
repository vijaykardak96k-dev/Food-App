import { pool } from '../config/db.js';
import { AppError } from '../utils/AppError.js';
import { like } from '../utils/sql.js';

const SELECT = `o.id, o.user_id, o.restaurant_id, o.delivery_address, o.delivery_phone,
                o.payment_method, o.payment_status, o.subtotal, o.total_amount, o.status,
                o.created_at, o.updated_at,
                r.name AS restaurant_name, r.image AS restaurant_image, r.location AS restaurant_location,
                u.name AS customer_name, u.phone AS customer_phone, u.email AS customer_email`;
const FROM = `FROM orders o
              JOIN restaurants r ON r.id = o.restaurant_id
              JOIN users u ON u.id = o.user_id`;

// Adds an `items` array (and item_count) to each order with one extra query.
async function attachItems(orders) {
  if (orders.length === 0) return orders;
  const [items] = await pool.query(
    `SELECT id, order_id, food_id, food_name, unit_price, quantity, unit_price * quantity AS line_total
       FROM order_items WHERE order_id IN (?) ORDER BY id`,
    [orders.map((o) => o.id)]
  );
  const byOrder = new Map();
  for (const item of items) {
    if (!byOrder.has(item.order_id)) byOrder.set(item.order_id, []);
    byOrder.get(item.order_id).push(item);
  }
  return orders.map((o) => {
    const list = byOrder.get(o.id) || [];
    return { ...o, items: list, item_count: list.reduce((n, i) => n + i.quantity, 0) };
  });
}

async function one(sql, params) {
  const [rows] = await pool.query(sql, params);
  if (rows.length === 0) return null;
  return (await attachItems(rows))[0];
}

// ---- Creating an order from the customer's cart (all steps succeed or none do) ----
export async function createFromCart({ userId, userPhone, addressId, paymentMethod }) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [carts] = await conn.query('SELECT id FROM cart WHERE user_id = ? FOR UPDATE', [userId]);
    if (carts.length === 0) throw new AppError('Your cart is empty', 400, 'EMPTY_CART');
    const cartId = carts[0].id;

    const [items] = await conn.query(
      `SELECT ci.food_id, ci.quantity, f.name, f.price, f.is_available, f.restaurant_id,
              r.name AS restaurant_name, r.status AS restaurant_status
         FROM cart_items ci
         JOIN foods f ON f.id = ci.food_id
         JOIN restaurants r ON r.id = f.restaurant_id
        WHERE ci.cart_id = ?`,
      [cartId]
    );
    if (items.length === 0) throw new AppError('Your cart is empty', 400, 'EMPTY_CART');

    const restaurantId = items[0].restaurant_id;
    if (items.some((i) => i.restaurant_id !== restaurantId)) {
      throw new AppError('Your cart has items from more than one restaurant', 400);
    }
    if (items[0].restaurant_status !== 'Approved') {
      throw new AppError(`${items[0].restaurant_name} is not accepting orders right now`, 400, 'RESTAURANT_UNAVAILABLE');
    }
    const unavailable = items.filter((i) => !i.is_available);
    if (unavailable.length > 0) {
      throw new AppError(`${unavailable.map((i) => i.name).join(', ')} is no longer available. Remove it from your cart to continue.`, 400, 'ITEM_UNAVAILABLE');
    }

    const [addresses] = await conn.query('SELECT * FROM addresses WHERE id = ? AND user_id = ?', [addressId, userId]);
    if (addresses.length === 0) throw new AppError('Please choose a valid delivery address', 400);
    const address = addresses[0];

    // The price is copied from the food row at this moment.
    const subtotal = Math.round(items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0) * 100) / 100;
    const deliveryAddress = `${address.full_address}, ${address.city} - ${address.pincode}`;

    const [orderResult] = await conn.query(
      `INSERT INTO orders (user_id, restaurant_id, address_id, delivery_address, delivery_phone,
                           payment_method, payment_status, subtotal, total_amount, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')`,
      [userId, restaurantId, address.id, deliveryAddress, address.phone || userPhone,
        paymentMethod, paymentMethod === 'MOCK_ONLINE' ? 'Paid' : 'Pending', subtotal, subtotal]
    );
    const orderId = orderResult.insertId;

    await conn.query(
      'INSERT INTO order_items (order_id, food_id, food_name, unit_price, quantity) VALUES ?',
      [items.map((i) => [orderId, i.food_id, i.name, i.price, i.quantity])]
    );
    await conn.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);

    await conn.commit();
    return orderId;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

// ---- Customer ----
export async function listForUser(userId) {
  const [rows] = await pool.query(`SELECT ${SELECT} ${FROM} WHERE o.user_id = ? ORDER BY o.created_at DESC, o.id DESC`, [userId]);
  return attachItems(rows);
}

export function findForUser(id, userId) {
  return one(`SELECT ${SELECT} ${FROM} WHERE o.id = ? AND o.user_id = ?`, [id, userId]);
}

// ---- Restaurant ----
export async function listForRestaurant(restaurantId, status) {
  const params = [restaurantId];
  let extra = '';
  if (status) { extra = 'AND o.status = ?'; params.push(status); }
  const [rows] = await pool.query(
    `SELECT ${SELECT} ${FROM} WHERE o.restaurant_id = ? ${extra} ORDER BY o.created_at DESC, o.id DESC`, params);
  return attachItems(rows);
}

export function findForRestaurant(id, restaurantId) {
  return one(`SELECT ${SELECT} ${FROM} WHERE o.id = ? AND o.restaurant_id = ?`, [id, restaurantId]);
}

export async function updateStatus(id, status) {
  // Cash on delivery is treated as paid once the order is completed.
  await pool.query(
    `UPDATE orders
        SET status = ?,
            payment_status = IF(? = 'Completed' AND payment_method = 'COD', 'Paid', payment_status)
      WHERE id = ?`,
    [status, status, id]
  );
}

export async function statsForRestaurant(restaurantId) {
  const [[row]] = await pool.query(
    `SELECT COUNT(*) AS total_orders,
            COALESCE(SUM(status = 'Pending'), 0) AS pending_orders,
            COALESCE(SUM(status = 'Completed'), 0) AS completed_orders
       FROM orders WHERE restaurant_id = ?`,
    [restaurantId]
  );
  return row;
}

export async function countByStatusForRestaurant(restaurantId) {
  const [rows] = await pool.query('SELECT status, COUNT(*) AS count FROM orders WHERE restaurant_id = ? GROUP BY status', [restaurantId]);
  return Object.fromEntries(rows.map((r) => [r.status, r.count]));
}

// ---- Admin ----
export async function listAll({ status, q } = {}) {
  const where = [];
  const params = [];
  if (status) { where.push('o.status = ?'); params.push(status); }
  if (q) {
    where.push('(r.name LIKE ? OR u.name LIKE ? OR o.id = ?)');
    params.push(like(q), like(q), Number(q) || 0);
  }
  const [rows] = await pool.query(
    `SELECT ${SELECT} ${FROM} ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY o.created_at DESC, o.id DESC LIMIT 300`, params);
  return attachItems(rows);
}

export function findById(id) {
  return one(`SELECT ${SELECT} ${FROM} WHERE o.id = ?`, [id]);
}

export async function countByStatus() {
  const [rows] = await pool.query('SELECT status, COUNT(*) AS count FROM orders GROUP BY status');
  return Object.fromEntries(rows.map((r) => [r.status, r.count]));
}

export async function countForUser(userId) {
  const [[row]] = await pool.query('SELECT COUNT(*) AS total FROM orders WHERE user_id = ?', [userId]);
  return row.total;
}
