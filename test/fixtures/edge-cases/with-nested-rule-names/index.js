export default {
  rules: {
    'category/no-foo': {
      meta: {
        docs: { description: 'Description.' },
        deprecated: true,
        replacedBy: ['category/no-bar'],
      },
      create(context) {}
    },
    'category/no-bar': {
      meta: {
        docs: { description: 'Description.' },
        deprecated: true,
        replacedBy: ['test/category/no-foo'],
      },
      create(context) {}
    },
  },
  configs: {}
};