export default {
  rules: {
    'no-foo': {
      meta: {
        docs: { description: 'Description of no-foo.' },
        fixable: 'code',
        hasSuggestions: true,
        schema: [
          {
            type: 'object',
            properties: {
              optionToDoSomething1: {
                type: 'boolean',
                default: false,
              },
            },
            additionalProperties: false,
          },
          {
            type: 'array',
            minItems: 1,
            maxItems: 1,
            items: [
              {
                type: 'object',
                properties: {
                  optionToDoSomething2: {
                    type: 'boolean',
                    default: false,
                  },
                },
                additionalProperties: false,
              },
            ],
          },
          {
            type: 'array',
          },
        ]
      },
      create(context) {}
    },
    'no-bar': {
      meta: {
        docs: { description: 'Description of no-bar.' },
        fixable: 'code',
        schema: [],
      },
      create(context) {},
    },
    'no-baz': {
      meta: { docs: { description: 'Description of no-boz.' }, },
      create(context) {}
    },
  },
  configs: {
    all: {
      rules: {
        'test/no-foo': 'error',
        'test/no-bar': 'error',
      }
    },
    recommended: {
      rules: {
        'test/no-foo': 'error',
      }
    },
    style: {
      rules: {
        'test/no-bar': 'error',
      }
    }
  }
};