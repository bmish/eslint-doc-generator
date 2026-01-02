import { generate } from '../../../lib/generator.js';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import {
  setupFixture,
  cleanupFixture,
  getFixturePath,
} from '../fixture-helper.js';

describe('generate (general)', function () {
  describe('basic', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('generate', 'general', 'basic'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('updates the documentation', async function () {
      await generate(tempDir);

      expect(readFileSync(join(tempDir, 'README.md'), 'utf8')).toMatchSnapshot();

      expect(readFileSync(join(tempDir, 'docs/rules/no-foo.md'), 'utf8')).toMatchSnapshot();
      expect(readFileSync(join(tempDir, 'docs/rules/no-bar.md'), 'utf8')).toMatchSnapshot();
      expect(readFileSync(join(tempDir, 'docs/rules/no-baz.md'), 'utf8')).toMatchSnapshot();
    });
  });

  describe('plugin prefix', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('generate', 'general', 'plugin-prefix'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('uses `plugin.meta.name` as source for rule prefix', async function () {
      await generate(tempDir);

      expect(readFileSync(join(tempDir, 'README.md'), 'utf8')).toMatchSnapshot();

      expect(readFileSync(join(tempDir, 'docs/rules/no-foo.md'), 'utf8')).toMatchSnapshot();
      expect(readFileSync(join(tempDir, 'docs/rules/no-bar.md'), 'utf8')).toMatchSnapshot();
      expect(readFileSync(join(tempDir, 'docs/rules/no-baz.md'), 'utf8')).toMatchSnapshot();
    });
  });
});
