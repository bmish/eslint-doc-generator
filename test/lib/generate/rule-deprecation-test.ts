import { generate } from '../../../lib/generator.js';
import {
  setupFixture,
  type FixtureContext,
} from '../../helpers/fixture.js';
import { jest } from '@jest/globals';

describe('generate (deprecated rules)', function () {
  describe('several deprecated rules', function () {
    let fixture: FixtureContext;

    beforeAll(async function () {
      fixture = await setupFixture({
        fixture: 'esm-base',
        overrides: {
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
                      'no-boz': {
                        meta: {
                          docs: { description: 'Description.' },
                          deprecated: true,
                          replacedBy: ['no-baz', 'no-biz'], // Multiple replacements.
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
          'docs/rules/no-boz.md': '',
        },
      });
    });

    afterAll(async function () {
      await fixture.cleanup();
      jest.resetModules();
    });

    it('updates the documentation', async function () {
      await generate(fixture.path);

      expect(await fixture.readFile('README.md')).toMatchSnapshot();

      expect(await fixture.readFile('docs/rules/no-foo.md')).toMatchSnapshot();
      expect(await fixture.readFile('docs/rules/no-bar.md')).toMatchSnapshot();
      expect(await fixture.readFile('docs/rules/no-baz.md')).toMatchSnapshot();
      expect(await fixture.readFile('docs/rules/no-biz.md')).toMatchSnapshot();
      expect(await fixture.readFile('docs/rules/no-boz.md')).toMatchSnapshot();
    });
  });

  describe('with nested rule names', function () {
    let fixture: FixtureContext;

    beforeAll(async function () {
      fixture = await setupFixture({
        fixture: 'esm-base',
        overrides: {
          'index.js': `
              export default {
                rules: {
                  'category/no-foo': {
                    meta: {
                      docs: { description: 'Description.' },
                      deprecated: true,
                      replacedBy: ['category/no-bar'], // without plugin prefix
                    },
                    create(context) {}
                  },
                  'category/no-bar': {
                    meta: {
                      docs: { description: 'Description.' },
                      deprecated: true,
                      replacedBy: ['test/category/no-foo'], // with plugin prefix
                    },
                    create(context) {}
                  },
                },
                configs: {}
              };`,
          'README.md':
            '<!-- begin auto-generated rules list --><!-- end auto-generated rules list -->',
          'docs/rules/category/no-foo.md': '',
          'docs/rules/category/no-bar.md': '',
        },
      });
    });

    afterAll(async function () {
      await fixture.cleanup();
      jest.resetModules();
    });

    it('has the correct links, especially replacement rule link', async function () {
      await generate(fixture.path);

      expect(await fixture.readFile('README.md')).toMatchSnapshot();

      expect(
        await fixture.readFile('docs/rules/category/no-foo.md'),
      ).toMatchSnapshot();
      expect(
        await fixture.readFile('docs/rules/category/no-bar.md'),
      ).toMatchSnapshot();
    });
  });

  describe('with --path-rule-doc', function () {
    let fixture: FixtureContext;

    beforeAll(async function () {
      fixture = await setupFixture({
        fixture: 'esm-base',
        overrides: {
          'index.js': `
          export default {
            rules: {
              'category/no-foo': {
                meta: {
                  docs: { description: 'Description.' },
                  deprecated: true,
                  replacedBy: ['category/no-bar'], // without plugin prefix
                },
                create(context) {}
              },
              'category/no-bar': {
                meta: {
                  docs: { description: 'Description.' },
                  deprecated: true,
                  replacedBy: ['test/category/no-foo'], // with plugin prefix
                },
                create(context) {}
              },
            },
            configs: {}
          };`,
          'README.md':
            '<!-- begin auto-generated rules list --><!-- end auto-generated rules list -->',
          'docs/category/no-foo/README.md': '',
          'docs/category/no-bar/README.md': '',
        },
      });
    });

    afterAll(async function () {
      await fixture.cleanup();
      jest.resetModules();
    });

    it('has the correct links, especially replacement rule link', async function () {
      await generate(fixture.path, { pathRuleDoc: 'docs/{name}/README.md' });

      expect(await fixture.readFile('README.md')).toMatchSnapshot();

      expect(
        await fixture.readFile('docs/category/no-foo/README.md'),
      ).toMatchSnapshot();
      expect(
        await fixture.readFile('docs/category/no-bar/README.md'),
      ).toMatchSnapshot();
    });
  });

  describe('using prefix ahead of replacement rule name', function () {
    let fixture: FixtureContext;

    beforeAll(async function () {
      fixture = await setupFixture({
        fixture: 'esm-base',
        overrides: {
          'index.js': `
          export default {
            rules: {
              'no-foo': {
                meta: {
                  docs: { description: 'Description.' },
                  deprecated: true,
                  replacedBy: ['test/no-bar'],
                },
                create(context) {}
              },
              'no-bar': {
                meta: { docs: { description: 'Description.' }, },
                create(context) {}
              },
            },
            configs: {}
          };`,
          'README.md':
            '<!-- begin auto-generated rules list --><!-- end auto-generated rules list -->',
          'docs/rules/no-foo.md': '',
          'docs/rules/no-bar.md': '',
        },
      });
    });

    afterAll(async function () {
      await fixture.cleanup();
      jest.resetModules();
    });

    it('uses correct replacement rule link', async function () {
      await generate(fixture.path);

      expect(await fixture.readFile('README.md')).toMatchSnapshot();

      expect(await fixture.readFile('docs/rules/no-foo.md')).toMatchSnapshot();
      expect(await fixture.readFile('docs/rules/no-bar.md')).toMatchSnapshot();
    });
  });

  describe('with no rule doc but --ignore-deprecated-rules', function () {
    let fixture: FixtureContext;

    beforeAll(async function () {
      fixture = await setupFixture({
        fixture: 'esm-base',
        overrides: {
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
        },
      });
    });

    afterAll(async function () {
      await fixture.cleanup();
      jest.resetModules();
    });

    it('omits the rule from the README and does not try to update its non-existent rule doc', async function () {
      await generate(fixture.path, { ignoreDeprecatedRules: true });

      expect(await fixture.readFile('README.md')).toMatchSnapshot();
    });
  });

  describe('replaced by ESLint core rule', function () {
    let fixture: FixtureContext;

    beforeAll(async function () {
      fixture = await setupFixture({
        fixture: 'esm-base',
        overrides: {
          'index.js': `
          export default {
            rules: {
              'no-foo': {
                meta: {
                  docs: { description: 'Description.' },
                  deprecated: true,
                  replacedBy: ['no-unused-vars'],
                },
                create(context) {}
              },
            },
          };`,
          'README.md':
            '<!-- begin auto-generated rules list --><!-- end auto-generated rules list -->',
          'docs/rules/no-foo.md': '',
        },
      });
    });

    afterAll(async function () {
      await fixture.cleanup();
      jest.resetModules();
    });

    it('uses correct replacement rule link', async function () {
      await generate(fixture.path);

      expect(await fixture.readFile('README.md')).toMatchSnapshot();
      expect(await fixture.readFile('docs/rules/no-foo.md')).toMatchSnapshot();
    });
  });

  describe('replaced by third-party plugin rule', function () {
    let fixture: FixtureContext;

    beforeAll(async function () {
      fixture = await setupFixture({
        fixture: 'esm-base',
        overrides: {
          'index.js': `
          export default {
            rules: {
              'no-foo': {
                meta: {
                  docs: { description: 'Description.' },
                  deprecated: true,
                  replacedBy: ['other-plugin/no-unused-vars'],
                },
                create(context) {}
              },
            },
          };`,
          'README.md':
            '<!-- begin auto-generated rules list --><!-- end auto-generated rules list -->',
          'docs/rules/no-foo.md': '',
        },
      });
    });

    afterAll(async function () {
      await fixture.cleanup();
      jest.resetModules();
    });

    it('uses correct replacement rule link', async function () {
      await generate(fixture.path);

      expect(await fixture.readFile('README.md')).toMatchSnapshot();
      expect(await fixture.readFile('docs/rules/no-foo.md')).toMatchSnapshot();
    });
  });

  describe('replaced by third-party plugin rule with same rule name as one of our rules', function () {
    let fixture: FixtureContext;

    beforeAll(async function () {
      fixture = await setupFixture({
        fixture: 'esm-base',
        overrides: {
          'index.js': `
          export default {
            rules: {
              'no-foo': {
                meta: {
                  docs: { description: 'Description.' },
                  deprecated: true,
                  replacedBy: ['other-plugin/no-foo'],
                },
                create(context) {}
              },
            },
          };`,
          'README.md':
            '<!-- begin auto-generated rules list --><!-- end auto-generated rules list -->',
          'docs/rules/no-foo.md': '',
        },
      });
    });

    afterAll(async function () {
      await fixture.cleanup();
      jest.resetModules();
    });

    it('uses correct replacement rule link', async function () {
      await generate(fixture.path);

      expect(await fixture.readFile('README.md')).toMatchSnapshot();
      expect(await fixture.readFile('docs/rules/no-foo.md')).toMatchSnapshot();
    });
  });
});
