import { generate } from '../../../lib/generator.js';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import {
  setupFixture,
  cleanupFixture,
  getFixturePath,
} from '../fixture-helper.js';

describe('generate (deprecated rules)', function () {
  let tempDir: string;

  beforeEach(function () {
    tempDir = setupFixture(getFixturePath('standard-deprecated'));
  });

  afterEach(function () {
    cleanupFixture(tempDir);
  });

  it('updates the documentation', async function () {
    await generate(tempDir);

    expect(readFileSync(join(tempDir, 'README.md'), 'utf8')).toMatchSnapshot();

    expect(
      readFileSync(join(tempDir, 'docs/rules/no-foo.md'), 'utf8'),
    ).toMatchSnapshot();
    expect(
      readFileSync(join(tempDir, 'docs/rules/no-bar.md'), 'utf8'),
    ).toMatchSnapshot();
    expect(
      readFileSync(join(tempDir, 'docs/rules/no-baz.md'), 'utf8'),
    ).toMatchSnapshot();
    expect(
      readFileSync(join(tempDir, 'docs/rules/no-qux.md'), 'utf8'),
    ).toMatchSnapshot();
  });

  describe('with nested rule names', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('edge-cases', 'with-nested-rule-names'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('has the correct links, especially replacement rule link', async function () {
      await generate(tempDir);

      expect(
        readFileSync(join(tempDir, 'README.md'), 'utf8'),
      ).toMatchSnapshot();

      expect(
        readFileSync(join(tempDir, 'docs/rules/category/no-foo.md'), 'utf8'),
      ).toMatchSnapshot();
      expect(
        readFileSync(join(tempDir, 'docs/rules/category/no-bar.md'), 'utf8'),
      ).toMatchSnapshot();
    });
  });

  describe('with --path-rule-doc', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('edge-cases', 'with-path-rule-doc'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('has the correct links, especially replacement rule link', async function () {
      await generate(tempDir, { pathRuleDoc: 'docs/{name}/README.md' });

      expect(
        readFileSync(join(tempDir, 'README.md'), 'utf8'),
      ).toMatchSnapshot();

      expect(
        readFileSync(join(tempDir, 'docs/category/no-foo/README.md'), 'utf8'),
      ).toMatchSnapshot();
      expect(
        readFileSync(join(tempDir, 'docs/category/no-bar/README.md'), 'utf8'),
      ).toMatchSnapshot();
    });
  });

  describe('using prefix ahead of replacement rule name', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath(
          'edge-cases',
          'using-prefix-ahead-of-replacement-rule-name',
        ),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('uses correct replacement rule link', async function () {
      await generate(tempDir);

      expect(
        readFileSync(join(tempDir, 'README.md'), 'utf8'),
      ).toMatchSnapshot();

      expect(
        readFileSync(join(tempDir, 'docs/rules/no-foo.md'), 'utf8'),
      ).toMatchSnapshot();
      expect(
        readFileSync(join(tempDir, 'docs/rules/no-bar.md'), 'utf8'),
      ).toMatchSnapshot();
    });
  });

  describe('with no rule doc but --ignore-deprecated-rules', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath(
          'edge-cases',
          'with-no-rule-doc-but-ignore-deprecated-rules',
        ),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('omits the rule from the README and does not try to update its non-existent rule doc', async function () {
      await generate(tempDir, { ignoreDeprecatedRules: true });

      expect(
        readFileSync(join(tempDir, 'README.md'), 'utf8'),
      ).toMatchSnapshot();
    });
  });

  describe('replaced by ESLint core rule', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('edge-cases', 'replaced-by-eslint-core-rule'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('uses correct replacement rule link', async function () {
      await generate(tempDir);

      expect(
        readFileSync(join(tempDir, 'README.md'), 'utf8'),
      ).toMatchSnapshot();
      expect(
        readFileSync(join(tempDir, 'docs/rules/no-foo.md'), 'utf8'),
      ).toMatchSnapshot();
    });
  });

  describe('replaced by third-party plugin rule', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('edge-cases', 'replaced-by-third-party-plugin-rule'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('uses correct replacement rule link', async function () {
      await generate(tempDir);

      expect(
        readFileSync(join(tempDir, 'README.md'), 'utf8'),
      ).toMatchSnapshot();
      expect(
        readFileSync(join(tempDir, 'docs/rules/no-foo.md'), 'utf8'),
      ).toMatchSnapshot();
    });
  });

  describe('replaced by third-party plugin rule with same rule name as one of our rules', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath(
          'edge-cases',
          'replaced-by-third-party-plugin-rule-same-name',
        ),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('uses correct replacement rule link', async function () {
      await generate(tempDir);

      expect(
        readFileSync(join(tempDir, 'README.md'), 'utf8'),
      ).toMatchSnapshot();
      expect(
        readFileSync(join(tempDir, 'docs/rules/no-foo.md'), 'utf8'),
      ).toMatchSnapshot();
    });
  });
});
