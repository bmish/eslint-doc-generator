export default {
  rules: {
    'no-foo': {
      meta: { docs: { description: 'Description of no-foo.' }, },
      create(context) {}
    },
  },
  configs: {
    recommended: {
      overrides: [{
        files: ['**/foo.js'],
        rules: {
          'test/no-foo': 'error',
        }
      }]
    },
  }
};