import { generate } from '../../../lib/generator.js';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import {
  setupFixture,
  cleanupFixture,
  getFixturePath,
} from '../fixture-helper.js';

describe('generate (rule descriptions)', function () {
  describe('rule with long-enough description to require name column wrapping avoidance', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('generate', 'rule-description', 'long-description-name-column-wrapping'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('adds spaces to the name column', async function () {
      await generate(tempDir);
      expect(readFileSync(join(tempDir, 'README.md'), 'utf8')).toMatchSnapshot();
      expect(readFileSync(join(tempDir, 'docs/rules/no-foo.md'), 'utf8')).toMatchSnapshot();
    });
  });

  describe('rule with long-enough description to require name column wrapping avoidance but rule name too short', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('generate', 'rule-description', 'long-description-name-column-wrapping-short-name'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('does not add spaces to name column', async function () {
      await generate(tempDir);
      expect(readFileSync(join(tempDir, 'README.md'), 'utf8')).toMatchSnapshot();
      expect(readFileSync(join(tempDir, 'docs/rules/foo.md'), 'utf8')).toMatchSnapshot();
    });
  });

  describe('Rule description needs to be formatted', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('generate', 'rule-description', 'rule-description-formatting'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('capitalizes the first letter and removes the trailing period from the description', async function () {
      await generate(tempDir);
      expect(readFileSync(join(tempDir, 'docs/rules/no-foo.md'), 'utf8')).toMatchSnapshot();
    });
  });

  describe('no rules with description', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('generate', 'rule-description', 'no-rules-with-description'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('generates the documentation', async function () {
      await generate(tempDir);
      expect(readFileSync(join(tempDir, 'README.md'), 'utf8')).toMatchSnapshot();
      expect(readFileSync(join(tempDir, 'docs/rules/no-foo.md'), 'utf8')).toMatchSnapshot();
    });
  });

  describe('one rule missing description', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('generate', 'rule-description', 'one-rule-missing-description'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('generates the documentation', async function () {
      await generate(tempDir);
      expect(readFileSync(join(tempDir, 'README.md'), 'utf8')).toMatchSnapshot();
      expect(readFileSync(join(tempDir, 'docs/rules/no-foo.md'), 'utf8')).toMatchSnapshot();
      expect(readFileSync(join(tempDir, 'docs/rules/no-bar.md'), 'utf8')).toMatchSnapshot();
    });
  });

  describe('with rule description that needs to be escaped in table', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('generate', 'rule-description', 'rule-description-escaped-in-table'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('generates the documentation', async function () {
      await generate(tempDir);
      expect(readFileSync(join(tempDir, 'README.md'), 'utf8')).toMatchSnapshot();
    });
  });
});
