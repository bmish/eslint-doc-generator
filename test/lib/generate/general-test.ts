import { generate } from '../../../lib/generator.js';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import {
  setupFixture,
  cleanupFixture,
  getFixturePath,
} from '../fixture-helper.js';

describe('generate (general)', function () {
  let tempDir: string;

  beforeEach(function () {
    tempDir = setupFixture(getFixturePath('standard'));
  });

  afterEach(function () {
    cleanupFixture(tempDir);
  });

  it('updates the documentation', async function () {
    await generate(tempDir);

    expect(readFileSync(join(tempDir, 'README.md'), 'utf8')).toMatchSnapshot();

    expect(
      readFileSync(join(tempDir, 'docs/rules/no-foo.md'), 'utf8'),
    ).toMatchSnapshot();
    expect(
      readFileSync(join(tempDir, 'docs/rules/no-bar.md'), 'utf8'),
    ).toMatchSnapshot();
    expect(
      readFileSync(join(tempDir, 'docs/rules/no-baz.md'), 'utf8'),
    ).toMatchSnapshot();
  });

  describe('plugin prefix', function () {
    let tempDirPrefix: string;

    beforeEach(function () {
      tempDirPrefix = setupFixture(getFixturePath('plugin-prefix'));
    });

    afterEach(function () {
      cleanupFixture(tempDirPrefix);
    });

    it('uses `plugin.meta.name` as source for rule prefix', async function () {
      await generate(tempDirPrefix);

      expect(
        readFileSync(join(tempDirPrefix, 'README.md'), 'utf8'),
      ).toMatchSnapshot();

      expect(
        readFileSync(join(tempDirPrefix, 'docs/rules/no-foo.md'), 'utf8'),
      ).toMatchSnapshot();
      expect(
        readFileSync(join(tempDirPrefix, 'docs/rules/no-bar.md'), 'utf8'),
      ).toMatchSnapshot();
      expect(
        readFileSync(join(tempDirPrefix, 'docs/rules/no-baz.md'), 'utf8'),
      ).toMatchSnapshot();
    });
  });
});
