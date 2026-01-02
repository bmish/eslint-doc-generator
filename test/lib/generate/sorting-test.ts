import { generate } from '../../../lib/generator.js';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import {
  setupFixture,
  cleanupFixture,
  getFixturePath,
} from '../fixture-helper.js';

describe('generate (sorting)', function () {
  let tempDir: string;

  beforeEach(function () {
    tempDir = setupFixture(getFixturePath('sorting'));
  });

  afterEach(function () {
    cleanupFixture(tempDir);
  });

  it('sorts rules and configs case-insensitive', async function () {
    await generate(tempDir, {
      configEmoji: [
        ['a', '🅰️'],
        ['B', '🅱️'],
        ['c', '🌊'],
      ],
    });
    expect(readFileSync(join(tempDir, 'README.md'), 'utf8')).toMatchSnapshot();
    expect(readFileSync(join(tempDir, 'docs/rules/a.md'), 'utf8')).toMatchSnapshot();
    expect(readFileSync(join(tempDir, 'docs/rules/B.md'), 'utf8')).toMatchSnapshot();
    expect(readFileSync(join(tempDir, 'docs/rules/c.md'), 'utf8')).toMatchSnapshot();
  });
});
