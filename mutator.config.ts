import { defineConfig } from '@mizchi/mutator';

export default defineConfig({
  include: ['src/lib/**/*.ts'],
  exclude: ['src/lib/chapters.ts', '**/*.test.ts'],
});
