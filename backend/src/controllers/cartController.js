import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { positiveInt } from '../utils/validate.js';
import * as cartModel from '../models/cartModel.js';
import * as foodModel from '../models/foodModel.js';

const MAX_QTY = 20;

// Builds the cart object the frontend needs (items, subtotal, total, count).
async function buildCart(userId) {
  const cartId = await cartModel.getOrCreateCartId(userId);
  const rows = await cartModel.getItems(cartId);
  const items = rows.map((r) => ({
    id: r.id,
    food_id: r.food_id,
    name: r.name,
    price: Number(r.price),
    image: r.image,
    is_veg: r.is_veg,
    is_available: Boolean(r.is_available) && r.restaurant_status === 'Approved',
    quantity: r.quantity,
    line_total: Math.round(Number(r.price) * r.quantity * 100) / 100,
  }));
  const subtotal = Math.round(items.reduce((sum, i) => sum + i.line_total, 0) * 100) / 100;
  return {
    id: cartId,
    restaurant: rows.length ? { id: rows[0].restaurant_id, name: rows[0].restaurant_name } : null,
    items,
    subtotal,
    total: subtotal,
    count: items.reduce((n, i) => n + i.quantity, 0),
    has_unavailable: items.some((i) => !i.is_available),
  };
}

function readQuantity(value, fallback) {
  const q = value === undefined ? fallback : Number(value);
  if (!Number.isInteger(q) || q < 1 || q > MAX_QTY) throw new AppError(`Quantity must be between 1 and ${MAX_QTY}`, 400);
  return q;
}

export const getCart = asyncHandler(async (req, res) => {
  res.json({ cart: await buildCart(req.user.id) });
});

export const addItem = asyncHandler(async (req, res) => {
  const foodId = positiveInt(req.body.food_id, 'Food');
  const quantity = readQuantity(req.body.quantity, 1);

  const food = await foodModel.findById(foodId);
  if (!food || food.restaurant_status !== 'Approved') throw new AppError('This food item is not available', 404);
  if (!food.is_available) throw new AppError(`${food.name} is currently unavailable`, 400);

  const cartId = await cartModel.getOrCreateCartId(req.user.id);
  const existing = await cartModel.getItems(cartId);

  // A cart can only hold food from one restaurant.
  if (existing.length > 0 && existing[0].restaurant_id !== food.restaurant_id) {
    if (!req.body.replace) {
      throw new AppError(`Your cart already has items from ${existing[0].restaurant_name}.`, 409, 'DIFFERENT_RESTAURANT');
    }
    await cartModel.clear(cartId);
  }

  await cartModel.addItem(cartId, foodId, quantity);
  res.status(201).json({ cart: await buildCart(req.user.id) });
});

export const updateItem = asyncHandler(async (req, res) => {
  const itemId = positiveInt(req.params.id, 'Cart item');
  const quantity = readQuantity(req.body.quantity);
  const cartId = await cartModel.getOrCreateCartId(req.user.id);
  const updated = await cartModel.setQuantity(itemId, cartId, quantity);
  if (!updated) throw new AppError('Cart item not found', 404);
  res.json({ cart: await buildCart(req.user.id) });
});

export const removeItem = asyncHandler(async (req, res) => {
  const itemId = positiveInt(req.params.id, 'Cart item');
  const cartId = await cartModel.getOrCreateCartId(req.user.id);
  const removed = await cartModel.removeItem(itemId, cartId);
  if (!removed) throw new AppError('Cart item not found', 404);
  res.json({ cart: await buildCart(req.user.id) });
});

export const clearCart = asyncHandler(async (req, res) => {
  const cartId = await cartModel.getOrCreateCartId(req.user.id);
  await cartModel.clear(cartId);
  res.json({ cart: await buildCart(req.user.id) });
});
