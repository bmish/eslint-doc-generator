export default {
  rules: {
    'no-foo': {
      meta: {
        docs: { description: 'Description for no-foo.' },
        hasSuggestions: true,
        fixable: 'code',
        deprecated: true,
      },
      create(context) {}
    },
  },
};