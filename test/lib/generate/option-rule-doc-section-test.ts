import { generate } from '../../../lib/generator.js';
import * as sinon from 'sinon';
import {
  setupFixture,
  cleanupFixture,
  getFixturePath,
} from '../fixture-helper.js';

describe('generate (rule doc sections)', function () {
  describe('with `--rule-doc-section-include` and `--rule-doc-section-exclude` and no problems', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('edge-cases', 'no-problems'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('has no issues', async function () {
      await expect(
        generate(tempDir, {
          ruleDocSectionInclude: ['Examples'],
          ruleDocSectionExclude: ['Unwanted Section'],
        }),
      ).resolves.toBeUndefined();
    });
  });

  describe('with `--rule-doc-section-include` and `--rule-doc-section-exclude` and problems', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('edge-cases', 'with-problems'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('prints errors', async function () {
      const consoleErrorStub = sinon.stub(console, 'error');
      await generate(tempDir, {
        ruleDocSectionInclude: ['Examples'],
        ruleDocSectionExclude: ['Unwanted Section'],
      });
      expect(consoleErrorStub.callCount).toBe(2);
      expect(consoleErrorStub.firstCall.args).toStrictEqual([
        '`no-foo` rule doc should have included the header: Examples',
      ]);
      expect(consoleErrorStub.secondCall.args).toStrictEqual([
        '`no-foo` rule doc should not have included the header: Unwanted Section',
      ]);
      consoleErrorStub.restore();
    });
  });
});
