import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { text, positiveInt } from '../utils/validate.js';
import * as categoryModel from '../models/categoryModel.js';

// Public
export const list = asyncHandler(async (req, res) => {
  res.json({ categories: await categoryModel.list() });
});

// Admin
function readCategory(body) {
  return {
    name: text(body.name, 'Category name', { min: 2, max: 40 }),
    emoji: text(body.emoji, 'Emoji', { max: 8, required: false }),
  };
}

export const create = asyncHandler(async (req, res) => {
  const data = readCategory(req.body);
  if (await categoryModel.findByName(data.name)) throw new AppError('A category with this name already exists', 409);
  const id = await categoryModel.create({ ...data, image: '/images/placeholder.svg' });
  res.status(201).json({ category: await categoryModel.findById(id) });
});

export const update = asyncHandler(async (req, res) => {
  const id = positiveInt(req.params.id, 'Category');
  if (!(await categoryModel.findById(id))) throw new AppError('Category not found', 404);
  const data = readCategory(req.body);
  const same = await categoryModel.findByName(data.name);
  if (same && same.id !== id) throw new AppError('A category with this name already exists', 409);
  await categoryModel.update(id, data);
  res.json({ category: await categoryModel.findById(id) });
});

export const remove = asyncHandler(async (req, res) => {
  const id = positiveInt(req.params.id, 'Category');
  const category = await categoryModel.findById(id);
  if (!category) throw new AppError('Category not found', 404);
  if (category.total_foods > 0) {
    throw new AppError(`"${category.name}" is used by ${category.total_foods} food item(s). Move or delete those items first.`, 409);
  }
  await categoryModel.remove(id);
  res.json({ message: 'Category deleted' });
});
