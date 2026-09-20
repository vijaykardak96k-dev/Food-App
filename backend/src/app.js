import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';
import { uploadDir } from './middleware/upload.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import restaurantRoutes from './routes/restaurantRoutes.js';
import foodRoutes from './routes/foodRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import addressRoutes from './routes/addressRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import restaurantPanelRoutes from './routes/restaurantPanelRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
fs.mkdirSync(uploadDir, { recursive: true });

const app = express();

const allowedOrigins = [env.frontendUrl, 'http://127.0.0.1:5173'];
app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '100kb' }));

// Sample images (backend/public/images) and images uploaded by restaurants (backend/uploads)
app.use('/images', express.static(path.resolve(__dirname, '../public/images'), { maxAge: '1h' }));
app.use('/uploads', express.static(uploadDir, { maxAge: '1h' }));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/restaurant', restaurantPanelRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
