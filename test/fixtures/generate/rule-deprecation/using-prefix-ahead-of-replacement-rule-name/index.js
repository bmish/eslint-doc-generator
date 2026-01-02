export default {
  rules: {
    'no-foo': {
      meta: {
        docs: { description: 'Description.' },
        deprecated: true,
        replacedBy: ['test/no-bar'],
      },
      create(context) {}
    },
    'no-bar': {
      meta: { docs: { description: 'Description.' }, },
      create(context) {}
    },
  },
  configs: {}
};