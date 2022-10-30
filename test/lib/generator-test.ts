import { generate } from '../../lib/generator.js';
import mockFs from 'mock-fs';
import { outdent } from 'outdent';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { jest } from '@jest/globals';
import prettier from 'prettier';
import * as sinon from 'sinon';
import { EMOJI_CONFIG } from '../../lib/emojis.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Create a mock-fs workspace filesystem for temporary usage in this test because changes will be written to some files.

describe('generator', function () {
  describe('#generate', function () {
    beforeEach(function () {
      // We have to clear the prettier cache between tests for this to work.
      prettier.clearConfigCache();
    });

    describe('successful', function () {
      beforeEach(function () {
        mockFs({
          // package.json
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            main: 'index.js',
            type: 'module',
          }),

          // entry point
          'index.js': `
            export default {
              rules: {
                'no-foo': {
                  meta: {
                    docs: { description: 'Description of no-foo.' },
                    fixable: 'code',
                    hasSuggestions: true,
                    schema: [
                      {
                        type: 'object',
                        properties: {
                          optionToDoSomething1: {
                            type: 'boolean',
                            default: false,
                          },
                        },
                        additionalProperties: false,
                      },
                      {
                        type: 'array',
                        minItems: 1,
                        maxItems: 1,
                        items: [
                          {
                            type: 'object',
                            properties: {
                              optionToDoSomething2: {
                                type: 'boolean',
                                default: false,
                              },
                            },
                            additionalProperties: false,
                          },
                        ],
                      },
                      {
                        type: 'array',
                      },
                    ]
                  },
                  create(context) {}
                },
                'no-bar': {
                  meta: {
                    docs: { description: 'Description of no-bar.' },
                    fixable: 'code',
                    schema: [],
                  },
                  create(context) {},
                },
                'no-baz': {
                  meta: { docs: { description: 'Description of no-boz.' }, },
                  create(context) {}
                },
              },
              configs: {
                all: {
                  rules: {
                    'test/no-foo': 'error',
                    'test/no-bar': 'error',
                    // test/no-baz rule intentionally not in any config.
                  }
                },
                recommended: {
                  rules: {
                    'test/no-foo': 'error',
                  }
                },
                style: {
                  rules: {
                    'test/no-bar': 'error',
                  }
                }
              }
            };`,

          // README.md
          'README.md': outdent`
            # eslint-plugin-test
            Description.
            ## Rules
            <!-- begin auto-generated rules list -->
            ...
            <!-- end auto-generated rules list -->
            more content.
          `,

          // RULE DOC FILES

          'docs/rules/no-foo.md': outdent`
            # title (rule-name)
            description
            <!-- end auto-generated rule header -->
            ## Rule details
            details
            ## Options
            optionToDoSomething1 - explanation
            optionToDoSomething2 - explanation
          `, // rule doc with incorrect header content
          'docs/rules/no-bar.md': outdent`
            <!-- end auto-generated rule header -->
            ## Rule details
            details
          `, // marker but no header content
          'docs/rules/no-baz.md': outdent`
            ## Rule details
            details
          `, // content but missing marker

          // Needed for some of the test infrastructure to work.
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
        });
      });

      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });

      it('updates the documentation', async function () {
        await generate('.');

        expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();

        expect(readFileSync('docs/rules/no-foo.md', 'utf8')).toMatchSnapshot();
        expect(readFileSync('docs/rules/no-bar.md', 'utf8')).toMatchSnapshot();
        expect(readFileSync('docs/rules/no-baz.md', 'utf8')).toMatchSnapshot();
      });
    });

    describe('only a `recommended` config', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            main: 'index.js',
            type: 'module',
          }),

          'index.js': `
            export default {
              rules: {
                'no-foo': {
                  meta: { docs: { description: 'Description.' }, },
                  create(context) {}
                },
              },
              configs: {
                recommended: {
                  rules: {
                    'test/no-foo': 'error',
                  }
                }
              }
            };`,

          'README.md':
            '<!-- begin auto-generated rules list --><!-- end auto-generated rules list -->',

          'docs/rules/no-foo.md': '',

          // Needed for some of the test infrastructure to work.
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
        });
      });

      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });

      it('updates the documentation', async function () {
        await generate('.');

        expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();

        expect(readFileSync('docs/rules/no-foo.md', 'utf8')).toMatchSnapshot();
      });
    });

    describe('rule doc without header marker but pre-existing header', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            main: 'index.js',
            type: 'module',
          }),

          'index.js': `
            export default {
              rules: {
                'no-foo': {
                  meta: { docs: { description: 'Description.' }, },
                  create(context) {}
                },
              },
              configs: {
                recommended: {
                  rules: {
                    'test/no-foo': 'error',
                  }
                }
              }
            };`,

          'README.md':
            '<!-- begin auto-generated rules list --><!-- end auto-generated rules list -->',

          'docs/rules/no-foo.md': outdent`
            # Some pre-existing title.
            Pre-existing notice about the rule being recommended.
            ## Rule details
            Details.
          `,

          // Needed for some of the test infrastructure to work.
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
        });
      });

      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });

      it('updates the documentation', async function () {
        await generate('.');

        expect(readFileSync('docs/rules/no-foo.md', 'utf8')).toMatchSnapshot();
      });
    });

    describe('deprecated rules', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            main: 'index.js',
            type: 'module',
          }),

          'index.js': `
            export default {
              rules: {
                'no-foo': {
                  meta: {
                    docs: { description: 'Description.' },
                    deprecated: true,
                    replacedBy: ['no-bar'],
                  },
                  create(context) {}
                },
                'no-bar': {
                  meta: {
                    docs: { description: 'Description.' },
                    deprecated: true, // No replacement specified.
                  },
                  create(context) {}
                },
                'no-baz': {
                  meta: {
                    docs: { description: 'Description.' },
                    deprecated: true,
                    replacedBy: [], // Empty array.
                  },
                  create(context) {}
                },
                'no-biz': {
                  // One rule that isn't deprecated.
                  meta: {
                    docs: { description: 'Description.' },
                  },
                  create(context) {}
                },
              },
              configs: {}
            };`,

          'README.md':
            '<!-- begin auto-generated rules list --><!-- end auto-generated rules list -->',

          'docs/rules/no-foo.md': '',
          'docs/rules/no-bar.md': '',
          'docs/rules/no-baz.md': '',
          'docs/rules/no-biz.md': '',

          // Needed for some of the test infrastructure to work.
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
        });
      });

      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });

      it('updates the documentation', async function () {
        await generate('.');

        expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();

        expect(readFileSync('docs/rules/no-foo.md', 'utf8')).toMatchSnapshot();
        expect(readFileSync('docs/rules/no-bar.md', 'utf8')).toMatchSnapshot();
        expect(readFileSync('docs/rules/no-baz.md', 'utf8')).toMatchSnapshot();
        expect(readFileSync('docs/rules/no-biz.md', 'utf8')).toMatchSnapshot();
      });
    });

    describe('deprecated rule with no rule doc but --ignore-deprecated-rules', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            main: 'index.js',
            type: 'module',
          }),

          'index.js': `
            export default {
              rules: {
                'no-foo': {
                  meta: { deprecated: true, },
                  create(context) {}
                },
              },
              configs: {}
            };`,

          'README.md':
            '<!-- begin auto-generated rules list --><!-- end auto-generated rules list -->',

          // Needed for some of the test infrastructure to work.
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
        });
      });

      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });

      it('omits the rule from the README and does not try to update its non-existent rule doc', async function () {
        await generate('.', { ignoreDeprecatedRules: true });

        expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();
      });
    });

    describe('missing rule doc', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            main: 'index.js',
            type: 'module',
          }),

          'index.js': `
            export default {
              rules: {
                'no-foo': {
                  meta: { },
                  create(context) {}
                },
              },
            };`,

          'README.md':
            '<!-- begin auto-generated rules list --><!-- end auto-generated rules list -->',

          // Needed for some of the test infrastructure to work.
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
        });
      });

      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });

      it('throws an error', async function () {
        // Use join to handle both Windows and Unix paths.
        await expect(generate('.')).rejects.toThrow(
          `Could not find rule doc: ${join('docs', 'rules', 'no-foo.md')}`
        );
      });
    });

    describe('missing README', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            main: 'index.js',
            type: 'module',
          }),

          'index.js': `
            export default {
              rules: {
                'no-foo': {
                  meta: { },
                  create(context) {}
                },
              },
            };`,

          'docs/rules/no-foo.md': '',

          // Needed for some of the test infrastructure to work.
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
        });
      });

      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });

      it('throws an error', async function () {
        await expect(generate('.')).rejects.toThrow(
          'Could not find README.md in ESLint plugin root.'
        );
      });
    });

    describe('lowercase README file', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            main: 'index.js',
            type: 'module',
          }),

          'index.js': `
            export default {
              rules: {
                'no-foo': { meta: { }, create(context) {} },
              },
            };`,

          'readme.md':
            '<!-- begin auto-generated rules list --><!-- end auto-generated rules list -->',
          'docs/rules/no-foo.md': '',

          // Needed for some of the test infrastructure to work.
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
        });
      });

      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });

      it('generates the documentation', async function () {
        await generate('.');
        expect(readFileSync('readme.md', 'utf8')).toMatchSnapshot();
      });
    });

    describe('shows column and notice for requiresTypeChecking', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            main: 'index.js',
            type: 'module',
          }),

          'index.js': `
            export default {
              rules: {
                'no-foo': {
                  meta: { docs: { description: 'Description of no-foo.' }, },
                  create(context) {}
                },
                'no-bar': {
                  meta: { docs: { description: 'Description of no-bar.', requiresTypeChecking: true }, },
                  create(context) {}
                },
              },
              configs: {
                all: {
                  rules: {
                    'test/no-foo': 'error',
                  }
                },
              }
            };`,

          'README.md':
            '<!-- begin auto-generated rules list --><!-- end auto-generated rules list -->',

          'docs/rules/no-foo.md': '',
          'docs/rules/no-bar.md': '',

          // Needed for some of the test infrastructure to work.
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
        });
      });

      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });

      it('updates the documentation', async function () {
        await generate('.');

        expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();
        expect(readFileSync('docs/rules/no-foo.md', 'utf8')).toMatchSnapshot();
        expect(readFileSync('docs/rules/no-bar.md', 'utf8')).toMatchSnapshot();
      });
    });

    describe('Missing plugin package.json `main` field', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            type: 'module',
          }),

          'index.js': 'export default { rules: {} };',

          'README.md':
            '<!-- begin auto-generated rules list --><!-- end auto-generated rules list -->',

          // Needed for some of the test infrastructure to work.
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
        });
      });
      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });
      it('defaults to index.js entry point', async function () {
        await expect(generate('.')).resolves.toBeUndefined();
      });
    });

    describe('Package.json `main` field points to directory', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            type: 'module',
            main: 'lib/',
          }),

          'lib/index.js': 'export default { rules: {} };',

          'README.md':
            '<!-- begin auto-generated rules list --><!-- end auto-generated rules list -->',

          // Needed for some of the test infrastructure to work.
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
        });
      });
      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });
      it('finds index.js entry point', async function () {
        await expect(generate('.')).resolves.toBeUndefined();
      });
    });

    describe('Package.json `main` field points to non-existent file', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            type: 'module',
            main: 'index.js',
          }),

          // Needed for some of the test infrastructure to work.
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
        });
      });
      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });
      it('throws an error', async function () {
        await expect(generate('.')).rejects.toThrow(
          'Could not find entry point for ESLint plugin. Tried: index.js'
        );
      });
    });

    describe('README missing rule list markers but with rules section', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            main: 'index.js',
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
              configs: {}
            };`,

          'README.md': outdent`
            # eslint-plugin-test

            Foo.

            ## Rules

            Old rules list.

            ## Other

            Bar.
          `,

          'docs/rules/no-foo.md': '',

          // Needed for some of the test infrastructure to work.
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
        });
      });
      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });
      it('adds rule list markers to rule section', async function () {
        await generate('.');
        expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();
      });
    });

    describe('README missing rule list markers and no rules section', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            main: 'index.js',
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
            };`,

          'README.md': '# eslint-plugin-test',

          'docs/rules/no-foo.md': '',

          // Needed for some of the test infrastructure to work.
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
        });
      });
      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });
      it('throws an error', async function () {
        await expect(generate('.')).rejects.toThrowErrorMatchingSnapshot();
      });
    });

    describe('Rule doc has options section but rule has no options', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            main: 'index.js',
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
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
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
            main: 'index.js',
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
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
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
            main: 'index.js',
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
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
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
            main: 'index.js',
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
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
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
            main: 'index.js',
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
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
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

    describe('Rule description needs to be formatted', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            main: 'index.js',
            type: 'module',
          }),

          'index.js': `
            export default {
              rules: {
                'no-foo': {
                  meta: { docs: { description: 'disallow foo.' }, },
                  create(context) {}
                },
              },
              configs: {}
            };`,

          'README.md':
            '<!-- begin auto-generated rules list --><!-- end auto-generated rules list -->',

          'docs/rules/no-foo.md': '',

          // Needed for some of the test infrastructure to work.
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
        });
      });
      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });
      it('capitalizes the first letter and removes the trailing period from the description', async function () {
        await generate('.');
        expect(readFileSync('docs/rules/no-foo.md', 'utf8')).toMatchSnapshot();
      });
    });

    describe('Rule doc does not mention an option', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            main: 'index.js',
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
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
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

    describe('Missing plugin package.json', function () {
      beforeEach(function () {
        mockFs({
          // Needed for some of the test infrastructure to work.
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
        });
      });
      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });
      it('throws an error', async function () {
        await expect(generate('.')).rejects.toThrowErrorMatchingSnapshot();
      });
    });

    describe('Missing plugin package.json `name` field', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            main: 'index.js',
          }),

          'index.js': 'export default { rules: {} }',

          // Needed for some of the test infrastructure to work.
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
        });
      });
      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });
      it('throws an error', async function () {
        await expect(generate('.')).rejects.toThrowErrorMatchingSnapshot();
      });
    });

    describe('Scoped plugin name', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: '@my-scope/eslint-plugin',
            main: 'index.js',
            type: 'module',
          }),

          'index.js': `
            export default {
              rules: {
                'no-foo': {
                  meta: { docs: { description: 'disallow foo.' }, },
                  create(context) {}
                },
              },
              configs: {
                'recommended': { rules: { '@my-scope/no-foo': 'error', } }
              }
            };`,

          'README.md':
            '<!-- begin auto-generated rules list --><!-- end auto-generated rules list -->',

          'docs/rules/no-foo.md': '',

          // Needed for some of the test infrastructure to work.
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
        });
      });
      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });
      it('determines the correct plugin prefix', async function () {
        await generate('.');
        expect(readFileSync('docs/rules/no-foo.md', 'utf8')).toMatchSnapshot();
      });
    });

    describe('No configs found', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            main: 'index.js',
            type: 'module',
          }),

          'index.js': `
            export default {
              rules: {
                'no-foo': {
                  meta: { docs: { description: 'disallow foo.' }, },
                  create(context) {}
                },
              }
            };`,

          'README.md':
            '<!-- begin auto-generated rules list --><!-- end auto-generated rules list -->',

          'docs/rules/no-foo.md': '',

          // Needed for some of the test infrastructure to work.
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
        });
      });
      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });
      it('omits the config column', async function () {
        await generate('.');
        expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();
        expect(readFileSync('docs/rules/no-foo.md', 'utf8')).toMatchSnapshot();
      });
    });

    describe('No exported rules object found', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            main: 'index.js',
            type: 'module',
          }),

          'index.js': 'export default {};',

          'README.md':
            '<!-- begin auto-generated rules list --><!-- end auto-generated rules list -->',

          'docs/rules/no-foo.md': '',

          // Needed for some of the test infrastructure to work.
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
        });
      });
      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });
      it('throws an error', async function () {
        await expect(generate('.')).rejects.toThrowErrorMatchingSnapshot();
      });
    });

    describe('CJS (non-ESM)', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            main: 'index.cjs',
            type: 'commonjs', // ts-jest doesn't seem to respect this `type`, so we have to use .cjs extension.
          }),

          'index.cjs': `module.exports = {
            rules: {
              'no-foo': {
                meta: { docs: { description: 'disallow foo.' }, },
                create(context) {}
              },
            },
          };`,

          'README.md':
            '<!-- begin auto-generated rules list --><!-- end auto-generated rules list -->',

          'docs/rules/no-foo.md': '',

          // Needed for some of the test infrastructure to work.
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
        });
      });
      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });
      it('generates the documentation', async function () {
        await generate('.');

        expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();

        expect(readFileSync('docs/rules/no-foo.md', 'utf8')).toMatchSnapshot();
      });
    });

    describe('package.json using exports, as string', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            exports: './index.js',
          }),

          'index.js': `export default {
            rules: {
              'no-foo': {
                meta: { docs: { description: 'disallow foo.' }, },
                create(context) {}
              },
            },
          };`,

          'README.md':
            '<!-- begin auto-generated rules list --><!-- end auto-generated rules list -->',

          'docs/rules/no-foo.md': '',

          // Needed for some of the test infrastructure to work.
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
        });
      });
      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });
      it('finds the entry point', async function () {
        await expect(generate('.')).resolves.toBeUndefined();
      });
    });

    describe('package.json using exports, object with dot', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            exports: { '.': './index-foo.js' },
          }),

          'index-foo.js': `export default {
            rules: {
              'no-foo': {
                meta: { docs: { description: 'disallow foo.' }, },
                create(context) {}
              },
            },
          };`,

          'README.md':
            '<!-- begin auto-generated rules list --><!-- end auto-generated rules list -->',

          'docs/rules/no-foo.md': '',

          // Needed for some of the test infrastructure to work.
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
        });
      });
      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });
      it('finds the entry point', async function () {
        await expect(generate('.')).resolves.toBeUndefined();
      });
    });

    describe('package.json using exports, with unsupported entry point file type', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            exports: './index.json',
          }),

          'index.js': `export default {
            rules: {
              'no-foo': {
                meta: { docs: { description: 'disallow foo.' }, },
                create(context) {}
              },
            },
          };`,

          'README.md':
            '<!-- begin auto-generated rules list --><!-- end auto-generated rules list -->',

          'docs/rules/no-foo.md': '',

          // Needed for some of the test infrastructure to work.
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
        });
      });
      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });
      it('throws an error', async function () {
        await expect(
          generate('.', { configEmoji: ['foo,bar,baz'] })
        ).rejects.toThrow(
          'Unsupported file type for plugin entry point. Current types supported: .js, .cjs, .mjs. Entry point detected: ./index.json'
        );
      });
    });

    beforeEach(function () {
      // We have to clear the prettier cache between tests for this to work.
      prettier.clearConfigCache();
    });

    describe('no prettier config', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            type: 'module',
          }),

          'index.js': `
                    export default {
                      rules: {
                        'no-foo': {
                          meta: { docs: { description: 'Description of no-foo.' }, fixable: 'code' },
                          create(context) {}
                        },
                      },
                    };`,

          'README.md':
            '<!-- begin auto-generated rules list --><!-- end auto-generated rules list -->',

          'docs/rules/no-foo.md': outdent`
            ## Rule details
            details
            Long line that SHOULD NOT get wrapped by prettier since it's outside the header. Long line that SHOULD NOT get wrapped by prettier since it's outside the header."
          `,

          // Needed for some of the test infrastructure to work.
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
        });
      });

      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });

      it('generates the documentation', async function () {
        await generate('.');

        expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();

        expect(readFileSync('docs/rules/no-foo.md', 'utf8')).toMatchSnapshot();
      });
    });

    describe('uses prettier config from package.json', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            type: 'module',
            prettier: { proseWrap: 'always', printWidth: 20 },
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
                    },
                  }
                };`,

          'README.md':
            '<!-- begin auto-generated rules list --><!-- end auto-generated rules list -->',

          'docs/rules/no-foo.md': outdent`
            ## Rule details
            details
            Long line that SHOULD NOT get wrapped by prettier since it's outside the header. Long line that SHOULD NOT get wrapped by prettier since it's outside the header.
          `,

          // Needed for some of the test infrastructure to work.
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
        });
      });

      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });

      it('should wrap prose in rule doc header to just 20 chars', async function () {
        await generate('.');

        expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();

        expect(readFileSync('docs/rules/no-foo.md', 'utf8')).toMatchSnapshot();
      });
    });

    describe('with one blank line around comment markers', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            type: 'module',
          }),

          'index.js': `
                    export default {
                      rules: {
                        'no-foo': {
                          meta: { docs: { description: 'Description of no-foo.' }, fixable: 'code' },
                          create(context) {}
                        },
                      },
                    };`,

          'README.md': outdent`
            # Rules

            One blank line after this.

            <!-- begin auto-generated rules list -->


            <!-- end auto-generated rules list -->

            One blank line before this.
          `,

          'docs/rules/no-foo.md': outdent`
            <!-- end auto-generated rule header -->

            One blank line before this.
          `,

          // Needed for some of the test infrastructure to work.
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
        });
      });

      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });

      it('generates the documentation', async function () {
        await generate('.');

        expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();

        expect(readFileSync('docs/rules/no-foo.md', 'utf8')).toMatchSnapshot();
      });
    });

    describe('with no blank lines around comment markers', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            type: 'module',
          }),

          'index.js': `
                    export default {
                      rules: {
                        'no-foo': {
                          meta: { docs: { description: 'Description of no-foo.' }, fixable: 'code' },
                          create(context) {}
                        },
                      },
                    };`,

          'README.md': outdent`
            # Rules

            No blank line after this.
            <!-- begin auto-generated rules list -->
            <!-- end auto-generated rules list -->
            No blank line before this.
          `,

          'docs/rules/no-foo.md': outdent`
            <!-- end auto-generated rule header -->
            No blank line before this.
          `,

          // Needed for some of the test infrastructure to work.
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
        });
      });

      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });

      it('generates the documentation', async function () {
        await generate('.');

        expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();

        expect(readFileSync('docs/rules/no-foo.md', 'utf8')).toMatchSnapshot();
      });
    });

    describe('no existing comment markers - with no blank lines in existing content', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            type: 'module',
          }),

          'index.js': `
                    export default {
                      rules: {
                        'no-foo': {
                          meta: { docs: { description: 'Description of no-foo.' }, fixable: 'code' },
                          create(context) {}
                        },
                      },
                    };`,

          'README.md': outdent`
            ## Rules
            Existing rules section content.
          `,

          'docs/rules/no-foo.md': outdent`
            # no-foo
            Existing rule doc content.
          `,

          // Needed for some of the test infrastructure to work.
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
        });
      });

      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });

      it('generates the documentation', async function () {
        await generate('.');

        expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();

        expect(readFileSync('docs/rules/no-foo.md', 'utf8')).toMatchSnapshot();
      });
    });

    describe('no existing comment markers - with one blank line around existing content', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            type: 'module',
          }),

          'index.js': `
                    export default {
                      rules: {
                        'no-foo': {
                          meta: { docs: { description: 'Description of no-foo.' }, fixable: 'code' },
                          create(context) {}
                        },
                      },
                    };`,

          'README.md': outdent`
            ## Rules

            Existing rules section content.
          `,

          'docs/rules/no-foo.md': outdent`
            # no-foo

            Existing rule doc content.
          `,

          // Needed for some of the test infrastructure to work.
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
        });
      });

      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });

      it('generates the documentation', async function () {
        await generate('.');

        expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();

        expect(readFileSync('docs/rules/no-foo.md', 'utf8')).toMatchSnapshot();
      });
    });

    describe('no existing comment markers - minimal doc content', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            type: 'module',
          }),

          'index.js': `
                    export default {
                      rules: {
                        'no-foo': {
                          meta: { docs: { description: 'Description of no-foo.' }, fixable: 'code' },
                          create(context) {}
                        },
                      },
                    };`,

          'README.md': '## Rules\n',

          'docs/rules/no-foo.md': '',

          // Needed for some of the test infrastructure to work.
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
        });
      });

      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });

      it('generates the documentation', async function () {
        await generate('.');

        expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();

        expect(readFileSync('docs/rules/no-foo.md', 'utf8')).toMatchSnapshot();
      });
    });

    describe('config that extends another config', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            main: 'index.cjs',
            type: 'commonjs',
          }),

          'index.cjs': `
            module.exports = {
              rules: {
                'no-foo': {
                  meta: { docs: { description: 'Description of no-foo.' }, },
                  create(context) {}
                },
                'no-bar': {
                  meta: { docs: { description: 'Description of no-bar.' }, },
                  create(context) {}
                },
                'no-baz': {
                  meta: { docs: { description: 'Description of no-baz.' }, },
                  create(context) {}
                },
                'no-biz': {
                  meta: { docs: { description: 'Description of no-biz.' }, },
                  create(context) {}
                },
              },
              configs: {
                recommended: {
                  extends: [
                    require.resolve('./base-config'),
                    // Should ignore these since they're external:
                    'eslint:recommended',
                    'plugin:some-plugin/recommended',
                    'prettier',
                  ],
                }
              }
            };`,

          // Multi-level nested config with `rules` and `extends`.
          'base-config.cjs': `
            module.exports = {
              extends: [require.resolve("./base-base-config")],
              rules: { "test/no-foo": "error" },
              overrides: [{
                extends: [require.resolve("./override-config")],
                files: ["*.js"],
                rules: { "test/no-baz": "error" },
              }]
            };`,

          // Multi-level nested config with no `rules` and string (non-array) version of `extends`.
          'base-base-config.cjs':
            'module.exports = { extends: require.resolve("./base-base-base-config") };',

          // Multi-level nested config with no further `extends`.
          'base-base-base-config.cjs':
            'module.exports = { rules: { "test/no-bar": "error" } };',

          // Config extended from an override.
          'override-config.cjs':
            'module.exports = { rules: { "test/no-biz": "error" } };',

          'README.md': '## Rules\n',

          'docs/rules/no-foo.md': '',
          'docs/rules/no-bar.md': '',
          'docs/rules/no-baz.md': '',
          'docs/rules/no-biz.md': '',

          // Needed for some of the test infrastructure to work.
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
        });
      });

      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });

      it('generates the documentation', async function () {
        await generate('.');
        expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();
        expect(readFileSync('docs/rules/no-foo.md', 'utf8')).toMatchSnapshot();
        expect(readFileSync('docs/rules/no-bar.md', 'utf8')).toMatchSnapshot();
        expect(readFileSync('docs/rules/no-baz.md', 'utf8')).toMatchSnapshot();
        expect(readFileSync('docs/rules/no-biz.md', 'utf8')).toMatchSnapshot();
      });
    });

    describe('config with overrides', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            main: 'index.js',
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
                recommended: {
                  overrides: [{
                    files: ['**/foo.js'],
                    rules: {
                      'test/no-foo': 'error',
                    }
                  }]
                },
              }
            };`,

          'README.md': '## Rules\n',

          'docs/rules/no-foo.md': '',

          // Needed for some of the test infrastructure to work.
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
        });
      });

      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });

      it('generates the documentation', async function () {
        await generate('.');
        expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();
        expect(readFileSync('docs/rules/no-foo.md', 'utf8')).toMatchSnapshot();
      });
    });

    describe('rule config with options', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            main: 'index.js',
            type: 'module',
          }),

          'index.js': `
            export default {
              rules: {
                'no-foo': {
                  meta: { docs: { description: 'Description of no-foo.' }, },
                  create(context) {},
                  schema: [{ /* some options */ }]
                },
              },
              configs: {
                recommended: {
                  rules: {
                    'test/no-foo': ['error', { /* some options */ }],
                  }
                },
              }
            };`,

          'README.md': '## Rules\n',

          'docs/rules/no-foo.md': '',

          // Needed for some of the test infrastructure to work.
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
        });
      });

      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });

      it('generates the documentation', async function () {
        await generate('.');
        expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();
        expect(readFileSync('docs/rules/no-foo.md', 'utf8')).toMatchSnapshot();
      });
    });

    describe('rules that are disabled or set to warn', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            main: 'index.js',
            type: 'module',
          }),

          'index.js': `
            export default {
              rules: {
                'no-foo': {
                  meta: { docs: { description: 'Description of no-foo.' }, },
                  create(context) {},
                },
                'no-bar': {
                  meta: { docs: { description: 'Description of no-bar.' }, },
                  create(context) {},
                },
                'no-baz': {
                  meta: { docs: { description: 'Description of no-baz.' }, },
                  create(context) {},
                },
                'no-biz': {
                  meta: { docs: { description: 'Description of no-biz.' }, },
                  create(context) {},
                },
                'no-boz': {
                  meta: { docs: { description: 'Description of no-boz.' }, },
                  create(context) {},
                },
                'no-buz': {
                  meta: { docs: { description: 'Description of no-buz.' }, },
                  create(context) {},
                },
                'no-bez': {
                  meta: { docs: { description: 'Description of no-bez.' }, },
                  create(context) {},
                },
              },
              configs: {
                recommended: {
                  rules: {
                    'test/no-foo': 'off',
                    'test/no-bar': 0,
                    'test/no-baz': 'error',
                    'test/no-boz': 'warn',
                    'test/no-buz': 1,
                  }
                },
                other: {
                  rules: {
                    'test/no-bar': 0,
                    'test/no-baz': 'off',
                    'test/no-biz': 'off',
                    'test/no-buz': 'warn',
                    'test/no-bez': 'warn',
                  }
                },
              }
            };`,

          'README.md': '## Rules\n',

          'docs/rules/no-foo.md': '',
          'docs/rules/no-bar.md': '',
          'docs/rules/no-baz.md': '',
          'docs/rules/no-biz.md': '',
          'docs/rules/no-boz.md': '',
          'docs/rules/no-buz.md': '',
          'docs/rules/no-bez.md': '',

          // Needed for some of the test infrastructure to work.
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
        });
      });

      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });

      it('generates the documentation', async function () {
        await generate('.');
        expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();
        expect(readFileSync('docs/rules/no-foo.md', 'utf8')).toMatchSnapshot();
        expect(readFileSync('docs/rules/no-bar.md', 'utf8')).toMatchSnapshot();
        expect(readFileSync('docs/rules/no-baz.md', 'utf8')).toMatchSnapshot();
        expect(readFileSync('docs/rules/no-biz.md', 'utf8')).toMatchSnapshot();
        expect(readFileSync('docs/rules/no-boz.md', 'utf8')).toMatchSnapshot();
        expect(readFileSync('docs/rules/no-buz.md', 'utf8')).toMatchSnapshot();
        expect(readFileSync('docs/rules/no-bez.md', 'utf8')).toMatchSnapshot();
      });
    });

    describe('no rules with description', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            main: 'index.js',
            type: 'module',
          }),

          'index.js': `
            export default {
              rules: {
                'no-foo': {
                  meta: { },
                  create(context) {},
                },
              },
            };`,

          'README.md': '## Rules\n',

          'docs/rules/no-foo.md': '',

          // Needed for some of the test infrastructure to work.
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
        });
      });

      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });

      it('generates the documentation', async function () {
        await generate('.');
        expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();
        expect(readFileSync('docs/rules/no-foo.md', 'utf8')).toMatchSnapshot();
      });
    });

    describe('one rule missing description', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            main: 'index.js',
            type: 'module',
          }),

          'index.js': `
            export default {
              rules: {
                'no-foo': {
                  meta: { docs: { description: 'Description for no-foo.'} },
                  create(context) {},
                },
                'no-bar': {
                  meta: { },
                  create(context) {},
                },
              },
            };`,

          'README.md': '## Rules\n',

          'docs/rules/no-foo.md': '',
          'docs/rules/no-bar.md': '',

          // Needed for some of the test infrastructure to work.
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
        });
      });

      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });

      it('generates the documentation', async function () {
        await generate('.');
        expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();
        expect(readFileSync('docs/rules/no-foo.md', 'utf8')).toMatchSnapshot();
        expect(readFileSync('docs/rules/no-bar.md', 'utf8')).toMatchSnapshot();
      });
    });

    describe('deprecated function-style rule', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            main: 'index.js',
            type: 'module',
          }),

          'index.js': `
            export default {
              rules: {
                'no-foo': function create () {}
              },
              configs: {
                recommended: {
                  rules: {
                    'test/no-foo': 'error',
                  }
                },
              }
            };`,

          'README.md': '## Rules\n',

          'docs/rules/no-foo.md': '',

          // Needed for some of the test infrastructure to work.
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
        });
      });

      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });

      it('generates the documentation', async function () {
        await generate('.');
        expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();
        expect(readFileSync('docs/rules/no-foo.md', 'utf8')).toMatchSnapshot();
      });
    });

    describe('rule with no meta object', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            main: 'index.js',
            type: 'module',
          }),

          'index.js': `
            export default {
              rules: {
                'no-foo': { create(context) {} },
              },
              configs: {
                recommended: {
                  rules: {
                    'test/no-foo': 'error',
                  }
                },
              }
            };`,

          'README.md': '## Rules\n',

          'docs/rules/no-foo.md': '',

          // Needed for some of the test infrastructure to work.
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
        });
      });

      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });

      it('generates the documentation', async function () {
        await generate('.');
        expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();
        expect(readFileSync('docs/rules/no-foo.md', 'utf8')).toMatchSnapshot();
      });
    });

    describe('with `--url-configs` option', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            main: 'index.js',
            type: 'module',
          }),

          'index.js': `
            export default {
              rules: {
                'no-foo': { meta: { docs: { description: 'Description for no-foo.'} }, create(context) {} },
                'no-bar': { meta: { docs: { description: 'Description for no-bar.'} }, create(context) {} },
              },
              configs: {
                recommended: {
                  rules: {
                    'test/no-foo': 'error',
                  }
                },
                customConfig: {
                  rules: {
                    'test/no-bar': 'error',
                  }
                },
              }
            };`,

          'README.md': '## Rules\n',

          'docs/rules/no-foo.md': '',
          'docs/rules/no-bar.md': '',

          // Needed for some of the test infrastructure to work.
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
        });
      });

      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });

      it('includes the config link', async function () {
        await generate('.', {
          urlConfigs: 'http://example.com/configs',
        });
        expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();
        expect(readFileSync('docs/rules/no-foo.md', 'utf8')).toMatchSnapshot();
        expect(readFileSync('docs/rules/no-bar.md', 'utf8')).toMatchSnapshot();
      });
    });

    describe('with `--url-configs` option with only recommended config', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            main: 'index.js',
            type: 'module',
          }),

          'index.js': `
            export default {
              rules: {
                'no-foo': { meta: { docs: { description: 'Description for no-foo.'} }, create(context) {} },
              },
              configs: {
                recommended: {
                  rules: {
                    'test/no-foo': 'error',
                  }
                },
              }
            };`,

          'README.md': '## Rules\n',

          'docs/rules/no-foo.md': '',

          // Needed for some of the test infrastructure to work.
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
        });
      });

      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });

      it('includes the config link', async function () {
        await generate('.', {
          urlConfigs: 'http://example.com/configs',
        });
        expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();
        expect(readFileSync('docs/rules/no-foo.md', 'utf8')).toMatchSnapshot();
      });
    });

    describe('with `--rule-doc-title-format` option = desc-parens-prefix-name', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            main: 'index.js',
            type: 'module',
          }),

          'index.js': `
            export default {
              rules: {
                'no-foo': { meta: { docs: { description: 'Description for no-foo.'} }, create(context) {} },
                'no-bar': { meta: { docs: {} }, create(context) {} }, // No description.
              },
            };`,

          'README.md': '## Rules\n',

          'docs/rules/no-foo.md': '',
          'docs/rules/no-bar.md': '',

          // Needed for some of the test infrastructure to work.
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
        });
      });

      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });

      it('uses the right rule doc title format, with fallback when missing description', async function () {
        await generate('.', {
          ruleDocTitleFormat: 'desc-parens-prefix-name',
        });
        expect(readFileSync('docs/rules/no-foo.md', 'utf8')).toMatchSnapshot();
        expect(readFileSync('docs/rules/no-bar.md', 'utf8')).toMatchSnapshot();
      });
    });

    describe('with `--rule-doc-title-format` option = desc-parens-name', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            main: 'index.js',
            type: 'module',
          }),

          'index.js': `
            export default {
              rules: {
                'no-foo': { meta: { docs: { description: 'Description for no-foo.'} }, create(context) {} },
                'no-bar': { meta: { docs: { /* one rule without description */ } }, create(context) {} },
              },
            };`,

          'README.md': '## Rules\n',

          'docs/rules/no-foo.md': '',
          'docs/rules/no-bar.md': '',

          // Needed for some of the test infrastructure to work.
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
        });
      });

      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });

      it('uses the right rule doc title format', async function () {
        await generate('.', {
          ruleDocTitleFormat: 'desc-parens-name',
        });
        expect(readFileSync('docs/rules/no-foo.md', 'utf8')).toMatchSnapshot();
        expect(readFileSync('docs/rules/no-bar.md', 'utf8')).toMatchSnapshot();
      });
    });

    describe('with `--rule-doc-title-format` option = desc', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            main: 'index.js',
            type: 'module',
          }),

          'index.js': `
            export default {
              rules: {
                'no-foo': { meta: { docs: { description: 'Description for no-foo.'} }, create(context) {} },
                'no-bar': { meta: { docs: { /* one rule without description */ } }, create(context) {} },
              },
            };`,

          'README.md': '## Rules\n',

          'docs/rules/no-foo.md': '',
          'docs/rules/no-bar.md': '',

          // Needed for some of the test infrastructure to work.
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
        });
      });

      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });

      it('uses the right rule doc title format', async function () {
        await generate('.', {
          ruleDocTitleFormat: 'desc',
        });
        expect(readFileSync('docs/rules/no-foo.md', 'utf8')).toMatchSnapshot();
        expect(readFileSync('docs/rules/no-bar.md', 'utf8')).toMatchSnapshot();
      });
    });

    describe('with `--rule-doc-title-format` option = prefix-name', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            main: 'index.js',
            type: 'module',
          }),

          'index.js': `
            export default {
              rules: {
                'no-foo': { meta: { docs: { description: 'Description for no-foo.'} }, create(context) {} },
              },
            };`,

          'README.md': '## Rules\n',

          'docs/rules/no-foo.md': '',

          // Needed for some of the test infrastructure to work.
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
        });
      });

      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });

      it('uses the right rule doc title format', async function () {
        await generate('.', {
          ruleDocTitleFormat: 'prefix-name',
        });
        expect(readFileSync('docs/rules/no-foo.md', 'utf8')).toMatchSnapshot();
      });
    });

    describe('with `--rule-doc-title-format` option = name', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            main: 'index.js',
            type: 'module',
          }),

          'index.js': `
            export default {
              rules: {
                'no-foo': { meta: { docs: { description: 'Description for no-foo.'} }, create(context) {} },
              },
            };`,

          'README.md': '## Rules\n',

          'docs/rules/no-foo.md': '',

          // Needed for some of the test infrastructure to work.
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
        });
      });

      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });

      it('uses the right rule doc title format', async function () {
        await generate('.', {
          ruleDocTitleFormat: 'name',
        });
        expect(readFileSync('docs/rules/no-foo.md', 'utf8')).toMatchSnapshot();
      });
    });

    describe('with `--rule-doc-section-include` and `--rule-doc-section-exclude` and no problems', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            main: 'index.js',
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
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
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
            main: 'index.js',
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
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
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

    describe('with --ignore-config', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            main: 'index.js',
            type: 'module',
          }),

          'index.js': `
            export default {
              rules: {
                'no-foo': { meta: { docs: { description: 'Description for no-foo.'} }, create(context) {} },
              },
              configs: {
                recommended: {
                  rules: { 'test/no-foo': 'error' },
                },
                configToIgnore: {
                  rules: { 'test/no-foo': 'error' },
                }
              }
            };`,

          'README.md': '## Rules\n',

          'docs/rules/no-foo.md': '',

          // Needed for some of the test infrastructure to work.
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
        });
      });

      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });

      it('hides the ignored config', async function () {
        await generate('.', {
          ignoreConfig: ['configToIgnore'],
          configEmoji: ['configToIgnore,😋'], // Ensure this config has an emoji that would normally display in the legend.
        });
        expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();
        expect(readFileSync('docs/rules/no-foo.md', 'utf8')).toMatchSnapshot();
      });
    });

    describe('with --check', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            main: 'index.js',
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
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
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

    describe('with --config-emoji', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            main: 'index.js',
            type: 'module',
          }),

          'index.js': `
            export default {
              rules: {
                'no-foo': { meta: { docs: { description: 'Description for no-foo.'} }, create(context) {} },
                'no-bar': { meta: { docs: { description: 'Description for no-bar.'} }, create(context) {} },
                'no-baz': { meta: { docs: { description: 'Description for no-boz.'} }, create(context) {} },
              },
              configs: {
                recommended: {
                  rules: { 'test/no-foo': 'error', 'test/no-bar': 'error' },
                },
                stylistic: {
                  rules: { 'test/no-bar': 'error', 'test/no-baz': 'error' },
                },
                configWithoutEmoji: {
                  rules: { 'test/no-baz': 'error' },
                }
              }
            };`,

          'README.md': '## Rules\n',

          'docs/rules/no-foo.md': '',
          'docs/rules/no-bar.md': '',
          'docs/rules/no-baz.md': '',

          // Needed for some of the test infrastructure to work.
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
        });
      });

      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });

      it('shows the correct emojis', async function () {
        await generate('.', {
          configEmoji: ['recommended,🔥', 'stylistic,🎨'],
        });
        expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();
        expect(readFileSync('docs/rules/no-foo.md', 'utf8')).toMatchSnapshot();
        expect(readFileSync('docs/rules/no-bar.md', 'utf8')).toMatchSnapshot();
        expect(readFileSync('docs/rules/no-baz.md', 'utf8')).toMatchSnapshot();
      });
    });

    describe('with --config-emoji and invalid format', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            main: 'index.js',
            type: 'module',
          }),

          'index.js': `
            export default {
              rules: {
                'no-foo': { meta: { docs: { description: 'Description for no-foo.'} }, create(context) {} },
              },
            };`,

          'README.md': '## Rules\n',

          'docs/rules/no-foo.md': '',

          // Needed for some of the test infrastructure to work.
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
        });
      });

      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });

      it('throws an error', async function () {
        await expect(
          generate('.', { configEmoji: ['foo,bar,baz'] })
        ).rejects.toThrow(
          'Invalid configEmoji option: foo,bar,baz. Expected format: config,emoji'
        );
      });
    });

    describe('with --config-emoji and trying to remove a default emoji that does not exist', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            main: 'index.js',
            type: 'module',
          }),

          'index.js': `
            export default {
              rules: {
                'no-foo': { meta: { docs: { description: 'Description for no-foo.'} }, create(context) {} },
              },
            };`,

          'README.md': '## Rules\n',

          'docs/rules/no-foo.md': '',

          // Needed for some of the test infrastructure to work.
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
        });
      });

      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });

      it('throws an error', async function () {
        await expect(
          generate('.', { configEmoji: ['config-without-default-emoji'] })
        ).rejects.toThrow(
          'Invalid configEmoji option: config-without-default-emoji. Expected format: config,emoji'
        );
      });
    });

    describe('with --config-emoji and removing default emoji for a config', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            main: 'index.js',
            type: 'module',
          }),

          'index.js': `
            export default {
              rules: {
                'no-foo': { meta: { docs: { description: 'Description for no-foo.'} }, create(context) {} },
              },
              configs: {
                recommended: { rules: { 'test/no-foo': 'error' } },
              }
            };`,

          'README.md': '## Rules\n',

          'docs/rules/no-foo.md': '',

          // Needed for some of the test infrastructure to work.
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
        });
      });

      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });

      it('reverts to using a badge for the config', async function () {
        await generate('.', {
          configEmoji: ['recommended'],
        });
        expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();
        expect(readFileSync('docs/rules/no-foo.md', 'utf8')).toMatchSnapshot();
      });
    });

    describe('with --config-emoji and non-existent config', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            main: 'index.js',
            type: 'module',
          }),

          'index.js': `
            export default {
              rules: {
                'no-foo': { meta: { docs: { description: 'Description for no-foo.'} }, create(context) {} },
              },
              configs: {}
            };`,

          'README.md': '## Rules\n',

          'docs/rules/no-foo.md': '',

          // Needed for some of the test infrastructure to work.
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
        });
      });

      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });

      it('throws an error', async function () {
        await expect(
          generate('.', { configEmoji: ['config-does-not-exist,🔥'] })
        ).rejects.toThrow(
          'Invalid configEmoji option: config-does-not-exist config not found.'
        );
      });
    });

    describe('with --config-emoji and using the general configs emoji for the sole config', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            main: 'index.js',
            type: 'module',
          }),

          'index.js': `
            export default {
              rules: {
                'no-foo': { meta: { docs: { description: 'Description for no-foo.'} }, create(context) {} },
              },
              configs: {
                recommended: { rules: { 'test/no-foo': 'error' } },
              }
            };`,

          'README.md': '## Rules\n',

          'docs/rules/no-foo.md': '',

          // Needed for some of the test infrastructure to work.
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
        });
      });

      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });

      it('hides the generic config emoji legend to avoid two legends for the same emoji', async function () {
        await generate('.', {
          configEmoji: [`recommended,${EMOJI_CONFIG}`],
        });
        expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();
        expect(readFileSync('docs/rules/no-foo.md', 'utf8')).toMatchSnapshot();
      });
    });

    describe('with --config-emoji and using the general configs emoji for a config but multiple configs present', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            main: 'index.js',
            type: 'module',
          }),

          'index.js': `
            export default {
              rules: {
                'no-foo': { meta: { docs: { description: 'Description for no-foo.'} }, create(context) {} },
              },
              configs: {
                recommended: { rules: { 'test/no-foo': 'error' } },
                style: { rules: { 'test/no-foo': 'error' } },
              }
            };`,

          'README.md': '## Rules\n',

          'docs/rules/no-foo.md': '',

          // Needed for some of the test infrastructure to work.
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
        });
      });

      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });

      it('throws an error', async function () {
        await expect(
          generate('.', { configEmoji: [`recommended,${EMOJI_CONFIG}`] })
        ).rejects.toThrow(
          `Cannot use the general configs emoji ${EMOJI_CONFIG} for an individual config when multiple configs are present.`
        );
      });
    });

    describe('with one config that does not have emoji', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            main: 'index.js',
            type: 'module',
          }),

          'index.js': `
            export default {
              rules: {
                'no-foo': { meta: { docs: { description: 'Description for no-foo.'} }, create(context) {} },
              },
              configs: {
                configWithoutEmoji: { rules: { 'test/no-foo': 'error' } },
              }
            };`,

          'README.md': '## Rules\n',

          'docs/rules/no-foo.md': '',

          // Needed for some of the test infrastructure to work.
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
        });
      });

      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });

      it('shows the default config emoji', async function () {
        await generate('.');
        expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();
        expect(readFileSync('docs/rules/no-foo.md', 'utf8')).toMatchSnapshot();
      });
    });

    describe('with --rule-list-columns', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            main: 'index.js',
            type: 'module',
          }),

          'index.js': `
            export default {
              rules: {
                'no-foo': {
                  meta: {
                    docs: { description: 'Description for no-foo.' },
                    hasSuggestions: true,
                    fixable: 'code',
                    deprecated: true,
                  },
                  create(context) {}
                },
              },
            };`,

          'README.md': '## Rules\n',

          'docs/rules/no-foo.md': '',

          // Needed for some of the test infrastructure to work.
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
        });
      });

      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });

      it('shows the right columns and legend', async function () {
        await generate('.', {
          ruleListColumns: 'hasSuggestions,fixable,name',
        });
        expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();
        expect(readFileSync('docs/rules/no-foo.md', 'utf8')).toMatchSnapshot();
      });
    });

    describe('with --rule-list-columns and non-existent column', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            main: 'index.js',
            type: 'module',
          }),

          'index.js': `
            export default {
              rules: {
                'no-foo': { meta: { docs: { description: 'Description for no-foo.'} }, create(context) {} },
              },
            };`,

          'README.md': '## Rules\n',

          'docs/rules/no-foo.md': '',

          // Needed for some of the test infrastructure to work.
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
        });
      });

      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });

      it('throws an error', async function () {
        await expect(
          generate('.', { ruleListColumns: 'name,non-existent' })
        ).rejects.toThrow('Invalid ruleListColumns option: non-existent');
      });
    });

    describe('with --rule-list-columns and duplicate column', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            main: 'index.js',
            type: 'module',
          }),

          'index.js': `
            export default {
              rules: {
                'no-foo': { meta: { docs: { description: 'Description for no-foo.'} }, create(context) {} },
              },
            };`,

          'README.md': '## Rules\n',

          'docs/rules/no-foo.md': '',

          // Needed for some of the test infrastructure to work.
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
        });
      });

      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });

      it('throws an error', async function () {
        await expect(
          generate('.', { ruleListColumns: 'name,name' })
        ).rejects.toThrow(
          'Duplicate value detected in ruleListColumns option.'
        );
      });
    });

    describe('with --rule-doc-notices', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            main: 'index.js',
            type: 'module',
          }),

          'index.js': `
            export default {
              rules: {
                'no-foo': {
                  meta: {
                    docs: { description: 'Description for no-foo.' },
                    hasSuggestions: true,
                    fixable: 'code',
                    deprecated: true,
                    type: 'problem'
                  },
                  create(context) {}
                },
              },
            };`,

          'README.md': '## Rules\n',

          'docs/rules/no-foo.md': '',

          // Needed for some of the test infrastructure to work.
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
        });
      });

      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });

      it('shows the right rule doc notices', async function () {
        await generate('.', {
          ruleDocNotices: 'hasSuggestions,fixable,deprecated,type', // Random values including an optional notice.
        });
        expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();
        expect(readFileSync('docs/rules/no-foo.md', 'utf8')).toMatchSnapshot();
      });
    });

    describe('with --rule-doc-notices and non-existent notice', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            main: 'index.js',
            type: 'module',
          }),

          'index.js': `
            export default {
              rules: {
                'no-foo': { meta: { docs: { description: 'Description for no-foo.'} }, create(context) {} },
              },
            };`,

          'README.md': '## Rules\n',

          'docs/rules/no-foo.md': '',

          // Needed for some of the test infrastructure to work.
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
        });
      });

      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });

      it('throws an error', async function () {
        await expect(
          generate('.', { ruleDocNotices: 'fixable,non-existent' })
        ).rejects.toThrow('Invalid ruleDocNotices option: non-existent');
      });
    });

    describe('with --rule-doc-notices and duplicate notice', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            main: 'index.js',
            type: 'module',
          }),

          'index.js': `
            export default {
              rules: {
                'no-foo': { meta: { docs: { description: 'Description for no-foo.'} }, create(context) {} },
              },
            };`,

          'README.md': '## Rules\n',

          'docs/rules/no-foo.md': '',

          // Needed for some of the test infrastructure to work.
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
        });
      });

      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });

      it('throws an error', async function () {
        await expect(
          generate('.', { ruleDocNotices: 'fixable,fixable' })
        ).rejects.toThrow('Duplicate value detected in ruleDocNotices option.');
      });
    });

    describe('rule with type, type column not enabled', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            main: 'index.js',
            type: 'module',
          }),

          'index.js': `
            export default {
              rules: {
                'no-foo': { meta: { type: 'problem' }, create(context) {} },
              },
            };`,

          'README.md': '## Rules\n',

          'docs/rules/no-foo.md': '',

          // Needed for some of the test infrastructure to work.
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
        });
      });

      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });

      it('hides the type column', async function () {
        await generate('.');
        expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();
        expect(readFileSync('docs/rules/no-foo.md', 'utf8')).toMatchSnapshot();
      });
    });

    describe('rule with type, type column enabled', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            main: 'index.js',
            type: 'module',
          }),

          'index.js': `
            export default {
              rules: {
                'no-foo': { meta: { type: 'problem' }, create(context) {} },
                'no-bar': { meta: { type: 'suggestion' }, create(context) {} },
                'no-biz': { meta: { type: 'layout' }, create(context) {} },
                'no-boz': { meta: { type: 'unknown' }, create(context) {} },
                'no-buz': { meta: { /* no type*/ }, create(context) {} },
              },
            };`,

          'README.md': '## Rules\n',

          'docs/rules/no-foo.md': '',
          'docs/rules/no-bar.md': '',
          'docs/rules/no-biz.md': '',
          'docs/rules/no-boz.md': '',
          'docs/rules/no-buz.md': '',

          // Needed for some of the test infrastructure to work.
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
        });
      });

      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });

      it('displays the type', async function () {
        await generate('.', { ruleListColumns: 'name,type' });
        expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();
        expect(readFileSync('docs/rules/no-foo.md', 'utf8')).toMatchSnapshot();
        expect(readFileSync('docs/rules/no-bar.md', 'utf8')).toMatchSnapshot();
        expect(readFileSync('docs/rules/no-biz.md', 'utf8')).toMatchSnapshot();
        expect(readFileSync('docs/rules/no-boz.md', 'utf8')).toMatchSnapshot();
        expect(readFileSync('docs/rules/no-buz.md', 'utf8')).toMatchSnapshot();
      });
    });

    describe('rule with type, type column enabled, but only an unknown type', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            main: 'index.js',
            type: 'module',
          }),

          'index.js': `
            export default {
              rules: {
                'no-foo': { meta: { type: 'unknown' }, create(context) {} },
              },
            };`,

          'README.md': '## Rules\n',

          'docs/rules/no-foo.md': '',

          // Needed for some of the test infrastructure to work.
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
        });
      });

      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });

      it('hides the type column and notice', async function () {
        await generate('.', { ruleListColumns: 'name,type' });
        expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();
        expect(readFileSync('docs/rules/no-foo.md', 'utf8')).toMatchSnapshot();
      });
    });

    describe('splitting list by type', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            main: 'index.js',
            type: 'module',
          }),

          'index.js': `
            export default {
              rules: {
                'no-foo': { meta: { type: 'problem' }, create(context) {} },
                'no-bar': { meta: { type: 'suggestion' }, create(context) {} },
                'no-baz': { meta: { type: 'suggestion' }, create(context) {} },
                'no-biz': { meta: { /* no type */ }, create(context) {} },
              },
            };`,

          'README.md': '## Rules\n',

          'docs/rules/no-foo.md': '',
          'docs/rules/no-bar.md': '',
          'docs/rules/no-baz.md': '',
          'docs/rules/no-biz.md': '',

          // Needed for some of the test infrastructure to work.
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
        });
      });

      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });

      it('splits the list', async function () {
        await generate('.', {
          splitBy: 'meta.type',
        });
        expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();
      });
    });

    describe('splitting list by nested property meta.docs.category', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            main: 'index.js',
            type: 'module',
          }),

          'index.js': `
            export default {
              rules: {
                'no-foo': { meta: { docs: { category: 'fruits' } }, create(context) {} },
                'no-bar': { meta: { docs: { category: 'candy' } }, create(context) {} },
                'no-baz': { meta: { /* no nested object */ }, create(context) {} },
              },
            };`,

          'README.md': '## Rules\n',

          'docs/rules/no-foo.md': '',
          'docs/rules/no-bar.md': '',
          'docs/rules/no-baz.md': '',

          // Needed for some of the test infrastructure to work.
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
        });
      });

      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });

      it('splits the list', async function () {
        await generate('.', { splitBy: 'meta.docs.category' });
        expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();
      });
    });

    describe('splitting list, with boolean', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            main: 'index.js',
            type: 'module',
          }),

          'index.js': `
            export default {
              rules: {
                'no-foo': { meta: { hasSuggestions: true }, create(context) {} },
                'no-bar': { meta: {  }, create(context) {} },
                'no-baz': { meta: { hasSuggestions: false }, create(context) {} },
              },
            };`,

          'README.md': '## Rules\n',

          'docs/rules/no-foo.md': '',
          'docs/rules/no-bar.md': '',
          'docs/rules/no-baz.md': '',

          // Needed for some of the test infrastructure to work.
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
        });
      });

      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });

      it('splits the list', async function () {
        await generate('.', {
          splitBy: 'meta.hasSuggestions',
        });
        expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();
      });
    });

    describe('splitting list, ignores case', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            main: 'index.js',
            type: 'module',
          }),

          'index.js': `
            export default {
              rules: {
                'no-foo': { meta: { foo: 'c' }, create(context) {} },
                'no-bar': { meta: { foo: 'a' }, create(context) {} },
                'no-baz': { meta: { foo: 'B' }, create(context) {} },
              },
            };`,

          'README.md': '## Rules\n',

          'docs/rules/no-foo.md': '',
          'docs/rules/no-bar.md': '',
          'docs/rules/no-baz.md': '',

          // Needed for some of the test infrastructure to work.
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
        });
      });

      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });

      it('splits the list', async function () {
        await generate('.', {
          splitBy: 'meta.foo',
        });
        expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();
      });
    });

    describe('splitting list, with unknown variable type', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            main: 'index.js',
            type: 'module',
          }),

          'index.js': `
            export default {
              rules: {
                'no-foo': { 'foo_barBIZ-baz3bOz': false, meta: { }, create(context) {} },
                'no-bar': { 'foo_barBIZ-baz3bOz': true, meta: { }, create(context) {} },
              },
            };`,

          'README.md': '## Rules\n',

          'docs/rules/no-foo.md': '',
          'docs/rules/no-bar.md': '',

          // Needed for some of the test infrastructure to work.
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
        });
      });

      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });

      it('splits the list but does not attempt to convert variable name to title', async function () {
        await generate('.', {
          splitBy: 'foo_barBIZ-baz3bOz',
        });
        expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();
      });
    });

    describe('splitting list, with one sub-list having no rules enabled by the config', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            main: 'index.js',
            type: 'module',
          }),

          'index.js': `
            export default {
              rules: {
                'no-foo': { 'type': 'foo', meta: { }, create(context) {} },
                'no-bar': { 'type': 'bar', meta: { }, create(context) {} },
              },
              configs: {
                recommended: { rules: { 'test/no-foo': 'error' } },
              }
            };`,

          'README.md': '## Rules\n',

          'docs/rules/no-foo.md': '',
          'docs/rules/no-bar.md': '',

          // Needed for some of the test infrastructure to work.
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
        });
      });

      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });

      it('splits the list and still uses recommended config emoji in both lists', async function () {
        await generate('.', {
          splitBy: 'type',
        });
        expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();
      });
    });

    describe('splitting list by property that no rules have', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            main: 'index.js',
            type: 'module',
          }),

          'index.js': `
            export default {
              rules: {
                'no-foo': { meta: {  }, create(context) {} },
              },
            };`,

          'README.md': '## Rules\n',

          'docs/rules/no-foo.md': '',

          // Needed for some of the test infrastructure to work.
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
        });
      });

      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });

      it('throws an error', async function () {
        await expect(
          generate('.', { splitBy: 'non-existent-property' })
        ).rejects.toThrow(
          'No rules found with --split-by property "non-existent-property".'
        );
      });
    });

    describe('rule with long-enough description to require name column wrapping avoidance', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            main: 'index.js',
            type: 'module',
          }),

          'index.js': `
            export default {
              rules: {
                'no-foo': { meta: { docs: { description: 'over 60 chars over 60 chars over 60 chars over 60 chars over 60 chars over 60 chars'} }, create(context) {} },
              },
            };`,

          'README.md': '## Rules\n',

          'docs/rules/no-foo.md': '',

          // Needed for some of the test infrastructure to work.
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
        });
      });

      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });

      it('adds spaces to the name column', async function () {
        await generate('.');
        expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();
        expect(readFileSync('docs/rules/no-foo.md', 'utf8')).toMatchSnapshot();
      });
    });

    describe('rule with long-enough description to require name column wrapping avoidance but rule name too short', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            main: 'index.js',
            type: 'module',
          }),

          'index.js': `
            export default {
              rules: {
                'foo': { meta: { docs: { description: 'over 60 chars over 60 chars over 60 chars over 60 chars over 60 chars over 60 chars'} }, create(context) {} },
              },
            };`,

          'README.md': '## Rules\n',

          'docs/rules/foo.md': '',

          // Needed for some of the test infrastructure to work.
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
        });
      });

      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });

      it('does not add spaces to name column', async function () {
        await generate('.');
        expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();
        expect(readFileSync('docs/rules/foo.md', 'utf8')).toMatchSnapshot();
      });
    });

    describe('sorting rules and configs case-insensitive', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            main: 'index.js',
            type: 'module',
          }),

          'index.js': `
            export default {
              rules: {
                'c': { meta: { docs: {} }, create(context) {} },
                'a': { meta: { docs: {} }, create(context) {} },
                'B': { meta: { docs: {} }, create(context) {} },
              },
              configs: {
                'c': { rules: { 'test/a': 'error', } },
                'a': { rules: { 'test/a': 'error', } },
                'B': { rules: { 'test/a': 'error', } },
              }
            };`,

          'README.md': '## Rules\n',

          'docs/rules/a.md': '',
          'docs/rules/B.md': '',
          'docs/rules/c.md': '',

          // Needed for some of the test infrastructure to work.
          node_modules: mockFs.load(
            resolve(__dirname, '..', '..', 'node_modules')
          ),
        });
      });

      afterEach(function () {
        mockFs.restore();
        jest.resetModules();
      });

      it('sorts correctly', async function () {
        await generate('.');
        expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();
        expect(readFileSync('docs/rules/a.md', 'utf8')).toMatchSnapshot();
        expect(readFileSync('docs/rules/B.md', 'utf8')).toMatchSnapshot();
        expect(readFileSync('docs/rules/c.md', 'utf8')).toMatchSnapshot();
      });
    });
  });
});
