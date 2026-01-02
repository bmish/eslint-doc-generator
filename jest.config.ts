import type { Config } from 'jest';
import { createDefaultEsmPreset } from 'ts-jest';

const defaultEsmPreset = createDefaultEsmPreset();

// https://kulshekhar.github.io/ts-jest/docs/guides/esm-support/
const config: Config = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/test/**/*-test.ts'],
  setupFiles: ['<rootDir>/test/jest.setup.cjs'],
  transformIgnorePatterns: [],
  ...defaultEsmPreset,
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '#(.*)': '<rootDir>/node_modules/$1',
  },
  transform: {
    '^.+\\.m?tsx?$': [
      'ts-jest',
      {
        useESM: true,
        isolatedModules: true,
        tsconfig: 'tsconfig.test.json',
      },
    ],
  },
  testEnvironmentOptions: {
    globalsCleanup: 'off',
  },
  coveragePathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/test/',
    // these files are created by the test suite in the in-memory fs,
    // which test has access to and so counts in coverage by default
    '<rootDir>/index.js',
    '<rootDir>/index-foo.js',
  ],
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
