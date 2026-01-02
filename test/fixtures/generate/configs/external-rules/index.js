export default {
  rules: {
    'no-foo': { meta: { docs: { description: 'Description for no-foo.'} }, create(context) {} },
  },
  configs: {
    recommended: {
      plugins: ['external', 'test'],
      rules: {
        'test/no-foo': 'error',
        'external/no-bar': 'error',
      }
    },
  }
};