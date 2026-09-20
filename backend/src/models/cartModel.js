import { pool } from '../config/db.js';

export async function getOrCreateCartId(userId) {
  await pool.query('INSERT IGNORE INTO cart (user_id) VALUES (?)', [userId]);
  const [rows] = await pool.query('SELECT id FROM cart WHERE user_id = ?', [userId]);
  return rows[0].id;
}

export async function getItems(cartId) {
  const [rows] = await pool.query(
    `SELECT ci.id, ci.quantity, f.id AS food_id, f.name, f.price, f.image, f.is_veg, f.is_available,
            f.restaurant_id, r.name AS restaurant_name, r.status AS restaurant_status
       FROM cart_items ci
       JOIN foods f ON f.id = ci.food_id
       JOIN restaurants r ON r.id = f.restaurant_id
      WHERE ci.cart_id = ?
      ORDER BY ci.id`,
    [cartId]
  );
  return rows;
}

export async function addItem(cartId, foodId, quantity) {
  await pool.query(
    `INSERT INTO cart_items (cart_id, food_id, quantity) VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE quantity = LEAST(quantity + VALUES(quantity), 20)`,
    [cartId, foodId, quantity]
  );
}

export async function setQuantity(itemId, cartId, quantity) {
  const [result] = await pool.query('UPDATE cart_items SET quantity = ? WHERE id = ? AND cart_id = ?', [quantity, itemId, cartId]);
  return result.affectedRows > 0;
}

export async function removeItem(itemId, cartId) {
  const [result] = await pool.query('DELETE FROM cart_items WHERE id = ? AND cart_id = ?', [itemId, cartId]);
  return result.affectedRows > 0;
}

export async function clear(cartId) {
  await pool.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);
}
