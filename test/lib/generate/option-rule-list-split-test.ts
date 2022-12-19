import { generate } from '../../../lib/generator.js';
import mockFs from 'mock-fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { jest } from '@jest/globals';

const __dirname = dirname(fileURLToPath(import.meta.url));

const PATH_NODE_MODULES = resolve(__dirname, '..', '..', '..', 'node_modules');

describe('generate (--rule-list-split)', function () {
  describe('by type', function () {
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
                  'no-foo': { meta: { type: 'problem' }, create(context) {} },
                  'no-bar': { meta: { type: 'suggestion' }, create(context) {} },
                  'no-baz': { meta: { type: 'suggestion' }, create(context) {} },
                  'no-biz': { meta: { /* no type */ }, create(context) {} },
                },
              };`,

        'README.md': '## Rules\n',

        'docs/rules/no-foo.md': '',
        'docs/rules/no-bar.md': '',
        'docs/rules/no-baz.md': '',
        'docs/rules/no-biz.md': '',

        // Needed for some of the test infrastructure to work.
        node_modules: mockFs.load(PATH_NODE_MODULES),
      });
    });

    afterEach(function () {
      mockFs.restore();
      jest.resetModules();
    });

    it('splits the list', async function () {
      await generate('.', {
        ruleListSplit: 'meta.type',
      });
      expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();
    });
  });

  describe('by nested property meta.docs.category', function () {
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
                  'no-foo': { meta: { docs: { category: 'fruits' } }, create(context) {} },
                  'no-bar': { meta: { docs: { category: 'candy' } }, create(context) {} },
                  'no-baz': { meta: { /* no nested object */ }, create(context) {} },
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

    it('splits the list', async function () {
      await generate('.', { ruleListSplit: 'meta.docs.category' });
      expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();
    });
  });

  describe('by property that no rules have', function () {
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
                  'no-foo': { meta: {  }, create(context) {} },
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
        generate('.', { ruleListSplit: 'non-existent-property' })
      ).rejects.toThrow(
        'No rules found with --rule-list-split property "non-existent-property".'
      );
    });
  });

  describe('with boolean (camelCase)', function () {
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
              'no-foo': { meta: { hasSuggestions: true }, create(context) {} },
              'no-bar': { meta: {  }, create(context) {} },
              'no-baz': { meta: { hasSuggestions: false }, create(context) {} },
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

    it('splits the list with the right header', async function () {
      await generate('.', {
        ruleListSplit: 'meta.hasSuggestions',
      });
      expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();
    });
  });

  describe('with boolean (snake_case)', function () {
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
              'no-foo': { meta: { hello_world: true }, create(context) {} },
              'no-bar': { meta: {  }, create(context) {} },
              'no-baz': { meta: { hello_world: false }, create(context) {} },
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

    it('splits the list with the right header', async function () {
      await generate('.', {
        ruleListSplit: 'meta.hello_world',
      });
      expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();
    });
  });

  describe('with boolean (PascalCase)', function () {
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
              'no-foo': { meta: { HelloWorld: true }, create(context) {} },
              'no-bar': { meta: {  }, create(context) {} },
              'no-baz': { meta: { HelloWorld: false }, create(context) {} },
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

    it('splits the list with the right header', async function () {
      await generate('.', {
        ruleListSplit: 'meta.HelloWorld',
      });
      expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();
    });
  });

  describe('with boolean (CONSTANT_CASE)', function () {
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
              'no-foo': { meta: { HELLO_WORLD: true }, create(context) {} },
              'no-bar': { meta: {  }, create(context) {} },
              'no-baz': { meta: { HELLO_WORLD: false }, create(context) {} },
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

    it('splits the list with the right header', async function () {
      await generate('.', {
        ruleListSplit: 'meta.HELLO_WORLD',
      });
      expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();
    });
  });

  describe('with boolean (unknown variable type)', function () {
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
              'no-foo': { 'foo_barBIZ-baz3bOz': false, meta: { }, create(context) {} },
              'no-bar': { 'foo_barBIZ-baz3bOz': true, meta: { }, create(context) {} },
            },
          };`,

        'README.md': '## Rules\n',

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

    it('splits the list and does the best it can with the header', async function () {
      await generate('.', {
        ruleListSplit: 'foo_barBIZ-baz3bOz',
      });
      expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();
    });
  });

  describe('with boolean (various boolean equivalent values)', function () {
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
              // true
              'noOn': { meta: { foo: 'on' }, create(context) {} },
              'noYes': { meta: { foo: 'yes' }, create(context) {} },
              'noTrueString': { meta: { foo: 'true' }, create(context) {} },
              'noTrue': { meta: { foo: true }, create(context) {} },

              // false
              'no': { meta: {  }, create(context) {} },
              'noUndefined': { meta: { foo: undefined }, create(context) {} },
              'noOff': { meta: { foo: 'off' }, create(context) {} },
              'noNo': { meta: { foo: 'no' }, create(context) {} },
              'noFalseString': { meta: { foo: 'false' }, create(context) {} },
              'noFalse': { meta: { foo: false }, create(context) {} },
              'noNull': { meta: { foo: null }, create(context) {} },
              'noEmptyString': { meta: { foo: '' }, create(context) {} },
            },
          };`,

        'README.md': '## Rules\n',

        // true
        'docs/rules/noOn.md': '',
        'docs/rules/noYes.md': '',
        'docs/rules/noTrueString.md': '',
        'docs/rules/noTrue.md': '',

        // false
        'docs/rules/no.md': '',
        'docs/rules/noUndefined.md': '',
        'docs/rules/noOff.md': '',
        'docs/rules/noNo.md': '',
        'docs/rules/noFalseString.md': '',
        'docs/rules/noFalse.md': '',
        'docs/rules/noNull.md': '',
        'docs/rules/noEmptyString.md': '',

        // Needed for some of the test infrastructure to work.
        node_modules: mockFs.load(PATH_NODE_MODULES),
      });
    });

    afterEach(function () {
      mockFs.restore();
      jest.resetModules();
    });

    it('splits the list', async function () {
      await generate('.', {
        ruleListSplit: 'meta.foo',
      });
      expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();
    });
  });

  describe('with no existing headers in file', function () {
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
                  'no-foo': { meta: { docs: { category: 'fruits' } }, create(context) {} },
                  'no-bar': { meta: { docs: { category: 'candy' } }, create(context) {} },
                  'no-baz': { meta: { /* no nested object */ }, create(context) {} },
                },
              };`,

        'README.md':
          '<!-- begin auto-generated rules list --><!-- end auto-generated rules list -->',

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

    it('uses the proper sub-list header level', async function () {
      await generate('.', { ruleListSplit: 'meta.docs.category' });
      expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();
    });
  });

  describe('with only a title in the rules file', function () {
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
                  'no-foo': { meta: { docs: { category: 'fruits' } }, create(context) {} },
                  'no-bar': { meta: { docs: { category: 'candy' } }, create(context) {} },
                  'no-baz': { meta: { /* no nested object */ }, create(context) {} },
                },
              };`,

        'README.md':
          '# Rules\n<!-- begin auto-generated rules list --><!-- end auto-generated rules list -->',

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

    it('uses the proper sub-list header level', async function () {
      await generate('.', { ruleListSplit: 'meta.docs.category' });
      expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();
    });
  });

  describe('ignores case when sorting headers', function () {
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
                  'no-foo': { meta: { foo: 'c' }, create(context) {} },
                  'no-bar': { meta: { foo: 'a' }, create(context) {} },
                  'no-baz': { meta: { foo: 'B' }, create(context) {} },
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

    it('splits the list', async function () {
      await generate('.', {
        ruleListSplit: 'meta.foo',
      });
      expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();
    });
  });

  describe('with one sub-list having no rules enabled by the config', function () {
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
                  'no-foo': { 'type': 'foo', meta: { }, create(context) {} },
                  'no-bar': { 'type': 'bar', meta: { }, create(context) {} },
                },
                configs: {
                  recommended: { rules: { 'test/no-foo': 'error' } },
                }
              };`,

        'README.md': '## Rules\n',

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

    it('splits the list and still uses recommended config emoji in both lists', async function () {
      await generate('.', {
        ruleListSplit: 'type',
      });
      expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();
    });
  });

  describe('multiple properties', function () {
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
              'no-foo': { meta: { deprecated: false, docs: { category: 'Hello' } }, create(context) {} },
              'no-bar': { meta: { deprecated: true, docs: { category: 'Should Not Show Since Deprecated' } }, create(context) {} },
              'no-baz': { meta: { deprecated: true, docs: { category: 'Should Not Show Since Deprecated' } }, create(context) {} },
              'no-biz': { meta: { deprecated: false, docs: { category: 'World' } }, create(context) {} },
            },
          };`,

        'README.md': '## Rules\n',

        'docs/rules/no-foo.md': '',
        'docs/rules/no-bar.md': '',
        'docs/rules/no-baz.md': '',
        'docs/rules/no-biz.md': '',

        // Needed for some of the test infrastructure to work.
        node_modules: mockFs.load(PATH_NODE_MODULES),
      });
    });

    afterEach(function () {
      mockFs.restore();
      jest.resetModules();
    });

    it('splits the list by multiple properties', async function () {
      await generate('.', {
        ruleListSplit: ['meta.deprecated', 'meta.docs.category'],
      });
      expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();
    });
  });

  describe('multiple properties and no rules left for second property (already shown for first property)', function () {
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
              'no-foo': { meta: { deprecated: true, docs: { category: 'Apples' } }, create(context) {} },
              'no-bar': { meta: { deprecated: true, docs: { category: 'Bananas' } }, create(context) {} },
            },
          };`,

        'README.md': '## Rules\n',

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

    it('does not show the property with no rules left and does not throw', async function () {
      await generate('.', {
        ruleListSplit: ['meta.deprecated', 'meta.docs.category'],
      });
      expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();
    });
  });

  describe('multiple properties and no rules could exist for second property', function () {
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
              'no-foo': { meta: { deprecated: true, }, create(context) {} },
              'no-bar': { meta: { deprecated: true, }, create(context) {} },
            },
          };`,

        'README.md': '## Rules\n',

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

    it('throws an error', async function () {
      await expect(
        generate('.', {
          ruleListSplit: ['meta.deprecated', 'non-existent-property'],
        })
      ).rejects.toThrow(
        'No rules found with --rule-list-split property "non-existent-property".'
      );
    });
  });
});
