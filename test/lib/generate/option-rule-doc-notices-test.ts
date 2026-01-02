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
  let tempDir: string;

  beforeEach(function () {
    tempDir = setupFixture(getFixturePath('standard'));
  });

  afterEach(function () {
    cleanupFixture(tempDir);
  });

  it('shows the right rule doc notices', async function () {
    await generate(tempDir, {
      ruleDocNotices: [
        NOTICE_TYPE.HAS_SUGGESTIONS,
        NOTICE_TYPE.FIXABLE,
        NOTICE_TYPE.DESCRIPTION,
        NOTICE_TYPE.TYPE,
      ],
    });
    expect(readFileSync(join(tempDir, 'README.md'), 'utf8')).toMatchSnapshot();
    expect(
      readFileSync(join(tempDir, 'docs/rules/no-foo.md'), 'utf8'),
    ).toMatchSnapshot();
  });

  it('throws an error for non-existent notice', async function () {
    await expect(
      generate(tempDir, {
        // @ts-expect-error -- testing non-existent notice type
        ruleDocNotices: [NOTICE_TYPE.FIXABLE, 'non-existent'],
      }),
    ).rejects.toThrow('Invalid ruleDocNotices option: non-existent');
  });

  it('throws an error for duplicate notice', async function () {
    await expect(
      generate(tempDir, {
        ruleDocNotices: [NOTICE_TYPE.FIXABLE, NOTICE_TYPE.FIXABLE],
      }),
    ).rejects.toThrow('Duplicate value detected in ruleDocNotices option.');
  });

  it('accepts string instead of enum', async function () {
    await expect(
      generate(tempDir, {
        ruleDocNotices: ['type'],
        ruleListColumns: ['name'],
      }),
    ).resolves.toBeUndefined();
  });
});
