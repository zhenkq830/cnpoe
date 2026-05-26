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
      mangle: { toplevel: true, properties: { regex: /^(cn|tw|en|cnTags|twTags|label|desc|text|name|key)$/ } },
      format: { comments: false },
    },
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) return 'vendor';
          if (id.includes('modTranslations') || id.includes('poe2Mod') || id.includes('poe2Base') || id.includes('passiveNames') || id.includes('gemData') || id.includes('supportGemData') || id.includes('baseTypes')) return 'data';
        },
      },
    },
  },
});
