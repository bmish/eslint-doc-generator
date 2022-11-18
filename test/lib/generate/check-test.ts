import { generate } from '../../../lib/generator.js';
import mockFs from 'mock-fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { jest } from '@jest/globals';
import * as sinon from 'sinon';

const __dirname = dirname(fileURLToPath(import.meta.url));

const PATH_NODE_MODULES = resolve(__dirname, '..', '..', '..', 'node_modules');

describe('generate (--check)', function () {
  describe('basic', function () {
    beforeEach(function () {
      mockFs({
        'package.json': JSON.stringify({
          name: 'eslint-plugin-test',
          exports: 'index.js',
          type: 'module',
        }),

        'index.js': `
          export default {
            rules: {
              'no-foo': { meta: { docs: { description: 'Description for no-foo.'} }, create(context) {} },
            },
          };`,

        'README.md': '## Rules\n',

        'docs/rules/no-foo.md': '# test/no-foo',

        // Needed for some of the test infrastructure to work.
        node_modules: mockFs.load(PATH_NODE_MODULES),
      });
    });

    afterEach(function () {
      mockFs.restore();
      jest.resetModules();
    });

    it('prints the issues, exits with failure, and does not write changes', async function () {
      const consoleErrorStub = sinon.stub(console, 'error');
      await generate('.', { check: true });
      expect(consoleErrorStub.callCount).toBe(4);
      // Use join to handle both Windows and Unix paths.
      expect(consoleErrorStub.firstCall.args).toStrictEqual([
        `Please run eslint-doc-generator. A rule doc is out-of-date: ${join(
          'docs',
          'rules',
          'no-foo.md'
        )}`,
      ]);
      expect(consoleErrorStub.secondCall.args).toMatchSnapshot(); // Diff
      expect(consoleErrorStub.thirdCall.args).toStrictEqual([
        'Please run eslint-doc-generator. README.md is out-of-date.',
      ]);
      expect(consoleErrorStub.getCall(3).args).toMatchSnapshot(); // Diff
      consoleErrorStub.restore();

      expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();
      expect(readFileSync('docs/rules/no-foo.md', 'utf8')).toMatchSnapshot();
    });
  });
});
