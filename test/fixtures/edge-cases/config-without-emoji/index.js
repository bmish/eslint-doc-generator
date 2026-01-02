export default {
  rules: {
    'no-foo': { meta: { docs: { description: 'Description for no-foo.'} }, create(context) {} },
  },
  configs: {
    configWithoutEmoji: { rules: { 'test/no-foo': 'error' } },
  }
};