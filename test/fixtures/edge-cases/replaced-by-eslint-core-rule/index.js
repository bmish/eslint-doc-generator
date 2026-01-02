export default {
  rules: {
    'no-foo': {
      meta: {
        docs: { description: 'Description.' },
        deprecated: true,
        replacedBy: ['no-unused-vars'],
      },
      create(context) {}
    },
  },
};