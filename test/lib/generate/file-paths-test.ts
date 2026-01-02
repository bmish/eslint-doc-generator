import { generate } from '../../../lib/generator.js';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import {
  setupFixture,
  cleanupFixture,
  getFixturePath,
} from '../fixture-helper.js';

describe('generate (file paths)', function () {
  describe('missing rule doc', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('error-cases', 'missing-rule-doc'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    describe('when initRuleDocs is false', () => {
      it('throws an error', async function () {
        // Error message uses relative path from plugin root
        await expect(generate(tempDir)).rejects.toThrow(
          'Could not find rule doc (run with --init-rule-docs to create): docs/rules/no-bar.md',
        );
      });
    });

    describe('when initRuleDocs is true', () => {
      it('creates the rule doc', async function () {
        await generate(tempDir, { initRuleDocs: true });
        expect(readFileSync(join(tempDir, 'docs/rules/no-foo.md'), 'utf8')).toMatchSnapshot();
        expect(readFileSync(join(tempDir, 'docs/rules/no-bar.md'), 'utf8')).toMatchSnapshot(); // Should add options section.
      });
    });
  });

  describe('missing rule doc, initRuleDocs is true, and with ruleDocSectionInclude', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('generate', 'file-paths', 'missing-rule-doc-with-section-include'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('creates the rule doc including the mandatory section', async function () {
      await generate(tempDir, {
        initRuleDocs: true,
        ruleDocSectionInclude: ['Examples'],
      });
      expect(readFileSync(join(tempDir, 'docs/rules/no-foo.md'), 'utf8')).toMatchSnapshot();
      expect(readFileSync(join(tempDir, 'docs/rules/no-bar.md'), 'utf8')).toMatchSnapshot(); // Should add options section.
    });
  });

  describe('no missing rule doc but --init-rule-docs enabled', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('generate', 'file-paths', 'no-missing-rule-doc'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('throws an error', async function () {
      await expect(generate(tempDir, { initRuleDocs: true })).rejects.toThrow(
        '--init-rule-docs was enabled, but no rule doc file needed to be created.',
      );
    });
  });

  describe('missing README', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('error-cases', 'missing-readme'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('throws an error', async function () {
      await expect(generate(tempDir)).rejects.toThrow(
        'Could not find README.md in ESLint plugin.',
      );
    });
  });

  describe('lowercase README file', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('generate', 'file-paths', 'lowercase-readme'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('generates the documentation', async function () {
      await generate(tempDir);
      expect(readFileSync(join(tempDir, 'readme.md'), 'utf8')).toMatchSnapshot();
    });
  });

  describe('custom path to rule docs and rules list', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('generate', 'file-paths', 'custom-paths'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('generates the documentation', async function () {
      await generate(tempDir, {
        pathRuleDoc: join('rules', '{name}', '{name}.md'),
        pathRuleList: join('rules', 'list.md'),
      });
      expect(readFileSync(join(tempDir, 'rules/list.md'), 'utf8')).toMatchSnapshot();
      expect(readFileSync(join(tempDir, 'rules/no-foo/no-foo.md'), 'utf8')).toMatchSnapshot();
    });

    it('generates the documentation using a function for pathRuleDoc', async function () {
      await generate(tempDir, {
        pathRuleDoc: (ruleName) => join('rules', ruleName, `${ruleName}.md`),
      });
      expect(readFileSync(join(tempDir, 'README.md'), 'utf8')).toMatchSnapshot();
      expect(readFileSync(join(tempDir, 'rules/no-foo/no-foo.md'), 'utf8')).toMatchSnapshot();
    });
  });

  describe('multiple rules lists', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('generate', 'file-paths', 'multiple-rules-lists'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('generates the documentation', async function () {
      await generate(tempDir, {
        pathRuleList: [
          'README.md',
          join('rules', 'list.md'),
          join('docs', 'rules', 'index.md'),
        ],
      });
      expect(readFileSync(join(tempDir, 'README.md'), 'utf8')).toMatchSnapshot();
      expect(readFileSync(join(tempDir, 'rules/list.md'), 'utf8')).toMatchSnapshot();
      expect(readFileSync(join(tempDir, 'docs/rules/index.md'), 'utf8')).toMatchSnapshot();
    });
  });

  describe('multiple rules lists but incorrectly using CSV string for option', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('generate', 'file-paths', 'csv-string-error'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('throws an error', async function () {
      await expect(
        generate(tempDir, {
          pathRuleList: `README.md,${join('rules', 'list.md')}`,
        }),
      ).rejects.toThrow(
        `Provide property as array, not a CSV string: README.md,${join(
          'rules',
          'list.md',
        )}`,
      );

      await expect(
        generate(tempDir, {
          pathRuleList: [`README.md,${join('rules', 'list.md')}`],
        }),
      ).rejects.toThrow(
        `Provide property as array, not a CSV string: README.md,${join(
          'rules',
          'list.md',
        )}`,
      );
    });
  });

  describe('empty array of rule lists (happens when CLI option is not passed)', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('generate', 'file-paths', 'empty-array'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('falls back to default rules list', async function () {
      await generate(tempDir, {
        pathRuleList: [],
      });
      expect(readFileSync(join(tempDir, 'README.md'), 'utf8')).toMatchSnapshot();
    });
  });
});
