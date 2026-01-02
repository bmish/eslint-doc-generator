export default {
  rules: {
    'no-foo': {
      meta: { docs: { description: 'Description no-foo.' }, },
      create(context) {}
    },
  },
  configs: {
    recommended: { description: 'Foo|Bar' },
  }
};