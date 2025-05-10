import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.ts'],
    exclude: ['tests/config.ts'],
    environment: 'node',
    globals: true,
    watch: false
  }
}); 