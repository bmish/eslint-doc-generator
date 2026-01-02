import { generate } from '../../../lib/generator.js';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import {
  setupFixture,
  cleanupFixture,
  getFixturePath,
} from '../fixture-helper.js';

describe('generate (--rule-doc-title-format)', function () {
  describe('desc-parens-prefix-name', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('generate', 'option-rule-doc-title-format', 'desc-parens-prefix-name'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('uses the right rule doc title format, with fallback when missing description', async function () {
      await generate(tempDir, {
        ruleDocTitleFormat: 'desc-parens-prefix-name',
      });
      expect(readFileSync(join(tempDir, 'docs/rules/no-foo.md'), 'utf8')).toMatchSnapshot();
      expect(readFileSync(join(tempDir, 'docs/rules/no-bar.md'), 'utf8')).toMatchSnapshot();
    });
  });

  describe('desc-parens-name', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('generate', 'option-rule-doc-title-format', 'desc-parens-name'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('uses the right rule doc title format', async function () {
      await generate(tempDir, {
        ruleDocTitleFormat: 'desc-parens-name',
      });
      expect(readFileSync(join(tempDir, 'docs/rules/no-foo.md'), 'utf8')).toMatchSnapshot();
      expect(readFileSync(join(tempDir, 'docs/rules/no-bar.md'), 'utf8')).toMatchSnapshot();
    });
  });

  describe('desc', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('generate', 'option-rule-doc-title-format', 'desc'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('uses the right rule doc title format', async function () {
      await generate(tempDir, {
        ruleDocTitleFormat: 'desc',
      });
      expect(readFileSync(join(tempDir, 'docs/rules/no-foo.md'), 'utf8')).toMatchSnapshot();
      expect(readFileSync(join(tempDir, 'docs/rules/no-bar.md'), 'utf8')).toMatchSnapshot();
    });
  });

  describe('prefix-name', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('generate', 'option-rule-doc-title-format', 'prefix-name'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('uses the right rule doc title format', async function () {
      await generate(tempDir, {
        ruleDocTitleFormat: 'prefix-name',
      });
      expect(readFileSync(join(tempDir, 'docs/rules/no-foo.md'), 'utf8')).toMatchSnapshot();
    });
  });

  describe('name', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('generate', 'option-rule-doc-title-format', 'name'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('uses the right rule doc title format', async function () {
      await generate(tempDir, {
        ruleDocTitleFormat: 'name',
      });
      expect(readFileSync(join(tempDir, 'docs/rules/no-foo.md'), 'utf8')).toMatchSnapshot();
    });
  });
});
