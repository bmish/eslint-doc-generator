import { generate } from '../../../lib/generator.js';
import mockFs from 'mock-fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { jest } from '@jest/globals';

const __dirname = dirname(fileURLToPath(import.meta.url));

const PATH_NODE_MODULES = resolve(__dirname, '..', '..', '..', 'node_modules');

describe('generate (sorting)', function () {
  describe('sorting rules and configs case-insensitive', function () {
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
              'c': { meta: { docs: {} }, create(context) {} },
              'a': { meta: { docs: {} }, create(context) {} },
              'B': { meta: { docs: {} }, create(context) {} },
            },
            configs: {
              'c': { rules: { 'test/a': 'error', } },
              'a': { rules: { 'test/a': 'error', } },
              'B': { rules: { 'test/a': 'error', } },
            }
          };`,

        'README.md': '## Rules\n',

        'docs/rules/a.md': '',
        'docs/rules/B.md': '',
        'docs/rules/c.md': '',

        // Needed for some of the test infrastructure to work.
        node_modules: mockFs.load(PATH_NODE_MODULES),
      });
    });

    afterEach(function () {
      mockFs.restore();
      jest.resetModules();
    });

    it('sorts correctly', async function () {
      await generate('.');
      expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();
      expect(readFileSync('docs/rules/a.md', 'utf8')).toMatchSnapshot();
      expect(readFileSync('docs/rules/B.md', 'utf8')).toMatchSnapshot();
      expect(readFileSync('docs/rules/c.md', 'utf8')).toMatchSnapshot();
    });
  });
});
