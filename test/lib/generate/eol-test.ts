import { generate } from '../../../lib/generator.js';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import { getEndOfLine } from '../../../lib/eol.js';
import { EOL } from 'node:os';
import {
  setupFixture,
  cleanupFixture,
  getFixturePath,
} from '../fixture-helper.js';

describe('getEndOfLine', function () {
  describe('with a ".editorconfig" file', function () {
    describe('returns the correct end of line when ".editorconfig" exists', function () {
      let tempDir: string;
      let originalCwd: string;

      beforeEach(function () {
        originalCwd = process.cwd();
      });

      afterEach(function () {
        if (tempDir) {
          process.chdir(originalCwd);
          cleanupFixture(tempDir);
        }
      });

      it('returns lf end of line when ".editorconfig" is configured with lf', async function () {
        tempDir = setupFixture(getFixturePath('generate', 'eol', 'editorconfig-lf'));
        process.chdir(tempDir);
        expect(await getEndOfLine()).toStrictEqual('\n');
      });

      it('returns crlf end of line when ".editorconfig" is configured with crlf', async function () {
        tempDir = setupFixture(getFixturePath('generate', 'eol', 'editorconfig-crlf'));
        process.chdir(tempDir);
        expect(await getEndOfLine()).toStrictEqual('\r\n');
      });

      it('respects the .md specific end of line settings when ".editorconfig" is configured', async function () {
        tempDir = setupFixture(getFixturePath('generate', 'eol', 'editorconfig-md-specific'));
        process.chdir(tempDir);
        expect(await getEndOfLine()).toStrictEqual('\r\n');
      });
    });

    describe('generates using the correct end of line when ".editorconfig" exists', function () {
      let tempDir: string;

      afterEach(function () {
        if (tempDir) {
          cleanupFixture(tempDir);
        }
      });

      it('generates using lf end of line from ".editorconfig"', async function () {
        tempDir = setupFixture(getFixturePath('generate', 'eol', 'editorconfig-lf'));
        await generate(tempDir, {
          configEmoji: [
            ['a', '🅰️'],
            ['B', '🅱️'],
            ['c', '🌊'],
          ],
        });
        expect(readFileSync(join(tempDir, 'README.md'), 'utf8')).toMatchSnapshot();
        expect(readFileSync(join(tempDir, 'docs/rules/a.md'), 'utf8')).toMatchSnapshot();
        expect(readFileSync(join(tempDir, 'docs/rules/B.md'), 'utf8')).toMatchSnapshot();
        expect(readFileSync(join(tempDir, 'docs/rules/c.md'), 'utf8')).toMatchSnapshot();
      });

      it('generates using crlf end of line from ".editorconfig"', async function () {
        tempDir = setupFixture(getFixturePath('generate', 'eol', 'editorconfig-crlf'));
        await generate(tempDir, {
          configEmoji: [
            ['a', '🅰️'],
            ['B', '🅱️'],
            ['c', '🌊'],
          ],
        });
        expect(readFileSync(join(tempDir, 'README.md'), 'utf8')).toMatchSnapshot();
        expect(readFileSync(join(tempDir, 'docs/rules/a.md'), 'utf8')).toMatchSnapshot();
        expect(readFileSync(join(tempDir, 'docs/rules/B.md'), 'utf8')).toMatchSnapshot();
        expect(readFileSync(join(tempDir, 'docs/rules/c.md'), 'utf8')).toMatchSnapshot();
      });

      it('generates using the end of line from ".editorconfig" while respecting the .md specific end of line setting', async function () {
        tempDir = setupFixture(getFixturePath('generate', 'eol', 'editorconfig-md-specific'));
        await generate(tempDir, {
          configEmoji: [
            ['a', '🅰️'],
            ['B', '🅱️'],
            ['c', '🌊'],
          ],
        });
        expect(readFileSync(join(tempDir, 'README.md'), 'utf8')).toMatchSnapshot();
        expect(readFileSync(join(tempDir, 'docs/rules/a.md'), 'utf8')).toMatchSnapshot();
        expect(readFileSync(join(tempDir, 'docs/rules/B.md'), 'utf8')).toMatchSnapshot();
        expect(readFileSync(join(tempDir, 'docs/rules/c.md'), 'utf8')).toMatchSnapshot();
      });
    });
  });

  describe('with a Prettier config', function () {
    let tempDir: string;
    let originalCwd: string;

    beforeEach(function () {
      originalCwd = process.cwd();
    });

    afterEach(function () {
      if (tempDir) {
        process.chdir(originalCwd);
        cleanupFixture(tempDir);
      }
    });

    it('returns lf end of line when ".prettierrc.json" is configured with lf', async function () {
      tempDir = setupFixture(getFixturePath('generate', 'eol', 'prettier-lf'));
      process.chdir(tempDir);
      expect(await getEndOfLine()).toStrictEqual('\n');
    });

    it('returns crlf end of line when ".prettierrc.json" is configured with crlf', async function () {
      tempDir = setupFixture(getFixturePath('generate', 'eol', 'prettier-crlf'));
      process.chdir(tempDir);
      expect(await getEndOfLine()).toStrictEqual('\r\n');
    });

    it('returns lf when ".prettierrc.json" is not configured with the "endOfLine" option', async function () {
      tempDir = setupFixture(getFixturePath('generate', 'eol', 'prettier-no-eol'));
      process.chdir(tempDir);
      expect(await getEndOfLine()).toStrictEqual('\n');
    });
  });

  describe('fallback', function () {
    it('handles fallback to to `EOL` from `node:os` when config files do not exist', async function () {
      expect(await getEndOfLine()).toStrictEqual(EOL);
    });
  });
});
