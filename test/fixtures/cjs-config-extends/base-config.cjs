module.exports = {
  extends: [require.resolve('./base-base-config.cjs')],
  rules: { 'test/no-foo': 'error' },
  overrides: [
    {
      extends: [require.resolve('./override-config.cjs')],
      files: ['*.js'],
      rules: { 'test/no-baz': 'error' },
    },
  ],
};
