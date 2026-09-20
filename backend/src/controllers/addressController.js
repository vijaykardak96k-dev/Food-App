import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { text, positiveInt, isPhone, cleanPhone } from '../utils/validate.js';
import * as addressModel from '../models/addressModel.js';

export const list = asyncHandler(async (req, res) => {
  res.json({ addresses: await addressModel.listByUser(req.user.id) });
});

export const create = asyncHandler(async (req, res) => {
  const fullAddress = text(req.body.full_address, 'Full address', { min: 5, max: 255 });
  const city = text(req.body.city, 'City', { min: 2, max: 80 });
  const pincode = String(req.body.pincode || '').trim();
  if (!/^\d{6}$/.test(pincode)) throw new AppError('Pincode must be 6 digits', 400);
  const rawPhone = String(req.body.phone || '').trim();
  if (rawPhone && !isPhone(rawPhone)) throw new AppError('Phone number must be 10 digits', 400);

  const id = await addressModel.create({
    userId: req.user.id, fullAddress, city, pincode, phone: rawPhone ? cleanPhone(rawPhone) : null,
  });
  res.status(201).json({ address: await addressModel.findOwned(id, req.user.id) });
});

export const remove = asyncHandler(async (req, res) => {
  const id = positiveInt(req.params.id, 'Address');
  const removed = await addressModel.remove(id, req.user.id);
  if (!removed) throw new AppError('Address not found', 404);
  res.json({ message: 'Address deleted' });
});
