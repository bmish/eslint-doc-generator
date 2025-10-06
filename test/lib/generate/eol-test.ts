import { generate } from '../../../lib/generator.js';
import mockFs from 'mock-fs';
import { jest } from '@jest/globals';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import { getEndOfLine } from '../../../lib/eol.js';
import { EOL } from 'node:os';

const __dirname = dirname(fileURLToPath(import.meta.url));

const PATH_NODE_MODULES = resolve(__dirname, '..', '..', '..', 'node_modules');

describe('getEndOfLine', function () {
  describe('with a ".editorconfig" file', function () {
    describe('returns the correct end of line when ".editorconfig" exists', function () {
      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });

      it('returns lf end of line when ".editorconfig" is configured with lf', async function () {
        mockFs({
          '.editorconfig': `
                  root = true
      
                  [*]
                  end_of_line = lf`,
        });

        expect(await getEndOfLine()).toStrictEqual('\n');
      });

      it('returns crlf end of line when ".editorconfig" is configured with crlf', async function () {
        mockFs({
          '.editorconfig': `
                root = true
    
                [*]
                end_of_line = crlf`,
        });

        expect(await getEndOfLine()).toStrictEqual('\r\n');
      });

      it('respects the .md specific end of line settings when ".editorconfig" is configured', async function () {
        mockFs({
          '.editorconfig': `
                  root = true
      
                  [*]
                  end_of_line = lf
                  
                  [*.md]
                  end_of_line = crlf`,
        });

        expect(await getEndOfLine()).toStrictEqual('\r\n');
      });
    });

    describe('generates using the correct end of line when ".editorconfig" exists', function () {
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

      it('generates using lf end of line from ".editorconfig"', async function () {
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

      it('generates using crlf end of line from ".editorconfig"', async function () {
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

      it('generates using the end of line from ".editorconfig" while respecting the .md specific end of line setting', async function () {
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

  describe('with a Prettier config', function () {
    describe('returns the correct end of line when ".prettierrc.json" exists', function () {
      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });

      it('returns lf end of line when ".prettierrc.json" is configured with lf', async function () {
        mockFs({
          '.prettierrc.json': `
                  {
                    "$schema": "https://json.schemastore.org/prettierrc",
                    "endOfLine": "lf"
                  }`,
        });

        expect(await getEndOfLine()).toStrictEqual('\n');
      });

      it('returns crlf end of line when ".prettierrc.json" is configured with crlf', async function () {
        mockFs({
          '.prettierrc.json': `
                  {
                    "$schema": "https://json.schemastore.org/prettierrc",
                    "endOfLine": "crlf"
                  }`,
        });

        expect(await getEndOfLine()).toStrictEqual('\r\n');
      });

      it('returns lf when ".prettierrc.json" is not configured', async function () {
        mockFs({
          '.prettierrc.json': `
                  {
                    "$schema": "https://json.schemastore.org/prettierrc"
                  }`,
        });

        expect(await getEndOfLine()).toStrictEqual('n');
      });
    });
  });

  describe('fallback', function () {
    it('handles fallback to to `EOL` from `node:os` when config files do not exist', async function () {
      expect(await getEndOfLine()).toStrictEqual(EOL);
    });
  });
});
