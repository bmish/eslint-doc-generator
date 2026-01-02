export default {
  rules: {
    'no-foo': { create(context) {} },
  },
  configs: {
    recommended: {
      rules: {
        'test/no-foo': 'error',
      }
    },
  }
};

