import app from './app.js';
import { env } from './config/env.js';
import { checkDatabase } from './config/db.js';

const dbReady = await checkDatabase();
if (!dbReady) process.exit(1);

const server = app.listen(env.port, () => {
  console.log(`Cravo API running on http://localhost:${env.port}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') console.error(`Port ${env.port} is already in use. Change PORT in backend/.env or stop the other program.`);
  else console.error(err);
  process.exit(1);
});
