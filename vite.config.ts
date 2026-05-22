import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  base: '/',
  define: {
    __APP_VERSION__: JSON.stringify(`v${new Date().toISOString().slice(0, 10).replace(/-/g, '.')}`),
  },
  build: {
    minify: 'terser',
    terserOptions: {
      compress: { drop_console: false, drop_debugger: true },
      mangle: { toplevel: true },
      format: { comments: false },
    },
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
});
