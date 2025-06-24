import { generate } from '../../../lib/generator.js';
import mockFs from 'mock-fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest';

const __dirname = dirname(fileURLToPath(import.meta.url));

const PATH_NODE_MODULES = resolve(__dirname, '..', '..', '..', 'node_modules');

describe('generate (--url-configs)', function () {
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
                },
                configs: {
                  recommended: {
                    rules: {
                      'test/no-foo': 'error',
                    }
                  },
                  customConfig: {
                    rules: {
                      'test/no-bar': 'error',
                    }
                  },
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
      vi.resetModules();
    });

    it('includes the config link', async function () {
      await generate('.', {
        urlConfigs: 'https://example.com/configs',
      });
      expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();
      expect(readFileSync('docs/rules/no-foo.md', 'utf8')).toMatchSnapshot();
      expect(readFileSync('docs/rules/no-bar.md', 'utf8')).toMatchSnapshot();
    });
  });

  describe('with only recommended config', function () {
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
      vi.resetModules();
    });

    it('includes the config link', async function () {
      await generate('.', {
        urlConfigs: 'https://example.com/configs',
      });
      expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();
      expect(readFileSync('docs/rules/no-foo.md', 'utf8')).toMatchSnapshot();
    });
  });
});
