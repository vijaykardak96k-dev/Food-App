// Public restaurant browsing for customers.
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { positiveInt } from '../utils/validate.js';
import * as restaurantModel from '../models/restaurantModel.js';
import * as foodModel from '../models/foodModel.js';

export const list = asyncHandler(async (req, res) => {
  const q = String(req.query.q || '').trim().slice(0, 80);
  res.json({ restaurants: await restaurantModel.listApproved({ q }) });
});

export const getOne = asyncHandler(async (req, res) => {
  const id = positiveInt(req.params.id, 'Restaurant');
  const restaurant = await restaurantModel.findApprovedById(id);
  if (!restaurant) throw new AppError('This restaurant is not available right now', 404);
  const foods = await foodModel.listForRestaurant(id);
  res.json({ restaurant, foods });
});
