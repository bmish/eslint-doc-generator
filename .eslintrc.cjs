module.exports = {
  "plugins": [
    "import"
  ],
  root: true,
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  extends: [
    'plugin:n/recommended',
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
    'unicorn/expiring-todo-comments': 'off',
    'unicorn/import-style': 'off',
    'unicorn/no-anonymous-default-export': 'off',
    'unicorn/no-array-reduce': 'off',
    'unicorn/no-nested-ternary': 'off',
    'unicorn/prefer-at': 'off',
    'unicorn/prefer-string-raw': 'off',
    'unicorn/prefer-string-replace-all': 'off',
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
        'n/no-unsupported-features/es-syntax': [
          'error',
          { ignores: ['dynamicImport', 'modules'] },
        ],

        '@typescript-eslint/require-array-sort-compare': 'error',
        '@typescript-eslint/no-unused-vars': 'off'
      },
    },
  ],
};
