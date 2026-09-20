// authenticate: checks the JWT and loads the user. authorize: checks the user's role.
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as userModel from '../models/userModel.js';

export const authenticate = asyncHandler(async (req, res, next) => {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) throw new AppError('Please log in to continue', 401);

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch {
    throw new AppError('Your session has expired. Please log in again.', 401);
  }

  // Load the user on every request so deactivated accounts are blocked immediately.
  const user = await userModel.findById(payload.id);
  if (!user) throw new AppError('Your session is no longer valid. Please log in again.', 401);
  if (!user.is_active) throw new AppError('Your account has been deactivated. Please contact support.', 403, 'ACCOUNT_DEACTIVATED');

  req.user = user;
  next();
});

export const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new AppError('You do not have permission to do that', 403));
  }
  next();
};
