import { generate } from '../../../lib/generator.js';
import mockFs from 'mock-fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { jest } from '@jest/globals';

const __dirname = dirname(fileURLToPath(import.meta.url));

const PATH_NODE_MODULES = resolve(__dirname, '..', '..', '..', 'node_modules');

describe('generate (configs)', function () {
  describe('config with overrides', function () {
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
        node_modules: mockFs.load(PATH_NODE_MODULES),
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
          exports: 'index.js',
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
        node_modules: mockFs.load(PATH_NODE_MODULES),
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
          exports: 'index.js',
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
        node_modules: mockFs.load(PATH_NODE_MODULES),
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

  describe('rules that are disabled or set to warn, only one config present', function () {
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
                      'test/no-foo': 1,
                      'test/no-bar': 0,
                    }
                  },
                }
              };`,

        'README.md': '## Rules\n',

        'docs/rules/no-foo.md': '',
        'docs/rules/no-bar.md': '',

        // Needed for some of the test infrastructure to work.
        node_modules: mockFs.load(PATH_NODE_MODULES),
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

  describe('rules that are disabled or set to warn, two configs present', function () {
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
                    create(context) {},
                  },
                },
                configs: {
                  recommended: {
                    rules: {
                      'test/no-foo': 1,
                    }
                  },
                  typescript: {
                    rules: {
                      'test/no-foo': 0,
                    }
                  },
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

    it('generates the documentation', async function () {
      await generate('.');
      expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();
      expect(readFileSync('docs/rules/no-foo.md', 'utf8')).toMatchSnapshot();
    });
  });

  describe('with config that does not have any rules', function () {
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
            configs: {
              recommended: { rules: { 'test/no-foo': 'error' } },
              configWithoutRules: { rules: {  } },
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

    it('uses recommended config emoji since it is the only relevant config', async function () {
      await generate('.');
      expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();
      expect(readFileSync('docs/rules/no-foo.md', 'utf8')).toMatchSnapshot();
    });
  });

  describe('only a `recommended` config', function () {
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
    });
  });

  describe('with --ignore-config', function () {
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
        node_modules: mockFs.load(PATH_NODE_MODULES),
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
});
