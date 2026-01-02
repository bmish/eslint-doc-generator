import { generate } from '../../../lib/generator.js';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import {
  setupFixture,
  cleanupFixture,
  getFixturePath,
} from '../fixture-helper.js';

describe('generate (--config-format)', function () {
  describe('name', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('generate', 'option-config-format', 'name'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('uses the right format', async function () {
      await generate(tempDir, {
        configFormat: 'name',
      });
      expect(readFileSync(join(tempDir, 'README.md'), 'utf8')).toMatchSnapshot();
      expect(readFileSync(join(tempDir, 'docs/rules/no-foo.md'), 'utf8')).toMatchSnapshot();
    });
  });

  describe('plugin-colon-prefix-name', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('generate', 'option-config-format', 'plugin-colon-prefix-name'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('uses the right format', async function () {
      await generate(tempDir, {
        configFormat: 'plugin-colon-prefix-name',
      });
      expect(readFileSync(join(tempDir, 'README.md'), 'utf8')).toMatchSnapshot();
      expect(readFileSync(join(tempDir, 'docs/rules/no-foo.md'), 'utf8')).toMatchSnapshot();
    });
  });

  describe('prefix-name', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('generate', 'option-config-format', 'prefix-name'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('uses the right format', async function () {
      await generate(tempDir, {
        configFormat: 'prefix-name',
      });
      expect(readFileSync(join(tempDir, 'README.md'), 'utf8')).toMatchSnapshot();
      expect(readFileSync(join(tempDir, 'docs/rules/no-foo.md'), 'utf8')).toMatchSnapshot();
    });
  });
});
