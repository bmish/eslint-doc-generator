export default {
  rules: {
    'no-foo': {
      meta: {
        docs: { description: 'Description for no-foo.' },
        deprecated: true,
        replacedBy: ['no-bar']
      },
      create(context) {}
    },
    'no-bar': {
      meta: {
        docs: { description: 'Description for no-bar.' }
      },
      create(context) {}
    },
  },
};