import { generate } from '../../lib/generator.js';
import mockFs from 'mock-fs';
import { outdent } from 'outdent';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { jest } from '@jest/globals';
import * as sinon from 'sinon';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Create a mock-fs workspace filesystem for temporary usage in this test because changes will be written to some files.

describe('generator', function () {
  describe('#generate', function () {
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
            <!-- begin rules list -->
            ...
            <!-- end rules list -->
            more content.
          `,

          // RULE DOC FILES

          'docs/rules/no-foo.md': outdent`
            # title (rule-name)
            description
            <!-- end rule header -->
            ## Rule details
            details
            ## Options
            optionToDoSomething1 - explanation
            optionToDoSomething2 - explanation
            Long line that SHOULD NOT get wrapped due to prettier proseWrap config. Long line that SHOULD NOT get wrapped due to prettier proseWrap config.
          `, // rule doc with incorrect header content
          'docs/rules/no-bar.md': outdent`
            <!-- end rule header -->
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

          'README.md': '<!-- begin rules list --><!-- end rules list -->',

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

          'README.md': '<!-- begin rules list --><!-- end rules list -->',

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
              },
              configs: {}
            };`,

          'README.md': '<!-- begin rules list --><!-- end rules list -->',

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

      it('updates the documentation', async function () {
        await generate('.');

        expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();

        expect(readFileSync('docs/rules/no-foo.md', 'utf8')).toMatchSnapshot();
        expect(readFileSync('docs/rules/no-bar.md', 'utf8')).toMatchSnapshot();
        expect(readFileSync('docs/rules/no-baz.md', 'utf8')).toMatchSnapshot();
      });
    });

    describe('deprecated rule with no rule doc nor meta.docs', function () {
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
                  meta: { deprecated: true, }, // No docs specified.
                  create(context) {}
                },
              },
              configs: {}
            };`,

          'README.md': '<!-- begin rules list --><!-- end rules list -->',

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
      });
    });

    describe('uses prettier config from package.json', function () {
      beforeEach(function () {
        mockFs({
          'package.json': JSON.stringify({
            name: 'eslint-plugin-test',
            main: 'lib/', // Test that we can handle directory.
            prettier: { proseWrap: 'always' },
          }),

          'lib/index.js': `
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

          'README.md': '<!-- begin rules list --><!-- end rules list -->',

          'docs/rules/no-foo.md': outdent`
            ## Rule details
            details
            Long line that SHOULD get wrapped due to prettier proseWrap config. Long line that SHOULD get wrapped due to prettier proseWrap config.
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

        expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();

        expect(readFileSync('docs/rules/no-foo.md', 'utf8')).toMatchSnapshot();
      });
    });

    describe('adds extra column to rules table for TypeScript rules', function () {
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

          'README.md': '<!-- begin rules list --><!-- end rules list -->',

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
        await expect(() => generate('.')).not.toThrow();
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

    describe('Rule doc has options section but no options', function () {
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

          'README.md': '<!-- begin rules list --><!-- end rules list -->',

          'docs/rules/no-foo.md': '## Options', // empty

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
          '`no-foo` rule doc should not have included: ## Options',
        ]);
        consoleErrorStub.restore();
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

          'README.md': '<!-- begin rules list --><!-- end rules list -->',

          'docs/rules/no-foo.md': '## Options', // empty

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

          'index.js': '',

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
  });
});
