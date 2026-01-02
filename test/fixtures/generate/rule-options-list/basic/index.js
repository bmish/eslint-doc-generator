export default {
  rules: {
    'no-foo': {
      meta: {
        schema: [{
          type: "object",
          properties: {
            foo: {
              type: "boolean",
              description: "Enable some kind of behavior.",
              deprecated: true,
              default: false
            },
            bar: {
              description: "Choose how to use the rule.",
              type: "string",
              enum: ["always", "never"],
              default: "always"
            },
            baz: {
              default: true,
              required: true,
            },
            biz: {},
            arr1: {
              type: "array",
            },
            arrWithArrType: {
              type: ["string", "boolean"],
            },
            arrWithArrTypeSingleItem: {
              type: ["string"],
            },
            arrWithItemsType: {
              type: "array",
              items: {
                type: "string"
              }
            },
            arrWithItemsArrayType: {
              type: "array",
              items: {
                type: ["string", "boolean"]
              }
            },
            arrWithDefaultEmpty: {
              type: "array",
              default: [],
            },
            arrWithDefault: {
              type: "array",
              default: ['hello world', 1, 2, 3, true],
            },
          },
          required: ["bar"],
          additionalProperties: false
        }],
      },
      create(context) {}
    },
  },
  configs: {
    recommended: {},
  }
};