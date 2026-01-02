export default {
  rules: {
    'no-foo': {
      meta: {
        docs: { description: 'Description of no-foo.' },
        schema: [
          {
            type: 'object',
            properties: {
              optionToDoSomething: {
                type: 'boolean',
                default: false,
              },
            },
            additionalProperties: false,
          },
        ]
      },
      create(context) {}
    },
  },
  configs: {
    all: {
      rules: {
        'test/no-foo': 'error',
      }
    }
  }
};