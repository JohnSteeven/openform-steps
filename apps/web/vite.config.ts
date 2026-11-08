import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  server: {
    host: '127.0.0.1',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
      }
    }
  },
  resolve: {
    alias: {
      '@openform-steps/core': path.resolve(import.meta.dirname, '../../packages/core/src'),
      '@openform-steps/react': path.resolve(import.meta.dirname, '../../packages/react/src'),
      '@openform-steps/builder': path.resolve(import.meta.dirname, '../../packages/builder/src')
    }
  },
  build: {
    target: 'es2022',
    sourcemap: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/lucide-react/')) {
            return 'vendor-icons';
          }
          if (id.includes('node_modules/zod/')) {
            return 'vendor-zod';
          }
        }
      }
    }
  }
});
