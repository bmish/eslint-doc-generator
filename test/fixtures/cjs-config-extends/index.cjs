module.exports = {
  rules: {
    'no-foo': {
      meta: { docs: { description: 'Description of no-foo.' } },
      create() {},
    },
    'no-bar': {
      meta: { docs: { description: 'Description of no-bar.' } },
      create() {},
    },
    'no-baz': {
      meta: { docs: { description: 'Description of no-baz.' } },
      create() {},
    },
    'no-biz': {
      meta: { docs: { description: 'Description of no-biz.' } },
      create() {},
    },
  },
  configs: {
    recommended: {
      extends: [
        require.resolve('./base-config.cjs'),
        // Should ignore these since they're external:
        'eslint:recommended',
        'plugin:some-plugin/recommended',
        'prettier',
      ],
    },
  },
};
