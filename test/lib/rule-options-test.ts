import { getAllNamedOptions } from '../../lib/rule-options.js';

describe('rule options', function () {
  describe('#getAllNamedOptions', function () {
    it('handles null', function () {
      expect(getAllNamedOptions(null)).toMatchInlineSnapshot('[]'); // eslint-disable-line unicorn/no-null
    });

    it('handles undefined', function () {
      expect(getAllNamedOptions(undefined)).toMatchInlineSnapshot('[]'); // eslint-disable-line unicorn/no-useless-undefined
    });

    it('handles empty array', function () {
      expect(getAllNamedOptions([])).toMatchInlineSnapshot('[]');
    });

    it('handles array of empty object', function () {
      expect(getAllNamedOptions([{}])).toMatchInlineSnapshot('[]');
    });

    it('handles empty object', function () {
      expect(getAllNamedOptions({})).toMatchInlineSnapshot('[]');
    });

    it('handles object', function () {
      expect(
        getAllNamedOptions({
          type: 'object',
          properties: {
            optionToDoSomething1: {
              type: 'boolean',
              default: false,
              deprecated: true,
            },
            optionToDoSomething2: {
              type: 'string',
              enum: ['always', 'never'],
            },
            optionToDoSomething3: {
              required: true,
            },
          },
          required: ['optionToDoSomething'],
          additionalProperties: false,
        })
      ).toMatchInlineSnapshot(`
        [
          {
            "default": false,
            "deprecated": true,
            "description": undefined,
            "enum": undefined,
            "name": "optionToDoSomething1",
            "required": false,
            "type": "Boolean",
          },
          {
            "default": undefined,
            "deprecated": undefined,
            "description": undefined,
            "enum": [
              "always",
              "never",
            ],
            "name": "optionToDoSomething2",
            "required": false,
            "type": "String",
          },
          {
            "default": undefined,
            "deprecated": undefined,
            "description": undefined,
            "enum": undefined,
            "name": "optionToDoSomething3",
            "required": true,
            "type": undefined,
          },
        ]
      `);
    });

    it('handles object in JS array', function () {
      expect(
        getAllNamedOptions([
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
        ])
      ).toMatchInlineSnapshot(`
        [
          {
            "default": false,
            "deprecated": undefined,
            "description": undefined,
            "enum": undefined,
            "name": "optionToDoSomething",
            "required": false,
            "type": "Boolean",
          },
        ]
      `);
    });

    it('handles multiple objects in JS array', function () {
      expect(
        getAllNamedOptions([
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
            type: 'object',
            properties: {
              optionToDoSomething2: {
                type: 'boolean',
                default: false,
              },
            },
            additionalProperties: false,
          },
        ])
      ).toMatchInlineSnapshot(`
        [
          {
            "default": false,
            "deprecated": undefined,
            "description": undefined,
            "enum": undefined,
            "name": "optionToDoSomething1",
            "required": false,
            "type": "Boolean",
          },
          {
            "default": false,
            "deprecated": undefined,
            "description": undefined,
            "enum": undefined,
            "name": "optionToDoSomething2",
            "required": false,
            "type": "Boolean",
          },
        ]
      `);
    });

    it('handles object in array schema', function () {
      expect(
        getAllNamedOptions([
          {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                optionToDoSomething: {
                  type: 'boolean',
                  default: false,
                },
              },
              additionalProperties: false,
            },
          },
        ])
      ).toMatchInlineSnapshot(`
        [
          {
            "default": false,
            "deprecated": undefined,
            "description": undefined,
            "enum": undefined,
            "name": "optionToDoSomething",
            "required": false,
            "type": "Boolean",
          },
        ]
      `);
    });

    it('handles array in object', function () {
      expect(
        getAllNamedOptions([
          {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                optionToDoSomething: {
                  type: 'boolean',
                  default: false,
                },
              },
              additionalProperties: false,
            },
          },
        ])
      ).toMatchInlineSnapshot(`
        [
          {
            "default": false,
            "deprecated": undefined,
            "description": undefined,
            "enum": undefined,
            "name": "optionToDoSomething",
            "required": false,
            "type": "Boolean",
          },
        ]
      `);
    });

    it('handles object in array in object', function () {
      expect(
        getAllNamedOptions([
          {
            type: 'object',
            properties: {
              optionToDoSomething1: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    optionToDoSomething2: {
                      type: 'boolean',
                      default: false,
                    },
                  },
                  additionalProperties: false,
                },
              },
              optionToDoSomething2: {
                type: 'array',
              },
            },
            additionalProperties: false,
          },
        ])
      ).toMatchInlineSnapshot(`
        [
          {
            "default": undefined,
            "deprecated": undefined,
            "description": undefined,
            "enum": undefined,
            "name": "optionToDoSomething1",
            "required": false,
            "type": "Object[]",
          },
          {
            "default": undefined,
            "deprecated": undefined,
            "description": undefined,
            "enum": undefined,
            "name": "optionToDoSomething2",
            "required": false,
            "type": "Array",
          },
          {
            "default": false,
            "deprecated": undefined,
            "description": undefined,
            "enum": undefined,
            "name": "optionToDoSomething2",
            "required": false,
            "type": "Boolean",
          },
        ]
      `);
    });

    it('handles when type is an array', function () {
      expect(
        getAllNamedOptions([
          {
            type: 'object',
            properties: {
              optionToDoSomething1: {
                type: 'array',
                items: {
                  type: ['boolean', 'string'],
                },
              },
              optionToDoSomething2: {
                type: ['boolean', 'string'],
              },
              optionToDoSomething3: {
                type: ['boolean'],
              },
            },
            additionalProperties: false,
          },
        ])
      ).toMatchInlineSnapshot(`
        [
          {
            "default": undefined,
            "deprecated": undefined,
            "description": undefined,
            "enum": undefined,
            "name": "optionToDoSomething1",
            "required": false,
            "type": "(Boolean, String)[]",
          },
          {
            "default": undefined,
            "deprecated": undefined,
            "description": undefined,
            "enum": undefined,
            "name": "optionToDoSomething2",
            "required": false,
            "type": "Boolean, String",
          },
          {
            "default": undefined,
            "deprecated": undefined,
            "description": undefined,
            "enum": undefined,
            "name": "optionToDoSomething3",
            "required": false,
            "type": "Boolean",
          },
        ]
      `);
    });
  });
});
