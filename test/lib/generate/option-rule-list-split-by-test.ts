import { generate } from '../../../lib/generator.js';
import mockFs from 'mock-fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { jest } from '@jest/globals';

const __dirname = dirname(fileURLToPath(import.meta.url));

const PATH_NODE_MODULES = resolve(__dirname, '..', '..', '..', 'node_modules');

describe('generate (--split-by)', function () {
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
        splitBy: 'meta.type',
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
      await generate('.', { splitBy: 'meta.docs.category' });
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
        generate('.', { splitBy: 'non-existent-property' })
      ).rejects.toThrow(
        'No rules found with --split-by property "non-existent-property".'
      );
    });
  });

  describe('with boolean', function () {
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

    it('splits the list', async function () {
      await generate('.', {
        splitBy: 'meta.hasSuggestions',
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
      await generate('.', { splitBy: 'meta.docs.category' });
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
      await generate('.', { splitBy: 'meta.docs.category' });
      expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();
    });
  });

  describe('ignores case', function () {
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
        splitBy: 'meta.foo',
      });
      expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();
    });
  });

  describe('with unknown variable type', function () {
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

    it('splits the list but does not attempt to convert variable name to title', async function () {
      await generate('.', {
        splitBy: 'foo_barBIZ-baz3bOz',
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
        splitBy: 'type',
      });
      expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();
    });
  });
});
