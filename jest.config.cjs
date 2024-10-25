// https://kulshekhar.github.io/ts-jest/docs/guides/esm-support/
const { createDefaultEsmPreset } = require('ts-jest')

const defaultEsmPreset = createDefaultEsmPreset()

/** @type {import('ts-jest').JestConfigWithTsJest} */

const jestConfig = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/test/**/*-test.ts'],
  setupFiles: ['<rootDir>/test/jest.setup.cjs'],
  ...defaultEsmPreset,
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '#(.*)': '<rootDir>/node_modules/$1',
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

if (process.version.startsWith('v14.')) {
  // TODO: remove this workaround after dropping support for Node 14.
  // Use number greater than number of test suites to avoid: "You are trying to `import` a file after the Jest environment has been torn down."
  // https://github.com/facebook/jest/issues/11438#issuecomment-954155180
  jestConfig.maxConcurrency = 30;
  jestConfig.maxWorkers = 30;
  jestConfig.testTimeout = 10_000; // 10 seconds timeout (twice the default)
}

module.exports = jestConfig;
