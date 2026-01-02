export default {
  rules: {
    'no-foo': { meta: { docs: { description: 'Description for no-foo.'} }, create(context) {} },
  },
  configs: {
    foo: {
      rules: { 'test/no-foo': 'error', },
    },
    bar: {
      rules: { 'test/no-foo': 'error', },
    },
    baz: {
      rules: { 'test/no-foo': 'error', },
    }
  }
};