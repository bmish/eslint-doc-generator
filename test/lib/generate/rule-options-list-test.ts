import { generate } from '../../../lib/generator.js';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import * as sinon from 'sinon';
import {
  setupFixture,
  cleanupFixture,
  getFixturePath,
} from '../fixture-helper.js';

describe('generate (rule options list)', function () {
  let tempDir: string;

  beforeEach(function () {
    tempDir = setupFixture(getFixturePath('standard'));
  });

  afterEach(function () {
    cleanupFixture(tempDir);
  });

  it('generates the documentation', async function () {
    const consoleErrorStub = sinon.stub(console, 'error');
    await generate(tempDir);
    expect(consoleErrorStub.callCount).toBe(0);
    consoleErrorStub.restore();
    expect(
      readFileSync(join(tempDir, 'docs/rules/no-foo.md'), 'utf8'),
    ).toMatchSnapshot();
  });

  describe('displays default column even when only falsy value, hiding deprecated/required cols with only falsy value', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath(
          'edge-cases',
          'displays-default-column-even-when-only-falsy-value',
        ),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('generates the documentation', async function () {
      const consoleErrorStub = sinon.stub(console, 'error');
      await generate(tempDir);
      expect(consoleErrorStub.callCount).toBe(0);
      consoleErrorStub.restore();
      expect(
        readFileSync(join(tempDir, 'docs/rules/no-foo.md'), 'utf8'),
      ).toMatchSnapshot();
    });
  });

  describe('with no options', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(getFixturePath('edge-cases', 'with-no-options'));
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('generates the documentation', async function () {
      const consoleErrorStub = sinon.stub(console, 'error');
      await generate(tempDir);
      expect(consoleErrorStub.callCount).toBe(0);
      consoleErrorStub.restore();
      expect(
        readFileSync(join(tempDir, 'docs/rules/no-foo.md'), 'utf8'),
      ).toMatchSnapshot();
    });
  });

  describe('with no marker comments', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('edge-cases', 'with-no-marker-comments'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('generates the documentation', async function () {
      const consoleErrorStub = sinon.stub(console, 'error');
      await generate(tempDir);
      expect(consoleErrorStub.callCount).toBe(0);
      consoleErrorStub.restore();
      expect(
        readFileSync(join(tempDir, 'docs/rules/no-foo.md'), 'utf8'),
      ).toMatchSnapshot();
    });
  });

  describe('with string that needs to be escaped in table', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath(
          'edge-cases',
          'with-string-that-needs-to-be-escaped-in-table',
        ),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('generates the documentation', async function () {
      const consoleErrorStub = sinon.stub(console, 'error');
      await generate(tempDir);
      expect(consoleErrorStub.callCount).toBe(0);
      consoleErrorStub.restore();
      expect(
        readFileSync(join(tempDir, 'docs/rules/no-foo.md'), 'utf8'),
      ).toMatchSnapshot();
    });
  });
});
