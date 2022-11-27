import { generate } from '../../../lib/generator.js';
import mockFs from 'mock-fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { jest } from '@jest/globals';
import { EMOJI_CONFIG_ERROR } from '../../../lib/emojis.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const PATH_NODE_MODULES = resolve(__dirname, '..', '..', '..', 'node_modules');

describe('generate (--config-emoji)', function () {
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
                  'no-foo': { meta: { docs: { description: 'Description for no-foo.'} }, create(context) {} },
                  'no-bar': { meta: { docs: { description: 'Description for no-bar.'} }, create(context) {} },
                  'no-baz': { meta: { docs: { description: 'Description for no-boz.'} }, create(context) {} },
                },
                configs: {
                  recommended: {
                    rules: { 'test/no-foo': 'error', 'test/no-bar': 'error' },
                  },
                  stylistic: {
                    rules: { 'test/no-bar': 'error', 'test/no-baz': 'error' },
                  },
                  configWithoutEmoji: {
                    rules: { 'test/no-baz': 'error' },
                  }
                }
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

    it('shows the correct emojis', async function () {
      await generate('.', {
        configEmoji: [
          ['recommended', '🔥'],
          ['stylistic', '🎨'],
        ],
      });
      expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();
      expect(readFileSync('docs/rules/no-foo.md', 'utf8')).toMatchSnapshot();
      expect(readFileSync('docs/rules/no-bar.md', 'utf8')).toMatchSnapshot();
      expect(readFileSync('docs/rules/no-baz.md', 'utf8')).toMatchSnapshot();
    });
  });

  describe('invalid format', function () {
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
        generate('.', { configEmoji: [['foo', 'bar', 'baz']] })
      ).rejects.toThrow(
        'Invalid configEmoji option: foo,bar,baz. Expected format: config,emoji'
      );
    });
  });

  describe('trying to remove a default emoji that does not exist', function () {
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
        generate('.', { configEmoji: [['config-without-default-emoji']] })
      ).rejects.toThrow(
        'Invalid configEmoji option: config-without-default-emoji. Expected format: config,emoji'
      );
    });
  });

  describe('removing default emoji for a config', function () {
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
                configs: {
                  recommended: { rules: { 'test/no-foo': 'error' } },
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

    it('reverts to using a badge for the config', async function () {
      await generate('.', {
        configEmoji: [['recommended']],
      });
      expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();
      expect(readFileSync('docs/rules/no-foo.md', 'utf8')).toMatchSnapshot();
    });
  });

  describe('non-existent config', function () {
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
                configs: {}
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
        generate('.', { configEmoji: [['config-does-not-exist', '🔥']] })
      ).rejects.toThrow(
        'Invalid configEmoji option: config-does-not-exist config not found.'
      );
    });
  });

  describe('using a reserved emoji', function () {
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
                configs: {
                  recommended: { rules: { 'test/no-foo': 'error' } },
                  style: { rules: { 'test/no-foo': 'error' } },
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

    it('throws an error', async function () {
      await expect(
        generate('.', { configEmoji: [['recommended', EMOJI_CONFIG_ERROR]] })
      ).rejects.toThrow(`Cannot specify reserved emoji ${EMOJI_CONFIG_ERROR}.`);
    });
  });

  describe('duplicate config name', function () {
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
                configs: {
                  recommended: { rules: { 'test/no-foo': 'error' } },
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

    it('throws an error', async function () {
      await expect(
        generate('.', {
          configEmoji: [
            ['recommended', '🔥'],
            ['recommended', '😋'],
          ],
        })
      ).rejects.toThrow(
        'Duplicate config name in configEmoji options: recommended'
      );
    });
  });

  describe('with one config that does not have emoji', function () {
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
            configs: {
              configWithoutEmoji: { rules: { 'test/no-foo': 'error' } },
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

    it('shows the default config emoji', async function () {
      await generate('.');
      expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();
      expect(readFileSync('docs/rules/no-foo.md', 'utf8')).toMatchSnapshot();
    });
  });
});
