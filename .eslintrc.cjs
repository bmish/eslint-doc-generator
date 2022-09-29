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
  },
  overrides: [
    {
      parser: '@typescript-eslint/parser',
      files: ['*.ts'],
      extends: ['plugin:@typescript-eslint/recommended'],
      rules: {
        'node/no-unsupported-features/es-syntax': [
          'error',
          { ignores: ['modules'] },
        ],
      },
    },
  ],
};
