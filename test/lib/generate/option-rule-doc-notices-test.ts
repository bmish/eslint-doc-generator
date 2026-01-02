import { generate } from '../../../lib/generator.js';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import { NOTICE_TYPE } from '../../../lib/types.js';
import {
  setupFixture,
  cleanupFixture,
  getFixturePath,
} from '../fixture-helper.js';

describe('generate (--rule-doc-notices)', function () {
  describe('basic', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('generate', 'option-rule-doc-notices', 'basic'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('shows the right rule doc notices', async function () {
      await generate(tempDir, {
        ruleDocNotices: [
          NOTICE_TYPE.HAS_SUGGESTIONS,
          NOTICE_TYPE.FIXABLE,
          NOTICE_TYPE.DEPRECATED,
          NOTICE_TYPE.DESCRIPTION,
          NOTICE_TYPE.TYPE,
        ], // Random values including all the optional notices.
      });
      expect(readFileSync(join(tempDir, 'README.md'), 'utf8')).toMatchSnapshot();
      expect(readFileSync(join(tempDir, 'docs/rules/no-foo.md'), 'utf8')).toMatchSnapshot();
    });
  });

  describe('non-existent notice', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('generate', 'option-rule-doc-notices', 'non-existent-notice'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('throws an error', async function () {
      await expect(
        generate(tempDir, {
          // @ts-expect-error -- testing non-existent notice type
          ruleDocNotices: [NOTICE_TYPE.FIXABLE, 'non-existent'],
        }),
      ).rejects.toThrow('Invalid ruleDocNotices option: non-existent');
    });
  });

  describe('duplicate notice', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('generate', 'option-rule-doc-notices', 'duplicate-notice'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('throws an error', async function () {
      await expect(
        generate(tempDir, {
          ruleDocNotices: [NOTICE_TYPE.FIXABLE, NOTICE_TYPE.FIXABLE],
        }),
      ).rejects.toThrow('Duplicate value detected in ruleDocNotices option.');
    });
  });

  describe('passing string instead of enum to simulate real-world usage where enum type is not available', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('generate', 'option-rule-doc-notices', 'string-instead-of-enum'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('has no issues', async function () {
      await expect(
        generate(tempDir, {
          ruleDocNotices: ['type'],
          ruleListColumns: ['name'],
        }),
      ).resolves.toBeUndefined();
    });
  });
});
