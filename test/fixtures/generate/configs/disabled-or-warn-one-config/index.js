export default {
  rules: {
    'no-foo': {
      meta: { docs: { description: 'Description of no-foo.' }, },
      create(context) {}
    },
    'no-bar': {
      meta: { docs: { description: 'Description of no-bar.' }, },
      create(context) {}
    },
  },
  configs: {
    recommended: {
      rules: {
        'test/no-foo': 1,
        'test/no-bar': 0,
      }
    },
  }
};

