// Public food browsing and search for customers.
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { positiveInt } from '../utils/validate.js';
import * as foodModel from '../models/foodModel.js';
import * as restaurantModel from '../models/restaurantModel.js';

const SORTS = ['price_asc', 'price_desc'];

// Turns the query string (?q=&category=&veg=&sort=) into clean filter values.
function readFilters(query) {
  const q = String(query.q || '').trim().slice(0, 80);
  const categoryId = Number(query.category) > 0 ? Number(query.category) : null;
  const veg = query.veg === 'veg' ? 1 : query.veg === 'nonveg' ? 0 : null;
  const sort = SORTS.includes(query.sort) ? query.sort : null;
  const restaurantId = Number(query.restaurant) > 0 ? Number(query.restaurant) : null;
  return { q, categoryId, veg, sort, restaurantId };
}

export const list = asyncHandler(async (req, res) => {
  res.json({ foods: await foodModel.search(readFilters(req.query)) });
});

// GET /api/foods/search?q=biryani  ->  matching foods AND restaurants
export const searchAll = asyncHandler(async (req, res) => {
  const filters = readFilters(req.query);
  const [foods, restaurants] = await Promise.all([
    foodModel.search(filters),
    restaurantModel.listApproved({ q: filters.q, categoryId: filters.categoryId }),
  ]);
  res.json({ query: filters.q, foods, restaurants });
});

export const popular = asyncHandler(async (req, res) => {
  res.json({ foods: await foodModel.popular(8) });
});

export const getOne = asyncHandler(async (req, res) => {
  const id = positiveInt(req.params.id, 'Food');
  const food = await foodModel.findPublicById(id);
  if (!food) throw new AppError('This food item could not be found', 404);
  res.json({ food });
});
