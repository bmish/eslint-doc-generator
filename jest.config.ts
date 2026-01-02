import type { Config } from 'jest';
// https://kulshekhar.github.io/ts-jest/docs/guides/esm-support/
import { createDefaultEsmPreset } from 'ts-jest';

const defaultEsmPreset = createDefaultEsmPreset();

// https://kulshekhar.github.io/ts-jest/docs/guides/esm-support/
const config: Config = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/test/**/*-test.ts'],
  setupFiles: ['<rootDir>/test/jest.setup.cjs'],
  ...defaultEsmPreset,
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '#(.*)': '<rootDir>/node_modules/$1',
  },
  coveragePathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/test/'],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
};

export default config;
