const noFoo = function create () {};
noFoo.deprecated = true;
noFoo.schema = [
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
];
export default {
  rules: {
    'no-foo': noFoo
  },
};

