// Customer orders.
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { positiveInt } from '../utils/validate.js';
import * as orderModel from '../models/orderModel.js';

const PAYMENT_METHODS = ['COD', 'MOCK_ONLINE'];

export const create = asyncHandler(async (req, res) => {
  const addressId = positiveInt(req.body.address_id, 'Delivery address');
  const paymentMethod = req.body.payment_method || 'COD';
  if (!PAYMENT_METHODS.includes(paymentMethod)) throw new AppError('Please choose a valid payment method', 400);

  const orderId = await orderModel.createFromCart({
    userId: req.user.id, userPhone: req.user.phone, addressId, paymentMethod,
  });
  res.status(201).json({ order: await orderModel.findForUser(orderId, req.user.id) });
});

export const list = asyncHandler(async (req, res) => {
  res.json({ orders: await orderModel.listForUser(req.user.id) });
});

export const getOne = asyncHandler(async (req, res) => {
  const id = positiveInt(req.params.id, 'Order');
  const order = await orderModel.findForUser(id, req.user.id);
  if (!order) throw new AppError('Order not found', 404);
  res.json({ order });
});
