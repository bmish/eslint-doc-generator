export default {
  rules: { 'no-foo': { meta: { docs: { description: 'Description.' }, }, create(context) {} }, },
  configs: {
    recommended: {
      rules: {
        'test/no-foo': 'error',
      }
    }
  }
};