import { generate } from '../../../lib/generator.js';
import mockFs from 'mock-fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { jest } from '@jest/globals';

const __dirname = dirname(fileURLToPath(import.meta.url));

const PATH_NODE_MODULES = resolve(__dirname, '..', '..', '..', 'node_modules');

describe('generate (file paths)', function () {
  describe('missing rule doc', function () {
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
                    meta: { },
                    create(context) {}
                  },
                },
              };`,

        'README.md':
          '<!-- begin auto-generated rules list --><!-- end auto-generated rules list -->',

        // Needed for some of the test infrastructure to work.
        node_modules: mockFs.load(PATH_NODE_MODULES),
      });
    });

    afterEach(function () {
      mockFs.restore();
      jest.resetModules();
    });

    it('throws an error', async function () {
      // Use join to handle both Windows and Unix paths.
      await expect(generate('.')).rejects.toThrow(
        `Could not find rule doc: ${join('docs', 'rules', 'no-foo.md')}`
      );
    });
  });

  describe('missing README', function () {
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
                    meta: { },
                    create(context) {}
                  },
                },
              };`,

        'docs/rules/no-foo.md': '',

        // Needed for some of the test infrastructure to work.
        node_modules: mockFs.load(PATH_NODE_MODULES),
      });
    });

    afterEach(function () {
      mockFs.restore();
      jest.resetModules();
    });

    it('throws an error', async function () {
      await expect(generate('.')).rejects.toThrow(
        'Could not find README.md in ESLint plugin.'
      );
    });
  });

  describe('lowercase README file', function () {
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
                  'no-foo': { meta: { }, create(context) {} },
                },
              };`,

        'readme.md':
          '<!-- begin auto-generated rules list --><!-- end auto-generated rules list -->',
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
      expect(readFileSync('readme.md', 'utf8')).toMatchSnapshot();
    });
  });

  describe('custom path to rule docs and rules list', function () {
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
                  'no-foo': { meta: { }, create(context) {} },
                },
              };`,

        'rules/list.md':
          '<!-- begin auto-generated rules list --><!-- end auto-generated rules list -->',
        'rules/no-foo/no-foo.md': '',

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
        pathRuleDoc: 'rules/{name}/{name}.md',
        pathRuleList: 'rules/list.md',
      });
      expect(readFileSync('rules/list.md', 'utf8')).toMatchSnapshot();
      expect(readFileSync('rules/no-foo/no-foo.md', 'utf8')).toMatchSnapshot();
    });
  });
});
