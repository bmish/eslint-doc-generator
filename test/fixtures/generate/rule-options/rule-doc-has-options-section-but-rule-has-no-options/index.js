export default {
  rules: {
    'no-foo': {
      meta: { docs: { description: 'Description of no-foo.' }, },
      create(context) {}
    },
  },
  configs: {
    all: {
      rules: {
        'test/no-foo': 'error',
      }
    }
  }
};