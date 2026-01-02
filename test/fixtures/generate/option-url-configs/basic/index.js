export default {
  rules: {
    'no-foo': { meta: { docs: { description: 'Description for no-foo.'} }, create(context) {} },
    'no-bar': { meta: { docs: { description: 'Description for no-bar.'} }, create(context) {} },
  },
  configs: {
    recommended: {
      rules: {
        'test/no-foo': 'error',
      }
    },
    customConfig: {
      rules: {
        'test/no-bar': 'error',
      }
    },
  }
};