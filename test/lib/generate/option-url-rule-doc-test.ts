import { generate } from '../../../lib/generator.js';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import {
  setupFixture,
  cleanupFixture,
  getFixturePath,
} from '../fixture-helper.js';

describe('generate (--url-rule-doc)', function () {
  let tempDir: string;

  beforeEach(function () {
    tempDir = setupFixture(getFixturePath('standard'));
  });

  afterEach(function () {
    cleanupFixture(tempDir);
  });

  it('uses the right URLs', async function () {
    await generate(tempDir, {
      urlRuleDoc: 'https://example.com/rule-docs/{name}/',
    });
    expect(readFileSync(join(tempDir, 'README.md'), 'utf8')).toMatchSnapshot();
    expect(
      readFileSync(join(tempDir, 'docs/rules/no-foo.md'), 'utf8'),
    ).toMatchSnapshot();
    expect(
      readFileSync(join(tempDir, 'docs/rules/no-bar.md'), 'utf8'),
    ).toMatchSnapshot();
  });

  describe('function cases', function () {
    let tempDirFunc: string;

    beforeEach(function () {
      tempDirFunc = setupFixture(getFixturePath('edge-cases', 'function'));
    });

    afterEach(function () {
      cleanupFixture(tempDirFunc);
    });

    it('uses the custom URL with function', async function () {
      await generate(tempDirFunc, {
        pathRuleList: ['README.md', 'nested/README.md'],
        urlRuleDoc(name, path) {
          return `https://example.com/rule-docs/name:${name}/path:${path}`;
        },
      });
      expect(
        readFileSync(join(tempDirFunc, 'README.md'), 'utf8'),
      ).toMatchSnapshot();
      expect(
        readFileSync(join(tempDirFunc, 'nested/README.md'), 'utf8'),
      ).toMatchSnapshot();
      expect(
        readFileSync(join(tempDirFunc, 'docs/rules/no-foo.md'), 'utf8'),
      ).toMatchSnapshot();
      expect(
        readFileSync(join(tempDirFunc, 'docs/rules/no-bar.md'), 'utf8'),
      ).toMatchSnapshot();
    });

    it('should fallback to the normal URL when function returns undefined', async function () {
      await generate(tempDirFunc, {
        pathRuleList: ['README.md', 'nested/README.md'],
        urlRuleDoc() {
          return undefined;
        },
      });
      expect(
        readFileSync(join(tempDirFunc, 'README.md'), 'utf8'),
      ).toMatchSnapshot();
      expect(
        readFileSync(join(tempDirFunc, 'nested/README.md'), 'utf8'),
      ).toMatchSnapshot();
      expect(
        readFileSync(join(tempDirFunc, 'docs/rules/no-foo.md'), 'utf8'),
      ).toMatchSnapshot();
      expect(
        readFileSync(join(tempDirFunc, 'docs/rules/no-bar.md'), 'utf8'),
      ).toMatchSnapshot();
    });
  });
});
