export default {
  rules: {
    'no-foo': function create () {}
  },
  configs: {
    recommended: {
      rules: {
        'test/no-foo': 'error',
      }
    },
  }
};

