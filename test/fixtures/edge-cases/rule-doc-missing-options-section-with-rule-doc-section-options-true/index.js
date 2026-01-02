export default {
  rules: {
    'no-foo': {
      meta: {
        docs: { description: 'Description of no-foo.', },
        schema: [{ type: 'object', },]
      },
      create(context) {},
    },
  },
};