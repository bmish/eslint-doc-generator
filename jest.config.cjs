/* eslint filenames/match-exported:"off" -- trouble matching given period in filename */
// https://kulshekhar.github.io/ts-jest/docs/guides/esm-support/

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
const jestConfig = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/test/**/*-test.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { useESM: true }],
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '#(.*)': '<rootDir>/node_modules/$1',
  },
  coveragePathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/test/'],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 80, // TODO: Should be 100% but unclear what function is missing coverage.
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
}

module.exports = jestConfig;
