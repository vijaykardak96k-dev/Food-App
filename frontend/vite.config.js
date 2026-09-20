import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // strictPort keeps the app on 5173, which is the origin the backend allows (CORS).
  server: { port: 5173, strictPort: true },
});
