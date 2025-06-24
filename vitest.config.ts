import { defineConfig } from 'vitest/config'; // eslint-disable-line import/extensions

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*-test.ts'],
    setupFiles: ['test/jest.setup.cjs'],
    coverage: {
      thresholds: {
        branches: 100,
        functions: 100,
        lines: 100,
        statements: 100,
      },
    },
  },
});
