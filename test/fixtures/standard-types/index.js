export default {
  rules: {
    'no-foo': {
      meta: {
        docs: { description: 'Description of no-foo.' },
        type: 'problem',
      },
      create(context) {}
    },
    'no-bar': {
      meta: {
        docs: { description: 'Description of no-bar.' },
        type: 'suggestion',
      },
      create(context) {},
    },
    'no-biz': {
      meta: {
        docs: { description: 'Description of no-biz.' },
        type: 'layout',
      },
      create(context) {}
    },
    'no-boz': {
      meta: {
        docs: { description: 'Description of no-boz.' },
        type: 'unknown',
      },
      create(context) {}
    },
    'no-buz': {
      meta: {
        docs: { description: 'Description of no-buz.' },
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

