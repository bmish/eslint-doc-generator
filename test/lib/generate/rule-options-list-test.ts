import { generate } from '../../../lib/generator.js';
import mockFs from 'mock-fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { jest } from '@jest/globals';

const __dirname = dirname(fileURLToPath(import.meta.url));

const PATH_NODE_MODULES = resolve(__dirname, '..', '..', '..', 'node_modules');

describe('generate (rule options list)', function () {
  describe('basic', function () {
    beforeEach(function () {
      mockFs({
        'package.json': JSON.stringify({
          name: 'eslint-plugin-test',
          exports: 'index.js',
          type: 'module',
        }),

        'index.js': `
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
          };`,

        'README.md': '## Rules\n',

        'docs/rules/no-foo.md': `## Options
<!-- begin auto-generated rule options list -->
<!-- end auto-generated rule options list -->`,

        // Needed for some of the test infrastructure to work.
        node_modules: mockFs.load(PATH_NODE_MODULES),
      });
    });

    afterEach(function () {
      mockFs.restore();
      jest.resetModules();
    });

    it('generates the documentation', async function () {
      await generate('.');
      expect(readFileSync('docs/rules/no-foo.md', 'utf8')).toMatchSnapshot();
    });
  });

  describe('with no options', function () {
    beforeEach(function () {
      mockFs({
        'package.json': JSON.stringify({
          name: 'eslint-plugin-test',
          exports: 'index.js',
          type: 'module',
        }),

        'index.js': `
          export default {
            rules: {
              'no-foo': {
                meta: {},
                create(context) {}
              },
            },
            configs: {
              recommended: {},
            }
          };`,

        'README.md': '## Rules\n',

        'docs/rules/no-foo.md': `## Options
<!-- begin auto-generated rule options list -->
<!-- end auto-generated rule options list -->`,

        // Needed for some of the test infrastructure to work.
        node_modules: mockFs.load(PATH_NODE_MODULES),
      });
    });

    afterEach(function () {
      mockFs.restore();
      jest.resetModules();
    });

    it('generates the documentation', async function () {
      await generate('.');
      expect(readFileSync('docs/rules/no-foo.md', 'utf8')).toMatchSnapshot();
    });
  });

  describe('with no marker comments', function () {
    beforeEach(function () {
      mockFs({
        'package.json': JSON.stringify({
          name: 'eslint-plugin-test',
          exports: 'index.js',
          type: 'module',
        }),

        'index.js': `
          export default {
            rules: {
              'no-foo': {
                meta: {
                  schema: [{ type: "object", properties: { foo: { description: 'some desc' } } }]
                },
                create(context) {}
              },
            },
          };`,

        'README.md': '## Rules\n',

        'docs/rules/no-foo.md': '## Options\nfoo',

        // Needed for some of the test infrastructure to work.
        node_modules: mockFs.load(PATH_NODE_MODULES),
      });
    });

    afterEach(function () {
      mockFs.restore();
      jest.resetModules();
    });

    it('generates the documentation', async function () {
      await generate('.');
      expect(readFileSync('docs/rules/no-foo.md', 'utf8')).toMatchSnapshot();
    });
  });

  describe('with string that needs to be escaped in table', function () {
    beforeEach(function () {
      mockFs({
        'package.json': JSON.stringify({
          name: 'eslint-plugin-test',
          exports: 'index.js',
          type: 'module',
        }),

        'index.js': `
          export default {
            rules: {
              'no-foo': {
                meta: {
                  schema: [{ type: "object", properties: { foo: { description: \`test
                  desc\`, type: 'string|number' } } }]
                },
                create(context) {}
              },
            },
          };`,

        'README.md': '## Rules\n',

        'docs/rules/no-foo.md': `## Options
<!-- begin auto-generated rule options list -->
<!-- end auto-generated rule options list -->`,

        // Needed for some of the test infrastructure to work.
        node_modules: mockFs.load(PATH_NODE_MODULES),
      });
    });

    afterEach(function () {
      mockFs.restore();
      jest.resetModules();
    });

    it('generates the documentation', async function () {
      await generate('.');
      expect(readFileSync('docs/rules/no-foo.md', 'utf8')).toMatchSnapshot();
    });
  });
});
