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
  describe('rule with type, type column not enabled', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('generate', 'rule-type', 'type-column-disabled'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('hides the type column', async function () {
      await generate(tempDir);
      expect(readFileSync(join(tempDir, 'README.md'), 'utf8')).toMatchSnapshot();
      expect(readFileSync(join(tempDir, 'docs/rules/no-foo.md'), 'utf8')).toMatchSnapshot();
    });
  });

  describe('rule with type, type column enabled', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('generate', 'rule-type', 'type-column-enabled'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('displays the type', async function () {
      await generate(tempDir, {
        ruleListColumns: [COLUMN_TYPE.NAME, COLUMN_TYPE.TYPE],
      });
      expect(readFileSync(join(tempDir, 'README.md'), 'utf8')).toMatchSnapshot();
      expect(readFileSync(join(tempDir, 'docs/rules/no-foo.md'), 'utf8')).toMatchSnapshot();
      expect(readFileSync(join(tempDir, 'docs/rules/no-bar.md'), 'utf8')).toMatchSnapshot();
      expect(readFileSync(join(tempDir, 'docs/rules/no-biz.md'), 'utf8')).toMatchSnapshot();
      expect(readFileSync(join(tempDir, 'docs/rules/no-boz.md'), 'utf8')).toMatchSnapshot();
      expect(readFileSync(join(tempDir, 'docs/rules/no-buz.md'), 'utf8')).toMatchSnapshot();
    });
  });

  describe('rule with type, type column enabled, but only an unknown type', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('generate', 'rule-type', 'type-column-unknown-only'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('hides the type column and notice', async function () {
      await generate(tempDir, {
        ruleListColumns: [COLUMN_TYPE.NAME, COLUMN_TYPE.TYPE],
      });
      expect(readFileSync(join(tempDir, 'README.md'), 'utf8')).toMatchSnapshot();
      expect(readFileSync(join(tempDir, 'docs/rules/no-foo.md'), 'utf8')).toMatchSnapshot();
    });
  });
});
