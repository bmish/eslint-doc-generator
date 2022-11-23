import { generate } from '../../../lib/generator.js';
import mockFs from 'mock-fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { jest } from '@jest/globals';
import { outdent } from 'outdent';

const __dirname = dirname(fileURLToPath(import.meta.url));

const PATH_NODE_MODULES = resolve(__dirname, '..', '..', '..', 'node_modules');

describe('generate (comment markers)', function () {
  describe('with one blank line around comment markers', function () {
    beforeEach(function () {
      mockFs({
        'package.json': JSON.stringify({
          name: 'eslint-plugin-test',
          type: 'module',
          exports: 'index.js',
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

  describe('with no blank lines around comment markers', function () {
    beforeEach(function () {
      mockFs({
        'package.json': JSON.stringify({
          name: 'eslint-plugin-test',
          type: 'module',
          exports: 'index.js',
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

  describe('no existing comment markers - with no blank lines in existing content', function () {
    beforeEach(function () {
      mockFs({
        'package.json': JSON.stringify({
          name: 'eslint-plugin-test',
          type: 'module',
          exports: 'index.js',
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

  describe('no existing comment markers - with one blank line around existing content', function () {
    beforeEach(function () {
      mockFs({
        'package.json': JSON.stringify({
          name: 'eslint-plugin-test',
          type: 'module',
          exports: 'index.js',
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

  describe('no existing comment markers - minimal doc content', function () {
    beforeEach(function () {
      mockFs({
        'package.json': JSON.stringify({
          name: 'eslint-plugin-test',
          type: 'module',
          exports: 'index.js',
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

  describe('no existing comment markers - rule doc with YAML-formatted metadata (front matter) above title', function () {
    beforeEach(function () {
      mockFs({
        'package.json': JSON.stringify({
          name: 'eslint-plugin-test',
          exports: 'index.js',
          type: 'module',
        }),

        'index.js': `
          export default {
            rules: { 'no-foo': { meta: { docs: { description: 'Description.' }, }, create(context) {} }, },
            configs: { recommended: { rules: { 'test/no-foo': 'error', } } }
          };`,

        'README.md': '## Rules\n',

        // YAML-formatted metadata (front matter) content above title.
        'docs/rules/no-foo.md': outdent`
          ---
          pageClass: "rule-details"
          sidebarDepth: 0
          title: "plugin/rule-name"
          description: "disallow foo"
          since: "v0.12.0"
          ---
          # Some pre-existing title.
          Pre-existing notice about the rule being recommended.
          ## Rule details
          Details.
        `,

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

      expect(readFileSync('docs/rules/no-foo.md', 'utf8')).toMatchSnapshot();
    });
  });

  describe('README missing rule list markers but with rules section', function () {
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
        node_modules: mockFs.load(PATH_NODE_MODULES),
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
          };`,

        'README.md': '# eslint-plugin-test',

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

  describe('rule doc without header marker but pre-existing header', function () {
    beforeEach(function () {
      mockFs({
        'package.json': JSON.stringify({
          name: 'eslint-plugin-test',
          exports: 'index.js',
          type: 'module',
        }),

        'index.js': `
          export default {
            rules: { 'no-foo': { meta: { docs: { description: 'Description.' }, }, create(context) {} }, },
            configs: { recommended: { rules: { 'test/no-foo': 'error', } } }
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
        node_modules: mockFs.load(PATH_NODE_MODULES),
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

  describe('rule doc with YAML-formatted metadata (front matter) above title and comment marker', function () {
    beforeEach(function () {
      mockFs({
        'package.json': JSON.stringify({
          name: 'eslint-plugin-test',
          exports: 'index.js',
          type: 'module',
        }),

        'index.js': `
          export default {
            rules: { 'no-foo': { meta: { docs: { description: 'Description.' }, }, create(context) {} }, },
            configs: { recommended: { rules: { 'test/no-foo': 'error', } } }
          };`,

        'README.md': '## Rules\n',

        // YAML-formatted metadata (front matter) above title.
        'docs/rules/no-foo.md': outdent`
          ---
          pageClass: "rule-details"
          sidebarDepth: 0
          title: "plugin/rule-name"
          description: "disallow foo"
          since: "v0.12.0"
          ---
          # Outdated title.
          Outdated content.
          <!-- end auto-generated rule header -->
          ## Rule details
          Details.
        `,

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

      expect(readFileSync('docs/rules/no-foo.md', 'utf8')).toMatchSnapshot();
    });
  });

  describe('rule doc with YAML-formatted metadata (front matter) and nothing else', function () {
    beforeEach(function () {
      mockFs({
        'package.json': JSON.stringify({
          name: 'eslint-plugin-test',
          exports: 'index.js',
          type: 'module',
        }),

        'index.js': `
          export default {
            rules: { 'no-foo': { meta: { docs: { description: 'Description.' }, }, create(context) {} }, },
            configs: { recommended: { rules: { 'test/no-foo': 'error', } } }
          };`,

        'README.md': '## Rules\n',

        // YAML-formatted metadata (front matter) only.
        'docs/rules/no-foo.md': outdent`
          ---
          pageClass: "rule-details"
          sidebarDepth: 0
          title: "plugin/rule-name"
          description: "disallow foo"
          since: "v0.12.0"
          ---
        `,

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

      expect(readFileSync('docs/rules/no-foo.md', 'utf8')).toMatchSnapshot();
    });
  });
});
