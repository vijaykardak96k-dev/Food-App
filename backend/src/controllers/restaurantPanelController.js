// Everything a restaurant owner can do: dashboard, menu management, order management.
import fs from 'fs';
import path from 'path';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { text, positiveInt, price, toBool } from '../utils/validate.js';
import { uploadDir } from '../middleware/upload.js';
import * as restaurantModel from '../models/restaurantModel.js';
import * as foodModel from '../models/foodModel.js';
import * as categoryModel from '../models/categoryModel.js';
import * as orderModel from '../models/orderModel.js';

async function ownRestaurant(req) {
  const restaurant = await restaurantModel.findByOwner(req.user.id);
  if (!restaurant) throw new AppError('No restaurant is linked to this account', 404);
  return restaurant;
}

// Removes an uploaded image file (sample images in /images are never deleted).
function deleteUpload(imagePath) {
  if (!imagePath || !imagePath.startsWith('/uploads/')) return;
  fs.unlink(path.join(uploadDir, path.basename(imagePath)), () => {});
}

// ---------- Dashboard ----------
export const dashboard = asyncHandler(async (req, res) => {
  const restaurant = await ownRestaurant(req);
  const [orderStats, foodCount, byStatus] = await Promise.all([
    orderModel.statsForRestaurant(restaurant.id),
    foodModel.countForRestaurant(restaurant.id),
    orderModel.countByStatusForRestaurant(restaurant.id),
  ]);
  res.json({
    restaurant,
    stats: {
      total_orders: orderStats.total_orders,
      pending_orders: orderStats.pending_orders,
      completed_orders: orderStats.completed_orders,
      food_items: foodCount,
    },
    orders_by_status: byStatus,
  });
});

// ---------- Menu ----------
async function readFood(req, restaurant, existing) {
  const name = text(req.body.name, 'Food name', { min: 2, max: 120 });
  const description = text(req.body.description, 'Description', { max: 500, required: false });
  const categoryId = positiveInt(req.body.category_id, 'Category');
  const category = await categoryModel.findById(categoryId);
  if (!category) throw new AppError('Please choose a valid category', 400);

  let image = existing ? existing.image : category.image || '/images/placeholder.svg';
  if (req.file) image = `/uploads/${req.file.filename}`;

  return {
    restaurantId: restaurant.id,
    categoryId,
    name,
    description,
    price: price(req.body.price),
    image,
    isVeg: toBool(req.body.is_veg),
    isAvailable: req.body.is_available === undefined ? true : toBool(req.body.is_available),
  };
}

export const listFoods = asyncHandler(async (req, res) => {
  const restaurant = await ownRestaurant(req);
  res.json({ foods: await foodModel.listForRestaurant(restaurant.id) });
});

export const createFood = asyncHandler(async (req, res) => {
  const restaurant = await ownRestaurant(req);
  try {
    const data = await readFood(req, restaurant, null);
    const id = await foodModel.create(data);
    res.status(201).json({ food: await foodModel.findOwned(id, restaurant.id) });
  } catch (err) {
    if (req.file) deleteUpload(`/uploads/${req.file.filename}`);
    throw err;
  }
});

export const updateFood = asyncHandler(async (req, res) => {
  const restaurant = await ownRestaurant(req);
  const id = positiveInt(req.params.id, 'Food');
  const existing = await foodModel.findOwned(id, restaurant.id);
  if (!existing) {
    if (req.file) deleteUpload(`/uploads/${req.file.filename}`);
    throw new AppError('Food item not found', 404);
  }
  try {
    const data = await readFood(req, restaurant, existing);
    await foodModel.update(id, restaurant.id, data);
    if (req.file) deleteUpload(existing.image);
    res.json({ food: await foodModel.findOwned(id, restaurant.id) });
  } catch (err) {
    if (req.file) deleteUpload(`/uploads/${req.file.filename}`);
    throw err;
  }
});

export const setFoodAvailability = asyncHandler(async (req, res) => {
  const restaurant = await ownRestaurant(req);
  const id = positiveInt(req.params.id, 'Food');
  if (!(await foodModel.findOwned(id, restaurant.id))) throw new AppError('Food item not found', 404);
  await foodModel.setAvailability(id, restaurant.id, toBool(req.body.is_available));
  res.json({ food: await foodModel.findOwned(id, restaurant.id) });
});

export const deleteFood = asyncHandler(async (req, res) => {
  const restaurant = await ownRestaurant(req);
  const id = positiveInt(req.params.id, 'Food');
  const existing = await foodModel.findOwned(id, restaurant.id);
  if (!existing) throw new AppError('Food item not found', 404);
  await foodModel.remove(id, restaurant.id);
  deleteUpload(existing.image);
  res.json({ message: 'Food item deleted' });
});

// ---------- Orders ----------
const ORDER_STATUSES = ['Pending', 'Accepted', 'Preparing', 'Ready', 'Completed', 'Rejected'];

// Allowed next steps: Pending -> Accepted -> Preparing -> Ready -> Completed (or Pending -> Rejected)
const NEXT_STATUS = {
  Pending: ['Accepted', 'Rejected'],
  Accepted: ['Preparing'],
  Preparing: ['Ready'],
  Ready: ['Completed'],
  Completed: [],
  Rejected: [],
};

export const listOrders = asyncHandler(async (req, res) => {
  const restaurant = await ownRestaurant(req);
  const status = ORDER_STATUSES.includes(req.query.status) ? req.query.status : null;
  res.json({ orders: await orderModel.listForRestaurant(restaurant.id, status) });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const restaurant = await ownRestaurant(req);
  const id = positiveInt(req.params.id, 'Order');
  const next = req.body.status;
  if (!ORDER_STATUSES.includes(next)) throw new AppError('Invalid order status', 400);

  const order = await orderModel.findForRestaurant(id, restaurant.id);
  if (!order) throw new AppError('Order not found', 404);
  if (!NEXT_STATUS[order.status].includes(next)) {
    throw new AppError(`An order that is ${order.status} cannot be changed to ${next}`, 400);
  }
  await orderModel.updateStatus(id, next);
  res.json({ order: await orderModel.findForRestaurant(id, restaurant.id) });
});
