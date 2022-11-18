import { generate } from '../../../lib/generator.js';
import mockFs from 'mock-fs';
import { outdent } from 'outdent';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { jest } from '@jest/globals';

const __dirname = dirname(fileURLToPath(import.meta.url));

const PATH_NODE_MODULES = resolve(__dirname, '..', '..', '..', 'node_modules');

// Create a mock-fs workspace filesystem for temporary usage in this test because changes will be written to some files.

describe('generate (general)', function () {
  describe('basic', function () {
    beforeEach(function () {
      mockFs({
        // package.json
        'package.json': JSON.stringify({
          name: 'eslint-plugin-test',
          exports: 'index.js',
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
        node_modules: mockFs.load(PATH_NODE_MODULES),
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
});
