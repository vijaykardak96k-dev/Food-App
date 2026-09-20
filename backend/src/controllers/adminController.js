import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { positiveInt, toBool } from '../utils/validate.js';
import * as userModel from '../models/userModel.js';
import * as restaurantModel from '../models/restaurantModel.js';
import * as foodModel from '../models/foodModel.js';
import * as orderModel from '../models/orderModel.js';
import * as addressModel from '../models/addressModel.js';

const ROLES = ['customer', 'restaurant', 'admin'];
const RESTAURANT_STATUSES = ['Pending', 'Approved', 'Inactive'];
const ORDER_STATUSES = ['Pending', 'Accepted', 'Preparing', 'Ready', 'Completed', 'Rejected'];

export const dashboard = asyncHandler(async (req, res) => {
  const [users, restaurants, foods, byStatus, recent] = await Promise.all([
    userModel.countAll(),
    restaurantModel.countAll(),
    foodModel.countAll(),
    orderModel.countByStatus(),
    orderModel.listAll(),
  ]);
  const totalOrders = Object.values(byStatus).reduce((a, b) => a + b, 0);
  res.json({
    stats: {
      users,
      restaurants: restaurants.total,
      pending_restaurants: restaurants.pending,
      foods,
      orders: totalOrders,
    },
    orders_by_status: byStatus,
    recent_orders: recent.slice(0, 6),
  });
});

// ---------- Users ----------
export const listUsers = asyncHandler(async (req, res) => {
  const role = ROLES.includes(req.query.role) ? req.query.role : null;
  const q = String(req.query.q || '').trim().slice(0, 80);
  res.json({ users: await userModel.list({ role, q }) });
});

export const getUser = asyncHandler(async (req, res) => {
  const id = positiveInt(req.params.id, 'User');
  const user = await userModel.findById(id);
  if (!user) throw new AppError('User not found', 404);
  const [addresses, orderCount, restaurant] = await Promise.all([
    addressModel.listByUser(id),
    orderModel.countForUser(id),
    user.role === 'restaurant' ? restaurantModel.findByOwner(id) : null,
  ]);
  res.json({ user, addresses, order_count: orderCount, restaurant });
});

export const setUserStatus = asyncHandler(async (req, res) => {
  const id = positiveInt(req.params.id, 'User');
  const user = await userModel.findById(id);
  if (!user) throw new AppError('User not found', 404);
  if (user.role === 'admin') throw new AppError('Admin accounts cannot be deactivated', 400);
  await userModel.setActive(id, toBool(req.body.is_active));
  res.json({ user: await userModel.findById(id) });
});

// ---------- Restaurants ----------
export const listRestaurants = asyncHandler(async (req, res) => {
  const status = RESTAURANT_STATUSES.includes(req.query.status) ? req.query.status : null;
  const q = String(req.query.q || '').trim().slice(0, 80);
  res.json({ restaurants: await restaurantModel.listForAdmin({ status, q }) });
});

export const setRestaurantStatus = asyncHandler(async (req, res) => {
  const id = positiveInt(req.params.id, 'Restaurant');
  const status = req.body.status;
  if (!RESTAURANT_STATUSES.includes(status)) throw new AppError('Status must be Pending, Approved or Inactive', 400);
  if (!(await restaurantModel.findById(id))) throw new AppError('Restaurant not found', 404);
  await restaurantModel.setStatus(id, status);
  const [updated] = (await restaurantModel.listForAdmin()).filter((r) => r.id === id);
  res.json({ restaurant: updated });
});

// ---------- Orders (read only) ----------
export const listOrders = asyncHandler(async (req, res) => {
  const status = ORDER_STATUSES.includes(req.query.status) ? req.query.status : null;
  const q = String(req.query.q || '').trim().slice(0, 80);
  res.json({ orders: await orderModel.listAll({ status, q }) });
});

export const getOrder = asyncHandler(async (req, res) => {
  const id = positiveInt(req.params.id, 'Order');
  const order = await orderModel.findById(id);
  if (!order) throw new AppError('Order not found', 404);
  res.json({ order });
});
