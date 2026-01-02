import { generate } from '../../../lib/generator.js';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import { COLUMN_TYPE } from '../../../lib/types.js';
import {
  setupFixture,
  cleanupFixture,
  getFixturePath,
} from '../fixture-helper.js';

describe('generate (rule type)', function () {
  let tempDir: string;

  beforeEach(function () {
    tempDir = setupFixture(getFixturePath('standard-types'));
  });

  afterEach(function () {
    cleanupFixture(tempDir);
  });

  it('hides the type column when not enabled', async function () {
    await generate(tempDir);
    expect(readFileSync(join(tempDir, 'README.md'), 'utf8')).toMatchSnapshot();
    expect(
      readFileSync(join(tempDir, 'docs/rules/no-foo.md'), 'utf8'),
    ).toMatchSnapshot();
  });

  it('displays the type when type column is enabled', async function () {
    await generate(tempDir, {
      ruleListColumns: [COLUMN_TYPE.NAME, COLUMN_TYPE.TYPE],
    });
    expect(readFileSync(join(tempDir, 'README.md'), 'utf8')).toMatchSnapshot();
    expect(
      readFileSync(join(tempDir, 'docs/rules/no-foo.md'), 'utf8'),
    ).toMatchSnapshot();
    expect(
      readFileSync(join(tempDir, 'docs/rules/no-bar.md'), 'utf8'),
    ).toMatchSnapshot();
    expect(
      readFileSync(join(tempDir, 'docs/rules/no-biz.md'), 'utf8'),
    ).toMatchSnapshot();
    expect(
      readFileSync(join(tempDir, 'docs/rules/no-boz.md'), 'utf8'),
    ).toMatchSnapshot();
    expect(
      readFileSync(join(tempDir, 'docs/rules/no-buz.md'), 'utf8'),
    ).toMatchSnapshot();
  });

  it('hides the type column when only unknown types exist', async function () {
    // Create a temp fixture with only unknown type
    const tempDirUnknown = setupFixture(getFixturePath('standard-types'));
    // Modify the fixture to have only unknown type
    const { writeFileSync } = await import('node:fs');
    writeFileSync(
      join(tempDirUnknown, 'index.js'),
      `export default {
  rules: {
    'no-foo': { meta: { docs: { description: 'Description.' }, type: 'unknown' }, create(context) {} },
  },
};`,
    );
    await generate(tempDirUnknown, {
      ruleListColumns: [COLUMN_TYPE.NAME, COLUMN_TYPE.TYPE],
    });
    expect(
      readFileSync(join(tempDirUnknown, 'README.md'), 'utf8'),
    ).toMatchSnapshot();
    expect(
      readFileSync(join(tempDirUnknown, 'docs/rules/no-foo.md'), 'utf8'),
    ).toMatchSnapshot();
    cleanupFixture(tempDirUnknown);
  });
});
