import { generate } from '../../../lib/generator.js';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import * as sinon from 'sinon';
import { COLUMN_TYPE, NOTICE_TYPE } from '../../../lib/types.js';
import {
  setupFixture,
  cleanupFixture,
  getFixturePath,
} from '../fixture-helper.js';

describe('generate (rule options)', function () {
  describe('Rule doc has options section but rule has no options', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('edge-cases', 'rule-doc-has-options-section-but-rule-has-no-options'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('prints an error', async function () {
      const consoleErrorStub = sinon.stub(console, 'error');
      await generate(tempDir);
      expect(consoleErrorStub.callCount).toBe(1);
      expect(consoleErrorStub.firstCall.args).toStrictEqual([
        '`no-foo` rule doc should not have included any of these headers: Options, Config',
      ]);
      consoleErrorStub.restore();
    });
  });

  describe('Rule doc missing options section', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('edge-cases', 'rule-doc-missing-options-section'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('prints an error', async function () {
      const consoleErrorStub = sinon.stub(console, 'error');
      await generate(tempDir);
      expect(consoleErrorStub.callCount).toBe(1);
      expect(consoleErrorStub.firstCall.args).toStrictEqual([
        '`no-foo` rule doc should have included one of these headers: Options, Config',
      ]);
      consoleErrorStub.restore();
    });
  });

  describe('Rule doc missing options section with --rule-doc-section-options=true', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('edge-cases', 'rule-doc-missing-options-section-with-rule-doc-section-options-true'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('prints an error', async function () {
      const consoleErrorStub = sinon.stub(console, 'error');
      await generate(tempDir, { ruleDocSectionOptions: true });
      expect(consoleErrorStub.callCount).toBe(1);
      expect(consoleErrorStub.firstCall.args).toStrictEqual([
        '`no-foo` rule doc should have included one of these headers: Options, Config',
      ]);
      consoleErrorStub.restore();
    });
  });

  describe('Rule doc missing options section with --rule-doc-section-options=false', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('edge-cases', 'rule-doc-missing-options-section-with-rule-doc-section-options-false'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('has no error', async function () {
      const consoleErrorStub = sinon.stub(console, 'error');
      await generate(tempDir, { ruleDocSectionOptions: false });
      expect(consoleErrorStub.callCount).toBe(0);
      consoleErrorStub.restore();
    });
  });

  describe('Rule has options with quotes', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('edge-cases', 'rule-has-options-with-quotes'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('successfully finds the options mentioned in the rule doc despite quote escaping', async function () {
      const consoleErrorStub = sinon.stub(console, 'error');
      await generate(tempDir);
      expect(consoleErrorStub.callCount).toBe(0);
      consoleErrorStub.restore();
    });
  });

  describe('Rule doc does not mention an option', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('edge-cases', 'rule-doc-does-not-mention-an-option'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('prints an error', async function () {
      const consoleErrorStub = sinon.stub(console, 'error');
      await generate(tempDir);
      expect(consoleErrorStub.callCount).toBe(1);
      expect(consoleErrorStub.firstCall.args).toStrictEqual([
        '`no-foo` rule doc should have included rule option: optionToDoSomething',
      ]);
      consoleErrorStub.restore();
    });
  });

  describe('rule with options, options column/notice enabled', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('edge-cases', 'rule-with-options-options-column-notice-enabled'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('displays the column and notice', async function () {
      await generate(tempDir, {
        ruleListColumns: [COLUMN_TYPE.NAME, COLUMN_TYPE.OPTIONS],
        ruleDocNotices: [NOTICE_TYPE.OPTIONS],
      });
      expect(readFileSync(join(tempDir, 'README.md'), 'utf8')).toMatchSnapshot();
      expect(readFileSync(join(tempDir, 'docs/rules/no-foo.md'), 'utf8')).toMatchSnapshot();
      expect(readFileSync(join(tempDir, 'docs/rules/no-bar.md'), 'utf8')).toMatchSnapshot();
      expect(readFileSync(join(tempDir, 'docs/rules/no-biz.md'), 'utf8')).toMatchSnapshot();
      expect(readFileSync(join(tempDir, 'docs/rules/no-baz.md'), 'utf8')).toMatchSnapshot();
    });
  });
});
