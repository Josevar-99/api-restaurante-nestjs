import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({

  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    root: './',
    include: ['**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      exclude: [
        'src/category/**', 
        '**/*.dto.ts',
        '**/*.module.ts',
        'src/main.ts',
        'dist/**',
        'test/**',
      ],
    },
  },
});