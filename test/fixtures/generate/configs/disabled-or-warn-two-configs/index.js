export default {
  rules: {
    'no-foo': {
      meta: { docs: { description: 'Description of no-foo.' }, },
      create(context) {},
    },
  },
  configs: {
    recommended: {
      rules: {
        'test/no-foo': 1,
      }
    },
    typescript: {
      rules: {
        'test/no-foo': 0,
      }
    },
  }
};
