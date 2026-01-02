import { generate } from '../../../lib/generator.js';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import {
  setupFixture,
  cleanupFixture,
  getFixturePath,
} from '../fixture-helper.js';

describe('generate (--config-format)', function () {
  let tempDir: string;

  beforeEach(function () {
    tempDir = setupFixture(getFixturePath('standard'));
  });

  afterEach(function () {
    cleanupFixture(tempDir);
  });

  it('uses the name format', async function () {
    await generate(tempDir, {
      configFormat: 'name',
    });
    expect(readFileSync(join(tempDir, 'README.md'), 'utf8')).toMatchSnapshot();
    expect(
      readFileSync(join(tempDir, 'docs/rules/no-foo.md'), 'utf8'),
    ).toMatchSnapshot();
  });

  it('uses the plugin-colon-prefix-name format', async function () {
    await generate(tempDir, {
      configFormat: 'plugin-colon-prefix-name',
    });
    expect(readFileSync(join(tempDir, 'README.md'), 'utf8')).toMatchSnapshot();
    expect(
      readFileSync(join(tempDir, 'docs/rules/no-foo.md'), 'utf8'),
    ).toMatchSnapshot();
  });

  it('uses the prefix-name format', async function () {
    await generate(tempDir, {
      configFormat: 'prefix-name',
    });
    expect(readFileSync(join(tempDir, 'README.md'), 'utf8')).toMatchSnapshot();
    expect(
      readFileSync(join(tempDir, 'docs/rules/no-foo.md'), 'utf8'),
    ).toMatchSnapshot();
  });
});
