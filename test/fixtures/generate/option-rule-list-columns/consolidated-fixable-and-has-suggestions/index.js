export default {
  rules: {
    'no-foo': {
      meta: {
        docs: { description: 'Description for no-foo.' },
        hasSuggestions: true,
        fixable: 'code',
      },
      create(context) {}
    },
    'no-bar': {
      meta: {
        docs: { description: 'Description for no-bar.' },
        fixable: 'code',
      },
      create(context) {}
    },
    'no-baz': {
      meta: {
        docs: { description: 'Description for no-baz.' },
      },
      create(context) {}
    },
  },
};