import { getAllNamedOptions } from '../../lib/rule-options.js';

describe('rule options', function () {
  describe('#getAllNamedOptions', function () {
    it('handles null', function () {
      expect(getAllNamedOptions(null)).toStrictEqual([]); // eslint-disable-line unicorn/no-null
    });

    it('handles undefined', function () {
      expect(getAllNamedOptions(undefined)).toStrictEqual([]); // eslint-disable-line unicorn/no-useless-undefined
    });

    it('handles empty array', function () {
      expect(getAllNamedOptions([])).toStrictEqual([]);
    });

    it('handles array of empty object', function () {
      expect(getAllNamedOptions([{}])).toStrictEqual([]);
    });

    it('handles empty object', function () {
      expect(getAllNamedOptions({})).toStrictEqual([]);
    });

    it('handles object', function () {
      expect(
        getAllNamedOptions({
          type: 'object',
          properties: {
            optionToDoSomething: {
              type: 'boolean',
              default: false,
            },
          },
          additionalProperties: false,
        })
      ).toStrictEqual(['optionToDoSomething']);
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
      ).toStrictEqual(['optionToDoSomething']);
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
      ).toStrictEqual(['optionToDoSomething1', 'optionToDoSomething2']);
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
      ).toStrictEqual(['optionToDoSomething']);
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
      ).toStrictEqual(['optionToDoSomething']);
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
            },
            additionalProperties: false,
          },
        ])
      ).toStrictEqual(['optionToDoSomething1', 'optionToDoSomething2']);
    });
  });
});
