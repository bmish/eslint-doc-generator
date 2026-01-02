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
  let tempDir: string;

  beforeEach(function () {
    tempDir = setupFixture(getFixturePath('standard'));
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
    expect(
      readFileSync(join(tempDir, 'docs/rules/no-foo.md'), 'utf8'),
    ).toMatchSnapshot();
  });

  it('shows consolidated fixableAndHasSuggestions column', async function () {
    await generate(tempDir, {
      ruleListColumns: [
        COLUMN_TYPE.NAME,
        COLUMN_TYPE.FIXABLE_AND_HAS_SUGGESTIONS,
      ],
    });
    expect(readFileSync(join(tempDir, 'README.md'), 'utf8')).toMatchSnapshot();
  });

  it('throws an error for non-existent column', async function () {
    await expect(
      // @ts-expect-error -- testing non-existent column type
      generate(tempDir, {
        ruleListColumns: [COLUMN_TYPE.NAME, 'non-existent'],
      }),
    ).rejects.toThrow('Invalid ruleListColumns option: non-existent');
  });

  it('throws an error for duplicate column', async function () {
    await expect(
      generate(tempDir, {
        ruleListColumns: [COLUMN_TYPE.NAME, COLUMN_TYPE.NAME],
      }),
    ).rejects.toThrow('Duplicate value detected in ruleListColumns option.');
  });

  it('shows column and notice for requiresTypeChecking', async function () {
    await generate(tempDir);

    expect(readFileSync(join(tempDir, 'README.md'), 'utf8')).toMatchSnapshot();
    expect(
      readFileSync(join(tempDir, 'docs/rules/no-foo.md'), 'utf8'),
    ).toMatchSnapshot();
    expect(
      readFileSync(join(tempDir, 'docs/rules/no-bar.md'), 'utf8'),
    ).toMatchSnapshot();
  });
});
