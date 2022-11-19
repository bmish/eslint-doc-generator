import { generate } from '../../../lib/generator.js';
import mockFs from 'mock-fs';
import { dirname, resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { jest } from '@jest/globals';

const __dirname = dirname(fileURLToPath(import.meta.url));

const PATH_NODE_MODULES = resolve(__dirname, '..', '..', '..', 'node_modules');

describe('generate (package.json)', function () {
  describe('Missing plugin package.json', function () {
    beforeEach(function () {
      mockFs({
        'index.js': '',

        // Needed for some of the test infrastructure to work.
        node_modules: mockFs.load(PATH_NODE_MODULES),
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
          exports: 'index.js',
          type: 'module',
        }),

        'index.js': 'export default { rules: {} }',

        // Needed for some of the test infrastructure to work.
        node_modules: mockFs.load(PATH_NODE_MODULES),
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
          exports: 'index.js',
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
        node_modules: mockFs.load(PATH_NODE_MODULES),
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

  describe('Scoped plugin with custom plugin name', function () {
    beforeEach(function () {
      mockFs({
        'package.json': JSON.stringify({
          name: '@my-scope/eslint-plugin-foo',
          exports: 'index.js',
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
              'recommended': { rules: { '@my-scope/foo/no-foo': 'error', } }
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
    it('determines the correct plugin prefix', async function () {
      await generate('.');
      expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();
      expect(readFileSync('docs/rules/no-foo.md', 'utf8')).toMatchSnapshot();
    });
  });

  describe('No configs found', function () {
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
                meta: { docs: { description: 'disallow foo.' }, },
                create(context) {}
              },
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
          exports: 'index.js',
          type: 'module',
        }),

        'index.js': 'export default {};',

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
    it('throws an error', async function () {
      await expect(generate('.')).rejects.toThrowErrorMatchingSnapshot();
    });
  });

  describe('package.json using exports, as string', function () {
    beforeEach(function () {
      mockFs({
        'package.json': JSON.stringify({
          name: 'eslint-plugin-test',
          exports: './index.js',
          type: 'module',
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
        node_modules: mockFs.load(PATH_NODE_MODULES),
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
          type: 'module',
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
        node_modules: mockFs.load(PATH_NODE_MODULES),
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

  describe('plugin entry point in JSON format', function () {
    beforeEach(function () {
      mockFs({
        'package.json': JSON.stringify({
          name: 'eslint-plugin-test',
          exports: './index.json',
          type: 'module',
        }),

        'index.json': `
          {
            "rules": {
              "no-foo": {
                "meta": {
                  "docs": {
                    "description": "Description for no-foo"
                  }
                }
              }
            },
            "configs": {
              "recommended": {
                "rules": {
                  "test/no-foo": "error"
                }
              }
            }
          }
        `,

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
    it('generates the documentation', async function () {
      await generate('.');

      expect(readFileSync('README.md', 'utf8')).toMatchSnapshot();

      expect(readFileSync('docs/rules/no-foo.md', 'utf8')).toMatchSnapshot();
    });
  });

  describe('plugin entry point specified but does not exist', function () {
    beforeEach(function () {
      mockFs({
        'package.json': JSON.stringify({
          name: 'eslint-plugin-test',
          exports: 'index.js',
          type: 'module',
        }),

        'README.md':
          '<!-- begin auto-generated rules list --><!-- end auto-generated rules list -->',

        // Needed for some of the test infrastructure to work.
        node_modules: mockFs.load(PATH_NODE_MODULES),
      });
    });

    afterEach(function () {
      mockFs.restore();
      jest.resetModules();
    });

    it('throws an error', async function () {
      await expect(generate('.')).rejects.toThrow(
        'ESLint plugin entry point does not exist. Tried: index.js'
      );
    });
  });

  describe('passing absolute path for plugin root', function () {
    beforeEach(function () {
      mockFs({
        '/eslint-plugin-test/package.json': JSON.stringify({
          name: 'eslint-plugin-test',
          exports: 'index.js',
          type: 'module',
        }),

        '/eslint-plugin-test/index.js':
          'export default { rules: {}, configs: {} };',

        '/eslint-plugin-test/README.md':
          '<!-- begin auto-generated rules list --><!-- end auto-generated rules list -->',

        // Needed for some of the test infrastructure to work.
        node_modules: mockFs.load(PATH_NODE_MODULES),
      });
    });

    afterEach(function () {
      mockFs.restore();
      jest.resetModules();
    });

    it('finds the entry point', async function () {
      await expect(generate('/eslint-plugin-test/')).resolves.toBeUndefined();
    });
  });
});
