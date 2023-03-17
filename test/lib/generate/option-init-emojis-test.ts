import { generate } from '../../../lib/generator.js';
import mockFs from 'mock-fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { jest } from '@jest/globals';
import * as sinon from 'sinon';
import * as gptEmoji from 'gpt-emoji';

const __dirname = dirname(fileURLToPath(import.meta.url));

const PATH_NODE_MODULES = resolve(__dirname, '..', '..', '..', 'node_modules');

describe('generate (initEmojis option)', function () {
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
              'no-foo': {
                meta: {},
                create(context) {}
              },
            },
            configs: {
              recommended: {},
              errors: {},
            }
          };`,

        'README.md': '## Rules\n',

        'docs/rules/no-foo.md': '',

        // Needed for some of the test infrastructure to work.
        node_modules: mockFs.load(PATH_NODE_MODULES),
      });
    });

    afterEach(function () {
      mockFs.restore();
      jest.resetModules();
    });

    it('throws without env var', async function () {
      await expect(generate('.', { initEmojis: true })).rejects.toThrow(
        'Missing OPENAI_API_KEY environment variable.'
      );
    });

    it('prints a table', async function () {
      const consoleLogStub = sinon.stub(console, 'log');
      const getEmojisStub = sinon
        .stub(gptEmoji, 'getEmojis')
        .resolves([['👍'], ['❗️']]);

      await generate('.', {
        initEmojis: true,
      });

      expect(getEmojisStub.callCount).toBe(1);
      expect(getEmojisStub.firstCall.args).toStrictEqual([]); // TODO

      expect(consoleLogStub.callCount).toBe(1);
      expect(consoleLogStub.firstCall.args).toStrictEqual([]); // TODO

      consoleLogStub.restore();
    });
  });
});
