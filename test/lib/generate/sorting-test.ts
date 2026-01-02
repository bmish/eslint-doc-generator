import { generate } from '../../../lib/generator.js';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import {
  setupFixture,
  cleanupFixture,
  getFixturePath,
} from '../fixture-helper.js';

describe('generate (sorting)', function () {
  describe('sorting rules and configs case-insensitive', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('generate', 'sorting', 'case-insensitive'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('sorts correctly', async function () {
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
