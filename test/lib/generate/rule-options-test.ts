import { generate } from '../../../lib/generator.js';
import mockFs from 'mock-fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { jest } from '@jest/globals';
import * as sinon from 'sinon';
import { COLUMN_TYPE, NOTICE_TYPE } from '../../../lib/types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const PATH_NODE_MODULES = resolve(__dirname, '..', '..', '..', 'node_modules');

describe('generate (rule options)', function () {
  describe('Rule doc has options section but rule has no options', function () {
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
                    meta: { docs: { description: 'Description of no-foo.' }, },
                    create(context) {}
                  },
                },
                configs: {
                  all: {
                    rules: {
                      'test/no-foo': 'error',
                    }
                  }
                }
              };`,

        'README.md':
          '<!-- begin auto-generated rules list --><!-- end auto-generated rules list -->',

        'docs/rules/no-foo.md': '## Options\n', // empty

        // Needed for some of the test infrastructure to work.
        node_modules: mockFs.load(PATH_NODE_MODULES),
      });
    });
    afterEach(function () {
      mockFs.restore();
      jest.resetModules();
    });
    it('prints an error', async function () {
      const consoleErrorStub = sinon.stub(console, 'error');
      await generate('.');
      expect(consoleErrorStub.callCount).toBe(1);
      expect(consoleErrorStub.firstCall.args).toStrictEqual([
        '`no-foo` rule doc should not have included any of these headers: Options, Config',
      ]);
      consoleErrorStub.restore();
    });
  });

  describe('Rule doc missing options section', function () {
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
                    meta: {
                      docs: { description: 'Description of no-foo.', },
                      schema: [{ type: 'object', },]
                    },
                    create(context) {},
                  },
                },
              };`,

        'README.md':
          '<!-- begin auto-generated rules list --><!-- end auto-generated rules list -->',

        'docs/rules/no-foo.md': '', // empty

        // Needed for some of the test infrastructure to work.
        node_modules: mockFs.load(PATH_NODE_MODULES),
      });
    });
    afterEach(function () {
      mockFs.restore();
      jest.resetModules();
    });
    it('prints an error', async function () {
      const consoleErrorStub = sinon.stub(console, 'error');
      await generate('.');
      expect(consoleErrorStub.callCount).toBe(1);
      expect(consoleErrorStub.firstCall.args).toStrictEqual([
        '`no-foo` rule doc should have included one of these headers: Options, Config',
      ]);
      consoleErrorStub.restore();
    });
  });

  describe('Rule doc missing options section with --rule-doc-section-options=true', function () {
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
                    meta: {
                      docs: { description: 'Description of no-foo.', },
                      schema: [{ type: 'object', },]
                    },
                    create(context) {},
                  },
                },
              };`,

        'README.md':
          '<!-- begin auto-generated rules list --><!-- end auto-generated rules list -->',

        'docs/rules/no-foo.md': '', // empty

        // Needed for some of the test infrastructure to work.
        node_modules: mockFs.load(PATH_NODE_MODULES),
      });
    });
    afterEach(function () {
      mockFs.restore();
      jest.resetModules();
    });
    it('prints an error', async function () {
      const consoleErrorStub = sinon.stub(console, 'error');
      await generate('.', { ruleDocSectionOptions: true });
      expect(consoleErrorStub.callCount).toBe(1);
      expect(consoleErrorStub.firstCall.args).toStrictEqual([
        '`no-foo` rule doc should have included one of these headers: Options, Config',
      ]);
      consoleErrorStub.restore();
    });
  });

  describe('Rule doc missing options section with --rule-doc-section-options=false', function () {
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
                    meta: {
                      docs: { description: 'Description of no-foo.', },
                      schema: [{ type: 'object', },]
                    },
                    create(context) {},
                  },
                },
              };`,

        'README.md':
          '<!-- begin auto-generated rules list --><!-- end auto-generated rules list -->',

        'docs/rules/no-foo.md': '', // empty

        // Needed for some of the test infrastructure to work.
        node_modules: mockFs.load(PATH_NODE_MODULES),
      });
    });
    afterEach(function () {
      mockFs.restore();
      jest.resetModules();
    });
    it('has no error', async function () {
      const consoleErrorStub = sinon.stub(console, 'error');
      await generate('.', { ruleDocSectionOptions: false });
      expect(consoleErrorStub.callCount).toBe(0);
      consoleErrorStub.restore();
    });
  });

  describe('Rule has options with quotes', function () {
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
                    meta: {
                      docs: { description: 'Description of no-foo.', },
                      schema: [
                        {
                          type: 'object',
                          properties: {
                            'input[type="foo"]': {
                              type: 'boolean',
                              default: false,
                            },
                            "input[type='bar']": {
                              type: 'boolean',
                              default: false,
                            },
                          },
                          additionalProperties: false,
                        },
                      ]
                    },
                    create(context) {},
                  },
                },
              };`,

        'README.md':
          '<!-- begin auto-generated rules list --><!-- end auto-generated rules list -->',

        'docs/rules/no-foo.md':
          '## Options\n input[type=\\"foo\\"] \n input[type=\\\'bar\\\']',

        // Needed for some of the test infrastructure to work.
        node_modules: mockFs.load(PATH_NODE_MODULES),
      });
    });
    afterEach(function () {
      mockFs.restore();
      jest.resetModules();
    });
    it('successfully finds the options mentioned in the rule doc despite quote escaping', async function () {
      const consoleErrorStub = sinon.stub(console, 'error');
      await generate('.');
      expect(consoleErrorStub.callCount).toBe(0);
      consoleErrorStub.restore();
    });
  });

  describe('Rule doc does not mention an option', function () {
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
                meta: {
                  docs: { description: 'Description of no-foo.' },
                  schema: [
                    {
                      type: 'object',
                      properties: {
                        optionToDoSomething: {
                          type: 'boolean',
                          default: false,
                        },
                      },
                      additionalProperties: false,
                    },
                  ]
                },
                create(context) {}
              },
            },
            configs: {
              all: {
                rules: {
                  'test/no-foo': 'error',
                }
              }
            }
          };`,

        'README.md':
          '<!-- begin auto-generated rules list --><!-- end auto-generated rules list -->',

        'docs/rules/no-foo.md': '## Options\n', // empty

        // Needed for some of the test infrastructure to work.
        node_modules: mockFs.load(PATH_NODE_MODULES),
      });
    });
    afterEach(function () {
      mockFs.restore();
      jest.resetModules();
    });
    it('prints an error', async function () {
      const consoleErrorStub = sinon.stub(console, 'error');
      await generate('.');
      expect(consoleErrorStub.callCount).toBe(1);
      expect(consoleErrorStub.firstCall.args).toStrictEqual([
        '`no-foo` rule doc should have included: optionToDoSomething',
      ]);
      consoleErrorStub.restore();
    });
  });

  describe('rule with options, options column/notice enabled', function () {
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
              'no-foo': { meta: { schema: [{foo:true}] }, create(context) {} },
              'no-bar': { meta: { schema: {foo:true} }, create(context) {} },
              'no-biz': { meta: { schema: [] }, create(context) {} },
              'no-baz': { meta: {  }, create(context) {} },
            },
          };`,

        'README.md': '## Rules\n',

        'docs/rules/no-foo.md': '## Options\n',
        'docs/rules/no-bar.md': '## Options\n',
        'docs/rules/no-biz.md': '',
        'docs/rules/no-baz.md': '',

        // Needed for some of the test infrastructure to work.
        node_modules: mockFs.load(PATH_NODE_MODULES),
      });
    });

    afterEach(function () {
      mockFs.restore();
      jest.resetModules();
    });

    it('displays the column and notice', async function () {
      await generate('.', {
        ruleListColumns: [COLUMN_TYPE.NAME, COLUMN_TYPE.OPTIONS],
        ruleDocNotices: [NOTICE_TYPE.OPTIONS],
      });
      expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();
      expect(readFileSync('docs/rules/no-foo.md', 'utf8')).toMatchSnapshot();
      expect(readFileSync('docs/rules/no-bar.md', 'utf8')).toMatchSnapshot();
      expect(readFileSync('docs/rules/no-biz.md', 'utf8')).toMatchSnapshot();
      expect(readFileSync('docs/rules/no-baz.md', 'utf8')).toMatchSnapshot();
    });
  });
});
