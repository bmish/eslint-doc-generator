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
    // TODO: these import rules are running extremely slowly (several seconds each) so disable for now.
    'import/default': 'off',
    'import/namespace': 'off',
    'import/no-cycle': 'off',
    'import/no-deprecated': 'off',
    'import/no-named-as-default': 'off',
    'import/no-named-as-default-member': 'off',

    'import/extensions': ['error', 'always'],
    'node/no-missing-import': 'off', // Disabled due to a bug: https://github.com/mysticatea/eslint-plugin-node/issues/342
    'unicorn/expiring-todo-comments': 'off',
    'unicorn/no-array-reduce': 'off',
    'unicorn/no-nested-ternary': 'off',
    'unicorn/prevent-abbreviations': 'off',
    'require-unicode-regexp': 'error',
  },
  overrides: [
    {
      parser: '@typescript-eslint/parser',
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: ['./tsconfig.json'],
      },
      files: ['*.ts'],
      extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
      ],
      rules: {
        'node/no-unsupported-features/es-syntax': [
          'error',
          { ignores: ['dynamicImport', 'modules'] },
        ],

        '@typescript-eslint/require-array-sort-compare': 'error',
      },
    },
  ],
};
