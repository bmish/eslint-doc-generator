export default {
  rules: {
    'no-foo': {
      meta: {
        docs: { description: 'Description.' },
        deprecated: true,
        replacedBy: ['other-plugin/no-foo'],
      },
      create(context) {}
    },
  },
};