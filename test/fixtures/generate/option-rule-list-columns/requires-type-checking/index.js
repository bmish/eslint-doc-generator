export default {
  rules: {
    'no-foo': {
      meta: { docs: { description: 'Description of no-foo.' }, },
      create(context) {}
    },
    'no-bar': {
      meta: { docs: { description: 'Description of no-bar.', requiresTypeChecking: true }, },
      create(context) {}
    },
  },
  configs: {
    all: {
      rules: {
        'test/no-foo': 'error',
      }
    },
  }
};