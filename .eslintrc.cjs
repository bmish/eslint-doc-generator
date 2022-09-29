module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  extends: [
    'plugin:square/typescript',
    'plugin:node/recommended',
    'plugin:unicorn/recommended', // Turn eslint-plugin-unicorn recommended rules on again because many were turned off by eslint-plugin-square.
    'plugin:jest/recommended',
  ],
  env: {
    node: true,
  },
  settings: {
    node: {
      tryExtensions: ['.js', '.json', '.node', '.ts', '.d.ts'],
    },
  },
  rules: {
    'import/extensions': ['error', 'always'],
    'node/no-missing-import': 'off', // Disabled due to a bug: https://github.com/mysticatea/eslint-plugin-node/issues/342
    'unicorn/no-array-reduce': 'off',
    'unicorn/no-nested-ternary': 'off',
    'unicorn/prevent-abbreviations': 'off',
  },
  overrides: [
    {
      parser: '@typescript-eslint/parser',
      files: ['*.ts'],
      extends: ['plugin:@typescript-eslint/recommended'],
      rules: {
        'node/no-unsupported-features/es-syntax': [
          'error',
          { ignores: ['dynamicImport', 'modules'] },
        ],
      },
    },
  ],
};
