import { generate } from '../../../lib/generator.js';
import mockFs from 'mock-fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { jest } from '@jest/globals';
import * as sinon from 'sinon';

const __dirname = dirname(fileURLToPath(import.meta.url));

const PATH_NODE_MODULES = resolve(__dirname, '..', '..', '..', 'node_modules');

describe('generate (rule doc sections)', function () {
  describe('with `--rule-doc-section-include` and `--rule-doc-section-exclude` and no problems', function () {
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

        'docs/rules/no-foo.md': '## Examples\n',

        // Needed for some of the test infrastructure to work.
        node_modules: mockFs.load(PATH_NODE_MODULES),
      });
    });

    afterEach(function () {
      mockFs.restore();
      jest.resetModules();
    });

    it('has no issues', async function () {
      await expect(
        generate('.', {
          ruleDocSectionInclude: ['Examples'],
          ruleDocSectionExclude: ['Unwanted Section'],
        })
      ).resolves.toBeUndefined();
    });
  });

  describe('with `--rule-doc-section-include` and `--rule-doc-section-exclude` and problems', function () {
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

        'docs/rules/no-foo.md': '## Unwanted Section\n',

        // Needed for some of the test infrastructure to work.
        node_modules: mockFs.load(PATH_NODE_MODULES),
      });
    });

    afterEach(function () {
      mockFs.restore();
      jest.resetModules();
    });

    it('prints errors', async function () {
      const consoleErrorStub = sinon.stub(console, 'error');
      await generate('.', {
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
