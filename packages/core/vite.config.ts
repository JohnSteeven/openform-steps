import { defineConfig } from 'vite';
import path from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      include: ['src/**/*.ts'],
      rollupTypes: true
    })
  ],
  build: {
    lib: {
      entry: path.resolve(import.meta.dirname, 'src/index.ts'),
      name: 'OpenFormStepsCore',
      fileName: () => 'index.js',
      formats: ['es']
    },
    rollupOptions: {
      external: ['zod']
    }
  }
});
