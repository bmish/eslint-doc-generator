import { generate } from '../../lib/generator.js';
import mockFs from 'mock-fs';
import { outdent } from 'outdent';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { jest } from '@jest/globals';
import prettier from 'prettier'; // eslint-disable-line node/no-extraneous-import -- prettier is included by eslint-plugin-square
import * as sinon from 'sinon';

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
          'Could not find README: README.md'
        );
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
      it('finds index.js entry point', async function () {
        await expect(generate('.')).resolves.toBeUndefined();
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

          'README.md': '<!-- begin rules list --><!-- end rules list -->',

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

          'README.md': '<!-- begin rules list --><!-- end rules list -->',

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

          'README.md': '<!-- begin rules list --><!-- end rules list -->',

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
      it('generates the documentation', async function () {
        await generate('.');

        expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();

        expect(readFileSync('docs/rules/no-foo.md', 'utf8')).toMatchSnapshot();
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

          'README.md': '<!-- begin rules list --><!-- end rules list -->',

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

          'README.md': '<!-- begin rules list --><!-- end rules list -->',

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

            <!-- begin rules list -->


            <!-- end rules list -->

            One blank line before this.
          `,

          'docs/rules/no-foo.md': outdent`
            <!-- end rule header -->

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
            <!-- begin rules list -->
            <!-- end rules list -->
            No blank line before this.
          `,

          'docs/rules/no-foo.md': outdent`
            <!-- end rule header -->
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

    describe('rules that are disabled', function () {
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
              },
              configs: {
                recommended: {
                  rules: {
                    'test/no-foo': 'off',
                    'test/no-bar': 0,
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

      it('generates the documentation', async function () {
        await generate('.');
        expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();
        expect(readFileSync('docs/rules/no-foo.md', 'utf8')).toMatchSnapshot();
        expect(readFileSync('docs/rules/no-bar.md', 'utf8')).toMatchSnapshot();
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
  });
});
