export default {
  rules: {
    'no-foo': {
      meta: { docs: { description: 'Description of no-foo.' }, },
      create(context) {}
    },
  },
  configs: {
    foo: {},
    recommended: { meta: { description: 'This config has the recommended rules...' } },
  }
};