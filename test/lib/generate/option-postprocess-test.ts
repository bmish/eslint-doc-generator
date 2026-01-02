import { generate } from '../../../lib/generator.js';
import { join, relative } from 'node:path';
import { readFileSync } from 'node:fs';
import {
  setupFixture,
  cleanupFixture,
  getFixturePath,
} from '../fixture-helper.js';

describe('generate (postprocess option)', function () {
  let tempDir: string;

  beforeEach(function () {
    tempDir = setupFixture(getFixturePath('standard'));
  });

  afterEach(function () {
    cleanupFixture(tempDir);
  });

  it('calls the postprocessor', async function () {
    await generate(tempDir, {
      postprocess: (content, path) =>
        [
          content,
          '',
          `Located at ${relative(tempDir, path).replaceAll('\\', '/')}`, // Always use forward slashes in the path so the snapshot is right even when testing on Windows.
        ].join('\n'),
    });
    expect(readFileSync(join(tempDir, 'README.md'), 'utf8')).toMatchSnapshot();
    expect(readFileSync(join(tempDir, 'docs/rules/no-foo.md'), 'utf8')).toMatchSnapshot();
  });
});
