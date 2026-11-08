import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}', 'packages/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/', 'dist/', '**/*.d.ts']
    }
  },
  resolve: {
    alias: {
      '@openform-steps/core': path.resolve(__dirname, './packages/core/src'),
      '@openform-steps/react': path.resolve(__dirname, './packages/react/src'),
      '@openform-steps/builder': path.resolve(__dirname, './packages/builder/src')
    }
  }
});
