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
              'no-bar': {
                meta: { schema: [{ type: 'object', properties: { option1: {} } }] },
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

    describe('when initRuleDocs is false', () => {
      it('throws an error', async function () {
        // Use join to handle both Windows and Unix paths.
        await expect(generate('.')).rejects.toThrow(
          `Could not find rule doc (run with --init-rule-docs to create): ${join(
            'docs',
            'rules',
            'no-bar.md'
          )}`
        );
      });
    });

    describe('when initRuleDocs is true', () => {
      it('creates the rule doc', async function () {
        await generate('.', { initRuleDocs: true });
        expect(readFileSync('docs/rules/no-foo.md', 'utf8')).toMatchSnapshot();
        expect(readFileSync('docs/rules/no-bar.md', 'utf8')).toMatchSnapshot(); // Should add options section.
      });
    });
  });

  describe('missing rule doc, initRuleDocs is true, and with ruleDocSectionInclude', function () {
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
              'no-bar': {
                meta: { schema: [{ type: 'object', properties: { option1: {} } }] },
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

    it('creates the rule doc including the mandatory section', async function () {
      await generate('.', {
        initRuleDocs: true,
        ruleDocSectionInclude: ['Examples'],
      });
      expect(readFileSync('docs/rules/no-foo.md', 'utf8')).toMatchSnapshot();
      expect(readFileSync('docs/rules/no-bar.md', 'utf8')).toMatchSnapshot(); // Should add options section.
    });
  });

  describe('no missing rule doc but --init-rule-docs enabled', function () {
    beforeEach(function () {
      mockFs({
        'docs/rules/no-foo.md': '',

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
      await expect(generate('.', { initRuleDocs: true })).rejects.toThrow(
        '--init-rule-docs was enabled, but no rule doc file needed to be created.'
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
        pathRuleDoc: join('rules', '{name}', '{name}.md'),
        pathRuleList: join('rules', 'list.md'),
      });
      expect(readFileSync('rules/list.md', 'utf8')).toMatchSnapshot();
      expect(readFileSync('rules/no-foo/no-foo.md', 'utf8')).toMatchSnapshot();
    });

    it('generates the documentation using a function for pathRuleDoc', async function () {
      await generate('.', {
        pathRuleDoc: (ruleName) => join('rules', ruleName, `${ruleName}.md`),
        pathRuleList: join('rules', 'list.md'),
      });
      expect(readFileSync('rules/list.md', 'utf8')).toMatchSnapshot();
      expect(readFileSync('rules/no-foo/no-foo.md', 'utf8')).toMatchSnapshot();
    });
  });

  describe('multiple rules lists', function () {
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

        'README.md':
          '<!-- begin auto-generated rules list --><!-- end auto-generated rules list -->',
        'rules/list.md':
          '<!-- begin auto-generated rules list --><!-- end auto-generated rules list -->',
        'docs/rules/index.md':
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
      await generate('.', {
        pathRuleList: [
          'README.md',
          join('rules', 'list.md'),
          join('docs', 'rules', 'index.md'),
        ],
      });
      expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();
      expect(readFileSync('rules/list.md', 'utf8')).toMatchSnapshot();
      expect(readFileSync('docs/rules/index.md', 'utf8')).toMatchSnapshot();
    });
  });

  describe('multiple rules lists but incorrectly using CSV string for option', function () {
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

        'README.md':
          '<!-- begin auto-generated rules list --><!-- end auto-generated rules list -->',
        'rules/list.md':
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

    it('throws an error', async function () {
      await expect(
        generate('.', {
          pathRuleList: `README.md,${join('rules', 'list.md')}`,
        })
      ).rejects.toThrow(
        `Provide property as array, not a CSV string: README.md,${join(
          'rules',
          'list.md'
        )}`
      );

      await expect(
        generate('.', {
          pathRuleList: [`README.md,${join('rules', 'list.md')}`],
        })
      ).rejects.toThrow(
        `Provide property as array, not a CSV string: README.md,${join(
          'rules',
          'list.md'
        )}`
      );
    });
  });

  describe('empty array of rule lists (happens when CLI option is not passed)', function () {
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

        'README.md':
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

    it('falls back to default rules list', async function () {
      await generate('.', {
        pathRuleList: [],
      });
      expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();
    });
  });
});
