import { generate } from '../../../lib/generator.js';
import mockFs from 'mock-fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { jest } from '@jest/globals';

const __dirname = dirname(fileURLToPath(import.meta.url));

const PATH_NODE_MODULES = resolve(__dirname, '..', '..', '..', 'node_modules');

describe('generate (rule metadata)', function () {
  describe('deprecated function-style rule', function () {
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
              'no-foo': function create () {}
            },
            configs: {
              recommended: {
                rules: {
                  'test/no-foo': 'error',
                }
              },
            }
          };`,

        'README.md': '## Rules\n',

        'docs/rules/no-foo.md': '',

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
      expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();
      expect(readFileSync('docs/rules/no-foo.md', 'utf8')).toMatchSnapshot();
    });
  });

  describe('deprecated function-style rule with deprecated/schema properties', function () {
    beforeEach(function () {
      mockFs({
        'package.json': JSON.stringify({
          name: 'eslint-plugin-test',
          exports: 'index.js',
          type: 'module',
        }),

        'index.js': `
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
          };`,

        'README.md': '## Rules\n',

        'docs/rules/no-foo.md': '## Options\noptionToDoSomething',

        // Needed for some of the test infrastructure to work.
        node_modules: mockFs.load(PATH_NODE_MODULES),
      });
    });

    afterEach(function () {
      mockFs.restore();
      jest.resetModules();
    });

    it('generates the documentation', async function () {
      await generate('.', {
        // Ensure the relevant properties are shown for the test.
        ruleListColumns: ['name', 'deprecated', 'options'],
      });
      expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();
      expect(readFileSync('docs/rules/no-foo.md', 'utf8')).toMatchSnapshot();
    });
  });

  describe('rule with no meta object', function () {
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
              'no-foo': { create(context) {} },
            },
            configs: {
              recommended: {
                rules: {
                  'test/no-foo': 'error',
                }
              },
            }
          };`,

        'README.md': '## Rules\n',

        'docs/rules/no-foo.md': '',

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
      expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();
      expect(readFileSync('docs/rules/no-foo.md', 'utf8')).toMatchSnapshot();
    });
  });
});
