export default {
  rules: {
    'no-foo': {
      meta: {
        schema: [{ type: "object", properties: { foo: { description: `test
        desc`, type: 'string|number' } } }]
      },
      create(context) {}
    },
  },
};