export default {
  rules: {
    'no-foo': {
      meta: {
        schema: [{
          type: "object",
          properties: {
            foo: {
              default: false,
              required: false,
              deprecated: false,
            },
          },
        }],
      },
      create(context) {}
    },
  },
};