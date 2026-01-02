export default {
  rules: {
    'no-foo': {
      meta: {
        docs: { description: 'Description of no-foo.' },
        deprecated: true,
        replacedBy: ['no-bar'],
      },
      create(context) {}
    },
    'no-bar': {
      meta: {
        docs: { description: 'Description of no-bar.' },
      },
      create(context) {},
    },
    'no-baz': {
      meta: {
        docs: { description: 'Description of no-baz.' },
        deprecated: true,
        replacedBy: ['no-bar', 'no-qux'],
      },
      create(context) {}
    },
    'no-qux': {
      meta: {
        docs: { description: 'Description of no-qux.' },
      },
      create(context) {}
    },
  },
  configs: {
    recommended: {
      rules: {
        'test/no-foo': 'error',
        'test/no-bar': 'error',
      }
    }
  }
};

