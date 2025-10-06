import { getEndOfLine } from '../../../lib/eol.js';
import { generate } from '../../../lib/generator.js';
import mockFs from 'mock-fs';
import { jest } from '@jest/globals';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { readFileSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const PATH_NODE_MODULES = resolve(__dirname, '..', '..', '..', 'node_modules');

describe('string (getEndOfLine)', function () {
  describe('returns the correct end of line when .editorconfig exists', function () {
    afterEach(function () {
      mockFs.restore();
      jest.resetModules();
    });

    it('returns lf end of line when .editorconfig is configured with lf', function () {
      mockFs({
        '.editorconfig': `
                  root = true
      
                  [*]
                  end_of_line = lf`,
      });

      expect(getEndOfLine()).toStrictEqual('\n');
    });

    it('returns crlf end of line when .editorconfig is configured with crlf', function () {
      mockFs({
        '.editorconfig': `
                root = true
    
                [*]
                end_of_line = crlf`,
      });

      expect(getEndOfLine()).toStrictEqual('\r\n');
    });

    it('respects the .md specific end of line settings when .editorconfig is configured', function () {
      mockFs({
        '.editorconfig': `
                  root = true
      
                  [*]
                  end_of_line = lf
                  
                  [*.md]
                  end_of_line = crlf`,
      });

      expect(getEndOfLine()).toStrictEqual('\r\n');
    });
  });

  describe('generates using the correct end of line when .editorconfig exists', function () {
    const pluginFsMock = {
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

      'docs/rules/a.md': '',
      'docs/rules/B.md': '',
      'docs/rules/c.md': '',

      // Needed for some of the test infrastructure to work.
      node_modules: mockFs.load(PATH_NODE_MODULES),
    };

    afterEach(function () {
      mockFs.restore();
      jest.resetModules();
    });

    it('generates using lf end of line from .editorconfig', async function () {
      mockFs({
        ...pluginFsMock,
        'README.md': '## Rules\n',
        '.editorconfig': `
                  root = true
      
                  [*]
                  end_of_line = lf`,
      });
      await generate('.');
      expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();
      expect(readFileSync('docs/rules/a.md', 'utf8')).toMatchSnapshot();
      expect(readFileSync('docs/rules/B.md', 'utf8')).toMatchSnapshot();
      expect(readFileSync('docs/rules/c.md', 'utf8')).toMatchSnapshot();
    });

    it('generates using crlf end of line from .editorconfig', async function () {
      mockFs({
        ...pluginFsMock,
        'README.md': '## Rules\r\n',
        '.editorconfig': `
                  root = true
      
                  [*]
                  end_of_line = crlf`,
      });

      await generate('.');
      expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();
      expect(readFileSync('docs/rules/a.md', 'utf8')).toMatchSnapshot();
      expect(readFileSync('docs/rules/B.md', 'utf8')).toMatchSnapshot();
      expect(readFileSync('docs/rules/c.md', 'utf8')).toMatchSnapshot();
    });

    it('generates using the end of line from .editorconfig while respecting the .md specific end of line setting', async function () {
      mockFs({
        ...pluginFsMock,
        'README.md': '## Rules\r\n',
        '.editorconfig': `
                  root = true
      
                  [*]
                  end_of_line = lf
                  
                  [*.md]
                  end_of_line = crlf`,
      });
      await generate('.');
      expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();
      expect(readFileSync('docs/rules/a.md', 'utf8')).toMatchSnapshot();
      expect(readFileSync('docs/rules/B.md', 'utf8')).toMatchSnapshot();
      expect(readFileSync('docs/rules/c.md', 'utf8')).toMatchSnapshot();
    });
  });
});
