export default {
  rules: {
    'no-foo': {
      meta: { docs: { description: 'Description of no-foo.' }, },
      create(context) {},
      schema: [{ /* some options */ }]
    },
  },
  configs: {
    recommended: {
      rules: {
        'test/no-foo': ['error', { /* some options */ }],
      }
    },
  }
};