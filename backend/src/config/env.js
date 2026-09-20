// Reads settings from backend/.env (see .env.example)
import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: Number(process.env.PORT) || 5000,
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'food_delivery',
  },
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  demoPassword: process.env.DEMO_PASSWORD || 'Demo@1234',
};

if (!env.jwtSecret) {
  console.error('\nMissing JWT_SECRET. Copy backend/.env.example to backend/.env and set JWT_SECRET.\n');
  process.exit(1);
}
