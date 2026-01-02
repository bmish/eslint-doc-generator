import { generate } from '../../../lib/generator.js';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import {
  setupFixture,
  cleanupFixture,
  getFixturePath,
} from '../fixture-helper.js';

describe('generate (--rule-doc-title-format)', function () {
  let tempDir: string;

  beforeEach(function () {
    tempDir = setupFixture(getFixturePath('standard'));
  });

  afterEach(function () {
    cleanupFixture(tempDir);
  });

  it('uses desc-parens-prefix-name format, with fallback when missing description', async function () {
    await generate(tempDir, {
      ruleDocTitleFormat: 'desc-parens-prefix-name',
    });
    expect(readFileSync(join(tempDir, 'docs/rules/no-foo.md'), 'utf8')).toMatchSnapshot();
    expect(readFileSync(join(tempDir, 'docs/rules/no-bar.md'), 'utf8')).toMatchSnapshot();
  });

  it('uses desc-parens-name format', async function () {
    await generate(tempDir, {
      ruleDocTitleFormat: 'desc-parens-name',
    });
    expect(readFileSync(join(tempDir, 'docs/rules/no-foo.md'), 'utf8')).toMatchSnapshot();
    expect(readFileSync(join(tempDir, 'docs/rules/no-bar.md'), 'utf8')).toMatchSnapshot();
  });

  it('uses desc format', async function () {
    await generate(tempDir, {
      ruleDocTitleFormat: 'desc',
    });
    expect(readFileSync(join(tempDir, 'docs/rules/no-foo.md'), 'utf8')).toMatchSnapshot();
    expect(readFileSync(join(tempDir, 'docs/rules/no-bar.md'), 'utf8')).toMatchSnapshot();
  });

  it('uses prefix-name format', async function () {
    await generate(tempDir, {
      ruleDocTitleFormat: 'prefix-name',
    });
    expect(readFileSync(join(tempDir, 'docs/rules/no-foo.md'), 'utf8')).toMatchSnapshot();
  });

  it('uses name format', async function () {
    await generate(tempDir, {
      ruleDocTitleFormat: 'name',
    });
    expect(readFileSync(join(tempDir, 'docs/rules/no-foo.md'), 'utf8')).toMatchSnapshot();
  });
});
