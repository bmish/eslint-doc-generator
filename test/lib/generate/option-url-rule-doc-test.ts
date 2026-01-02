import { generate } from '../../../lib/generator.js';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import {
  setupFixture,
  cleanupFixture,
  getFixturePath,
} from '../fixture-helper.js';

describe('generate (--url-rule-doc)', function () {
  describe('basic', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('generate', 'option-url-rule-doc', 'basic'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('uses the right URLs', async function () {
      await generate(tempDir, {
        urlRuleDoc: 'https://example.com/rule-docs/{name}/',
      });
      expect(readFileSync(join(tempDir, 'README.md'), 'utf8')).toMatchSnapshot();
      expect(readFileSync(join(tempDir, 'docs/rules/no-foo.md'), 'utf8')).toMatchSnapshot();
      expect(readFileSync(join(tempDir, 'docs/rules/no-bar.md'), 'utf8')).toMatchSnapshot();
    });
  });

  describe('function', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('generate', 'option-url-rule-doc', 'function'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('uses the custom URL', async function () {
      await generate(tempDir, {
        pathRuleList: ['README.md', 'nested/README.md'],
        urlRuleDoc(name, path) {
          return `https://example.com/rule-docs/name:${name}/path:${path}`;
        },
      });
      expect(readFileSync(join(tempDir, 'README.md'), 'utf8')).toMatchSnapshot();
      expect(readFileSync(join(tempDir, 'nested/README.md'), 'utf8')).toMatchSnapshot();
      expect(readFileSync(join(tempDir, 'docs/rules/no-foo.md'), 'utf8')).toMatchSnapshot();
      expect(readFileSync(join(tempDir, 'docs/rules/no-bar.md'), 'utf8')).toMatchSnapshot();
    });
  });

  describe('function returns undefined', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('generate', 'option-url-rule-doc', 'function-returns-undefined'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('should fallback to the normal URL', async function () {
      await generate(tempDir, {
        pathRuleList: ['README.md', 'nested/README.md'],
        urlRuleDoc() {
          return undefined;
        },
      });
      expect(readFileSync(join(tempDir, 'README.md'), 'utf8')).toMatchSnapshot();
      expect(readFileSync(join(tempDir, 'nested/README.md'), 'utf8')).toMatchSnapshot();
      expect(readFileSync(join(tempDir, 'docs/rules/no-foo.md'), 'utf8')).toMatchSnapshot();
      expect(readFileSync(join(tempDir, 'docs/rules/no-bar.md'), 'utf8')).toMatchSnapshot();
    });
  });
});
