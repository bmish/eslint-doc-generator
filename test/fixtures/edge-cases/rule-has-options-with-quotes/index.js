export default {
  rules: {
    'no-foo': {
      meta: {
        docs: { description: 'Description of no-foo.', },
        schema: [
          {
            type: 'object',
            properties: {
              'input[type="foo"]': {
                type: 'boolean',
                default: false,
              },
              "input[type='bar']": {
                type: 'boolean',
                default: false,
              },
            },
            additionalProperties: false,
          },
        ]
      },
      create(context) {},
    },
  },
};