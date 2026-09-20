import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { text, isEmail, isPhone, cleanPhone } from '../utils/validate.js';
import * as userModel from '../models/userModel.js';
import * as restaurantModel from '../models/restaurantModel.js';

const signToken = (user) => jwt.sign({ id: user.id, role: user.role }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

// The user object sent to the browser (restaurant owners also get their restaurant summary).
async function toClientUser(userId) {
  const user = await userModel.findById(userId);
  if (user.role === 'restaurant') {
    const r = await restaurantModel.findByOwner(user.id);
    user.restaurant = r ? { id: r.id, name: r.name, status: r.status } : null;
  }
  return user;
}

function readAccountFields(body) {
  const name = text(body.name, 'Name', { min: 2, max: 100 });
  const email = text(body.email, 'Email', { max: 150 }).toLowerCase();
  if (!isEmail(email)) throw new AppError('Please enter a valid email address', 400);
  const password = typeof body.password === 'string' ? body.password : '';
  if (password.length < 6) throw new AppError('Password must be at least 6 characters', 400);
  if (password.length > 72) throw new AppError('Password must be at most 72 characters', 400);
  if (!isPhone(String(body.phone || ''))) throw new AppError('Phone number must be 10 digits', 400);
  return { name, email, password, phone: cleanPhone(body.phone) };
}

async function ensureEmailFree(email) {
  if (await userModel.findByEmail(email)) throw new AppError('An account with this email already exists', 409);
}

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = readAccountFields(req.body);
  await ensureEmailFree(email);
  const passwordHash = await bcrypt.hash(password, 10);
  const id = await userModel.create({ name, email, passwordHash, phone, role: 'customer' });
  const user = await toClientUser(id);
  res.status(201).json({ token: signToken(user), user });
});

export const registerRestaurant = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = readAccountFields(req.body);
  const restaurant = {
    name: text(req.body.restaurantName, 'Restaurant name', { min: 2, max: 120 }),
    cuisine: text(req.body.cuisine, 'Cuisine', { max: 120 }),
    location: text(req.body.location, 'Location', { max: 160 }),
    description: text(req.body.description, 'Description', { max: 500, required: false }),
  };
  await ensureEmailFree(email);
  const passwordHash = await bcrypt.hash(password, 10);
  const { ownerId } = await restaurantModel.registerWithOwner({ owner: { name, email, passwordHash, phone }, restaurant });
  const user = await toClientUser(ownerId);
  res.status(201).json({ token: signToken(user), user });
});

export const login = asyncHandler(async (req, res) => {
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  if (!email || !password) throw new AppError('Please enter your email and password', 400);

  const found = await userModel.findByEmail(email);
  const ok = found ? await bcrypt.compare(password, found.password_hash) : false;
  if (!ok) throw new AppError('Invalid email or password', 401);
  if (!found.is_active) throw new AppError('Your account has been deactivated. Please contact support.', 403);

  const user = await toClientUser(found.id);
  res.json({ token: signToken(user), user });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: await toClientUser(req.user.id) });
});
