export default {
  rules: {
    'no-foo': {
      meta: {
        schema: [{ type: "object", properties: { foo: { description: 'some desc' } } }]
      },
      create(context) {}
    },
  },
};