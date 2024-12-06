import { generate } from '../../../lib/generator.js';
import mockFs from 'mock-fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { jest } from '@jest/globals';
import { COLUMN_TYPE } from '../../../lib/types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const PATH_NODE_MODULES = resolve(__dirname, '..', '..', '..', 'node_modules');

describe('generate (--rule-list-columns)', function () {
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
                      docs: { description: 'Description for no-foo.' },
                      hasSuggestions: true,
                      fixable: 'code',
                      deprecated: true,
                    },
                    create(context) {}
                  },
                },
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

    it('shows the right columns and legend', async function () {
      await generate('.', {
        ruleListColumns: [
          COLUMN_TYPE.HAS_SUGGESTIONS,
          COLUMN_TYPE.FIXABLE,
          COLUMN_TYPE.NAME,
        ],
      });
      expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();
      expect(readFileSync('docs/rules/no-foo.md', 'utf8')).toMatchSnapshot();
    });
  });

  describe('consolidated fixableAndHasSuggestions column', function () {
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
                      docs: { description: 'Description for no-foo.' },
                      hasSuggestions: true,
                      fixable: 'code',
                    },
                    create(context) {}
                  },
                  'no-bar': {
                    meta: {
                      docs: { description: 'Description for no-bar.' },
                      fixable: 'code',
                    },
                    create(context) {}
                  },
                  'no-baz': {
                    meta: {
                      docs: { description: 'Description for no-baz.' },
                    },
                    create(context) {}
                  },
                },
              };`,

        'README.md': '## Rules\n',

        'docs/rules/no-foo.md': '',
        'docs/rules/no-bar.md': '',
        'docs/rules/no-baz.md': '',

        // Needed for some of the test infrastructure to work.
        node_modules: mockFs.load(PATH_NODE_MODULES),
      });
    });

    afterEach(function () {
      mockFs.restore();
      jest.resetModules();
    });

    it('shows the right columns and legend', async function () {
      await generate('.', {
        ruleListColumns: [
          COLUMN_TYPE.NAME,
          COLUMN_TYPE.FIXABLE_AND_HAS_SUGGESTIONS,
        ],
      });
      expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();
    });
  });

  describe('non-existent column', function () {
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
                  'no-foo': { meta: { docs: { description: 'Description for no-foo.'} }, create(context) {} },
                },
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

    it('throws an error', async function () {
      await expect(
        // @ts-expect-error -- testing non-existent column type
        generate('.', { ruleListColumns: [COLUMN_TYPE.NAME, 'non-existent'] })
      ).rejects.toThrow('Invalid ruleListColumns option: non-existent');
    });
  });

  describe('duplicate column', function () {
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
                  'no-foo': { meta: { docs: { description: 'Description for no-foo.'} }, create(context) {} },
                },
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

    it('throws an error', async function () {
      await expect(
        generate('.', {
          ruleListColumns: [COLUMN_TYPE.NAME, COLUMN_TYPE.NAME],
        })
      ).rejects.toThrow('Duplicate value detected in ruleListColumns option.');
    });
  });

  describe('shows column and notice for requiresTypeChecking', function () {
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
                meta: { docs: { description: 'Description of no-foo.' }, },
                create(context) {}
              },
              'no-bar': {
                meta: { docs: { description: 'Description of no-bar.', requiresTypeChecking: true }, },
                create(context) {}
              },
            },
            configs: {
              all: {
                rules: {
                  'test/no-foo': 'error',
                }
              },
            }
          };`,

        'README.md':
          '<!-- begin auto-generated rules list --><!-- end auto-generated rules list -->',

        'docs/rules/no-foo.md': '',
        'docs/rules/no-bar.md': '',

        // Needed for some of the test infrastructure to work.
        node_modules: mockFs.load(PATH_NODE_MODULES),
      });
    });

    afterEach(function () {
      mockFs.restore();
      jest.resetModules();
    });

    it('updates the documentation', async function () {
      await generate('.');

      expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();
      expect(readFileSync('docs/rules/no-foo.md', 'utf8')).toMatchSnapshot();
      expect(readFileSync('docs/rules/no-bar.md', 'utf8')).toMatchSnapshot();
    });
  });
});
