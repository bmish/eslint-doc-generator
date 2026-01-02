import { generate } from '../../../lib/generator.js';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import { COLUMN_TYPE } from '../../../lib/types.js';
import {
  setupFixture,
  cleanupFixture,
  getFixturePath,
} from '../fixture-helper.js';

describe('generate (--rule-list-columns)', function () {
  describe('basic', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('generate', 'option-rule-list-columns', 'basic'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('shows the right columns and legend', async function () {
      await generate(tempDir, {
        ruleListColumns: [
          COLUMN_TYPE.HAS_SUGGESTIONS,
          COLUMN_TYPE.FIXABLE,
          COLUMN_TYPE.NAME,
        ],
      });
      expect(readFileSync(join(tempDir, 'README.md'), 'utf8')).toMatchSnapshot();
      expect(readFileSync(join(tempDir, 'docs/rules/no-foo.md'), 'utf8')).toMatchSnapshot();
    });
  });

  describe('consolidated fixableAndHasSuggestions column', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('generate', 'option-rule-list-columns', 'consolidated-fixable-and-has-suggestions'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('shows the right columns and legend', async function () {
      await generate(tempDir, {
        ruleListColumns: [
          COLUMN_TYPE.NAME,
          COLUMN_TYPE.FIXABLE_AND_HAS_SUGGESTIONS,
        ],
      });
      expect(readFileSync(join(tempDir, 'README.md'), 'utf8')).toMatchSnapshot();
    });
  });

  describe('non-existent column', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('generate', 'option-rule-list-columns', 'non-existent-column'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('throws an error', async function () {
      await expect(
        // @ts-expect-error -- testing non-existent column type
        generate(tempDir, { ruleListColumns: [COLUMN_TYPE.NAME, 'non-existent'] }),
      ).rejects.toThrow('Invalid ruleListColumns option: non-existent');
    });
  });

  describe('duplicate column', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('generate', 'option-rule-list-columns', 'duplicate-column'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('throws an error', async function () {
      await expect(
        generate(tempDir, {
          ruleListColumns: [COLUMN_TYPE.NAME, COLUMN_TYPE.NAME],
        }),
      ).rejects.toThrow('Duplicate value detected in ruleListColumns option.');
    });
  });

  describe('shows column and notice for requiresTypeChecking', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('generate', 'option-rule-list-columns', 'requires-type-checking'),
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
    });
  });
});
