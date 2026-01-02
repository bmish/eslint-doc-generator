import { generate } from '../../../lib/generator.js';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import {
  setupFixture,
  cleanupFixture,
  getFixturePath,
} from '../fixture-helper.js';

describe('generate (--rule-list-split)', function () {
  describe('by type', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(getFixturePath('standard-types'));
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('splits the list', async function () {
      await generate(tempDir, {
        ruleListSplit: 'meta.type',
      });
      expect(
        readFileSync(join(tempDir, 'README.md'), 'utf8'),
      ).toMatchSnapshot();
    });
  });

  describe('by nested property meta.docs.category', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('edge-cases', 'by-nested-property'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('splits the list', async function () {
      await generate(tempDir, { ruleListSplit: 'meta.docs.category' });
      expect(
        readFileSync(join(tempDir, 'README.md'), 'utf8'),
      ).toMatchSnapshot();
    });
  });

  describe('by property that no rules have', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('edge-cases', 'property-no-rules-have'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('throws an error', async function () {
      await expect(
        generate(tempDir, { ruleListSplit: 'non-existent-property' }),
      ).rejects.toThrow(
        'No rules found with --rule-list-split property "non-existent-property".',
      );
    });
  });

  describe('with boolean (camelCase)', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(getFixturePath('edge-cases', 'boolean-camelcase'));
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('splits the list with the right header', async function () {
      await generate(tempDir, {
        ruleListSplit: 'meta.hasSuggestions',
      });
      expect(
        readFileSync(join(tempDir, 'README.md'), 'utf8'),
      ).toMatchSnapshot();
    });
  });

  describe('with boolean (snake_case)', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('edge-cases', 'boolean-snake-case'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('splits the list with the right header', async function () {
      await generate(tempDir, {
        ruleListSplit: 'meta.hello_world',
      });
      expect(
        readFileSync(join(tempDir, 'README.md'), 'utf8'),
      ).toMatchSnapshot();
    });
  });

  describe('with boolean (PascalCase)', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('edge-cases', 'boolean-pascalcase'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('splits the list with the right header', async function () {
      await generate(tempDir, {
        ruleListSplit: 'meta.HelloWorld',
      });
      expect(
        readFileSync(join(tempDir, 'README.md'), 'utf8'),
      ).toMatchSnapshot();
    });
  });

  describe('with boolean (CONSTANT_CASE)', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('edge-cases', 'boolean-constant-case'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('splits the list with the right header', async function () {
      await generate(tempDir, {
        ruleListSplit: 'meta.HELLO_WORLD',
      });
      expect(
        readFileSync(join(tempDir, 'README.md'), 'utf8'),
      ).toMatchSnapshot();
    });
  });

  describe('with boolean (unknown variable type)', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('edge-cases', 'boolean-unknown-type'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('splits the list and does the best it can with the header', async function () {
      await generate(tempDir, {
        ruleListSplit: 'foo_barBIZ-baz3bOz',
      });
      expect(
        readFileSync(join(tempDir, 'README.md'), 'utf8'),
      ).toMatchSnapshot();
    });
  });

  describe('with boolean (various boolean equivalent values)', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('edge-cases', 'boolean-various-values'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('splits the list', async function () {
      await generate(tempDir, {
        ruleListSplit: 'meta.foo',
      });
      expect(
        readFileSync(join(tempDir, 'README.md'), 'utf8'),
      ).toMatchSnapshot();
    });
  });

  describe('with no existing headers in file', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('edge-cases', 'no-existing-headers'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('uses the proper sub-list header level', async function () {
      await generate(tempDir, { ruleListSplit: 'meta.docs.category' });
      expect(
        readFileSync(join(tempDir, 'README.md'), 'utf8'),
      ).toMatchSnapshot();
    });
  });

  describe('with only a title in the rules file', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(getFixturePath('edge-cases', 'only-title'));
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('uses the proper sub-list header level', async function () {
      await generate(tempDir, { ruleListSplit: 'meta.docs.category' });
      expect(
        readFileSync(join(tempDir, 'README.md'), 'utf8'),
      ).toMatchSnapshot();
    });
  });

  describe('ignores case when sorting headers', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(getFixturePath('edge-cases', 'ignores-case'));
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('splits the list', async function () {
      await generate(tempDir, {
        ruleListSplit: 'meta.foo',
      });
      expect(
        readFileSync(join(tempDir, 'README.md'), 'utf8'),
      ).toMatchSnapshot();
    });
  });

  describe('with one sub-list having no rules enabled by the config', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('edge-cases', 'one-sublist-no-rules'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('splits the list and still uses recommended config emoji in both lists', async function () {
      await generate(tempDir, {
        ruleListSplit: 'type',
      });
      expect(
        readFileSync(join(tempDir, 'README.md'), 'utf8'),
      ).toMatchSnapshot();
    });
  });

  describe('multiple properties', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('edge-cases', 'multiple-properties'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('splits the list by multiple properties', async function () {
      await generate(tempDir, {
        ruleListSplit: ['meta.deprecated', 'meta.docs.category'],
      });
      expect(
        readFileSync(join(tempDir, 'README.md'), 'utf8'),
      ).toMatchSnapshot();
    });
  });

  describe('multiple properties and no rules left for second property (already shown for first property)', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('edge-cases', 'multiple-properties-no-rules'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('does not show the property with no rules left and does not throw', async function () {
      await generate(tempDir, {
        ruleListSplit: ['meta.deprecated', 'meta.docs.category'],
      });
      expect(
        readFileSync(join(tempDir, 'README.md'), 'utf8'),
      ).toMatchSnapshot();
    });
  });

  describe('multiple properties and no rules could exist for second property', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('edge-cases', 'multiple-properties-no-rules-second'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('throws an error', async function () {
      await expect(
        generate(tempDir, {
          ruleListSplit: ['meta.deprecated', 'non-existent-property'],
        }),
      ).rejects.toThrow(
        'No rules found with --rule-list-split property "non-existent-property".',
      );
    });
  });

  describe('as a function', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(getFixturePath('edge-cases', 'as-function'));
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('generates the documentation', async function () {
      await generate(tempDir, {
        ruleListSplit: (rules) => {
          const list1 = {
            rules: rules.filter(([, rule]) => rule.meta.type === 'suggestion'),
          };
          const list2 = {
            title: 'Not Deprecated',
            rules: rules.filter(([, rule]) => !rule.meta.deprecated),
          };
          const list3 = {
            title: 'Deprecated',
            rules: rules.filter(([, rule]) => rule.meta.deprecated),
          };
          const list4 = {
            title: 'Name = "no-baz"',
            rules: rules.filter(([name]) => name === 'no-baz'),
          };
          return [list1, list2, list3, list4];
        },
      });
      expect(
        readFileSync(join(tempDir, 'README.md'), 'utf8'),
      ).toMatchSnapshot();
    });
  });

  describe('as a function but invalid return value', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('edge-cases', 'as-function-invalid'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('throws an error when no return value', async function () {
      await expect(
        generate(tempDir, {
          // @ts-expect-error -- intentionally invalid return value
          ruleListSplit: () => {
            return null; // eslint-disable-line unicorn/no-null -- intentionally invalid return value
          },
        }),
      ).rejects.toThrow('ruleListSplit return value must be array');
    });

    it('throws an error when returning an empty array', async function () {
      await expect(
        generate(tempDir, {
          ruleListSplit: () => {
            return [];
          },
        }),
      ).rejects.toThrow(
        'ruleListSplit return value must NOT have fewer than 1 items',
      );
    });

    it('throws an error when a sub-list has wrong type for rules', async function () {
      await expect(
        generate(tempDir, {
          // @ts-expect-error -- intentionally invalid return value
          ruleListSplit: () => {
            return [{ title: 'Foo', rules: null }]; // eslint-disable-line unicorn/no-null -- intentionally invalid return value
          },
        }),
      ).rejects.toThrow('ruleListSplit return value/0/rules must be array');
    });

    it('throws an error when a sub-list has no rules', async function () {
      await expect(
        generate(tempDir, {
          ruleListSplit: () => {
            return [{ title: 'Foo', rules: [] }];
          },
        }),
      ).rejects.toThrow(
        'ruleListSplit return value/0/rules must NOT have fewer than 1 items',
      );
    });

    it('throws an error when a sub-list has a non-string title', async function () {
      await expect(
        generate(tempDir, {
          // @ts-expect-error -- intentionally invalid type
          ruleListSplit: (rules) => {
            return [{ title: 123, rules }];
          },
        }),
      ).rejects.toThrow('ruleListSplit return value/0/title must be string');
    });

    it('throws an error when same rule in list twice', async function () {
      await expect(
        generate(tempDir, {
          ruleListSplit: (rules) => {
            return [{ title: 'Foo', rules: [rules[0], rules[0]] }];
          },
        }),
      ).rejects.toThrow(
        'ruleListSplit return value/0/rules must NOT have duplicate items (items ## 0 and 1 are identical)',
      );
    });
  });
});
