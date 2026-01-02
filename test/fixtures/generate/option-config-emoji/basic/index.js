export default {
  rules: {
    'no-foo': { meta: { docs: { description: 'Description for no-foo.'} }, create(context) {} },
    'no-bar': { meta: { docs: { description: 'Description for no-bar.'} }, create(context) {} },
    'no-baz': { meta: { docs: { description: 'Description for no-boz.'} }, create(context) {} },
  },
  configs: {
    recommended: {
      rules: { 'test/no-foo': 'error', 'test/no-bar': 'error' },
    },
    stylistic: {
      rules: { 'test/no-bar': 'error', 'test/no-baz': 'error' },
    },
    custom: {
      rules: { 'test/no-baz': 'error' },
    }
  }
};