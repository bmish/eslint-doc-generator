import { generate } from '../../../lib/generator.js';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import {
  setupFixture,
  cleanupFixture,
  getFixturePath,
} from '../fixture-helper.js';

describe('generate (rule metadata)', function () {
  describe('deprecated function-style rule', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('edge-cases', 'function-style-rule'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('generates the documentation', async function () {
      await generate(tempDir);
      expect(
        readFileSync(join(tempDir, 'README.md'), 'utf8'),
      ).toMatchSnapshot();
      expect(
        readFileSync(join(tempDir, 'docs/rules/no-foo.md'), 'utf8'),
      ).toMatchSnapshot();
    });
  });

  describe('deprecated function-style rule with deprecated/schema properties', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('edge-cases', 'function-style-rule-with-props'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('generates the documentation', async function () {
      await generate(tempDir, {
        // Ensure the relevant properties are shown for the test.
        ruleListColumns: ['name', 'deprecated', 'options'],
      });
      expect(
        readFileSync(join(tempDir, 'README.md'), 'utf8'),
      ).toMatchSnapshot();
      expect(
        readFileSync(join(tempDir, 'docs/rules/no-foo.md'), 'utf8'),
      ).toMatchSnapshot();
    });
  });

  describe('rule with no meta object', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(getFixturePath('edge-cases', 'no-meta'));
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('generates the documentation', async function () {
      await generate(tempDir);
      expect(
        readFileSync(join(tempDir, 'README.md'), 'utf8'),
      ).toMatchSnapshot();
      expect(
        readFileSync(join(tempDir, 'docs/rules/no-foo.md'), 'utf8'),
      ).toMatchSnapshot();
    });
  });
});
