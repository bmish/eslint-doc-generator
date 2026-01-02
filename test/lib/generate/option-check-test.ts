import { generate } from '../../../lib/generator.js';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import * as sinon from 'sinon';
import {
  setupFixture,
  cleanupFixture,
  getFixturePath,
} from '../fixture-helper.js';

describe('generate (--check)', function () {
  let tempDir: string;

  beforeEach(function () {
    tempDir = setupFixture(getFixturePath('minimal'));
  });

  afterEach(function () {
    cleanupFixture(tempDir);
  });

  it('prints the issues, exits with failure, and does not write changes', async function () {
    const consoleErrorStub = sinon.stub(console, 'error');
    await generate(tempDir, { check: true });
    expect(consoleErrorStub.callCount).toBe(4);
    // Error message uses relative path from plugin root
    expect(consoleErrorStub.firstCall.args).toStrictEqual([
      'Please run eslint-doc-generator. A rule doc is out-of-date: docs/rules/no-foo.md',
    ]);
    expect(consoleErrorStub.secondCall.args).toMatchSnapshot(); // Diff
    expect(consoleErrorStub.thirdCall.args).toStrictEqual([
      'Please run eslint-doc-generator. The rules table in README.md is out-of-date.',
    ]);
    expect(consoleErrorStub.getCall(3).args).toMatchSnapshot(); // Diff
    consoleErrorStub.restore();

    expect(readFileSync(join(tempDir, 'README.md'), 'utf8')).toMatchSnapshot();
    expect(readFileSync(join(tempDir, 'docs/rules/no-foo.md'), 'utf8')).toMatchSnapshot();
  });
});
