import { generate } from '../../../lib/generator.js';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import {
  setupFixture,
  cleanupFixture,
  getFixturePath,
} from '../fixture-helper.js';

describe('generate (--url-configs)', function () {
  describe('basic', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('generate', 'option-url-configs', 'basic'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('includes the config link', async function () {
      await generate(tempDir, {
        urlConfigs: 'https://example.com/configs',
        configEmoji: [
          ['recommended', '🔥'],
          ['customConfig', '⭐'],
        ],
      });
      expect(readFileSync(join(tempDir, 'README.md'), 'utf8')).toMatchSnapshot();
      expect(readFileSync(join(tempDir, 'docs/rules/no-foo.md'), 'utf8')).toMatchSnapshot();
      expect(readFileSync(join(tempDir, 'docs/rules/no-bar.md'), 'utf8')).toMatchSnapshot();
    });
  });

  describe('with only recommended config', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('generate', 'option-url-configs', 'only-recommended'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('includes the config link', async function () {
      await generate(tempDir, {
        urlConfigs: 'https://example.com/configs',
      });
      expect(readFileSync(join(tempDir, 'README.md'), 'utf8')).toMatchSnapshot();
      expect(readFileSync(join(tempDir, 'docs/rules/no-foo.md'), 'utf8')).toMatchSnapshot();
    });
  });
});
