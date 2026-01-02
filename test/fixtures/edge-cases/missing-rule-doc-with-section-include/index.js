export default {
  rules: {
    'no-foo': {
      meta: { },
      create(context) {}
    },
    'no-bar': {
      meta: { schema: [{ type: 'object', properties: { option1: {} } }] },
      create(context) {}
    },
  },
};