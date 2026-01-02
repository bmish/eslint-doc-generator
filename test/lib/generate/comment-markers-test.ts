import { generate } from '../../../lib/generator.js';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import {
  setupFixture,
  cleanupFixture,
  getFixturePath,
} from '../fixture-helper.js';

describe('generate (comment markers)', function () {
  let tempDir: string;

  beforeEach(function () {
    tempDir = setupFixture(getFixturePath('standard'));
  });

  afterEach(function () {
    cleanupFixture(tempDir);
  });

  it('generates the documentation with one blank line around comment markers', async function () {
    await generate(tempDir);

    expect(readFileSync(join(tempDir, 'README.md'), 'utf8')).toMatchSnapshot();

    expect(
      readFileSync(join(tempDir, 'docs/rules/no-foo.md'), 'utf8'),
    ).toMatchSnapshot();
  });

  describe('with no blank lines around comment markers', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('edge-cases', 'no-blank-lines-around-comment-markers'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('generates the documentation', async function () {
      await generate(tempDir);

      expect(
        readFileSync(join(tempDir, 'README.md'), 'utf8'),
      ).toMatchSnapshot();

      expect(
        readFileSync(join(tempDir, 'docs/rules/no-foo.md'), 'utf8'),
      ).toMatchSnapshot();
    });
  });

  describe('no existing comment markers - with no blank lines in existing content', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath(
          'edge-cases',
          'no-existing-comment-markers-no-blank-lines',
        ),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('generates the documentation', async function () {
      await generate(tempDir);

      expect(
        readFileSync(join(tempDir, 'README.md'), 'utf8'),
      ).toMatchSnapshot();

      expect(
        readFileSync(join(tempDir, 'docs/rules/no-foo.md'), 'utf8'),
      ).toMatchSnapshot();
    });
  });

  describe('no existing comment markers - with one blank line around existing content', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath(
          'edge-cases',
          'no-existing-comment-markers-one-blank-line',
        ),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('generates the documentation', async function () {
      await generate(tempDir);

      expect(
        readFileSync(join(tempDir, 'README.md'), 'utf8'),
      ).toMatchSnapshot();

      expect(
        readFileSync(join(tempDir, 'docs/rules/no-foo.md'), 'utf8'),
      ).toMatchSnapshot();
    });
  });

  describe('no existing comment markers - minimal doc content', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('edge-cases', 'no-existing-comment-markers-minimal-doc'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('generates the documentation', async function () {
      await generate(tempDir);

      expect(
        readFileSync(join(tempDir, 'README.md'), 'utf8'),
      ).toMatchSnapshot();

      expect(
        readFileSync(join(tempDir, 'docs/rules/no-foo.md'), 'utf8'),
      ).toMatchSnapshot();
    });
  });

  describe('no existing comment markers - rule doc with YAML-formatted metadata (front matter) above title', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath(
          'edge-cases',
          'no-existing-comment-markers-yaml-front-matter',
        ),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('updates the documentation', async function () {
      await generate(tempDir);

      expect(
        readFileSync(join(tempDir, 'docs/rules/no-foo.md'), 'utf8'),
      ).toMatchSnapshot();
    });
  });

  describe('README missing rule list markers but with rules section', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath(
          'edge-cases',
          'readme-missing-rule-list-markers-with-rules-section',
        ),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('adds rule list markers to rule section', async function () {
      await generate(tempDir);
      expect(
        readFileSync(join(tempDir, 'README.md'), 'utf8'),
      ).toMatchSnapshot();
    });
  });

  describe('README missing rule list markers and no rules section', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath(
          'edge-cases',
          'readme-missing-rule-list-markers-no-rules-section',
        ),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('throws an error', async function () {
      await expect(generate(tempDir)).rejects.toThrowErrorMatchingSnapshot();
    });
  });

  describe('rule doc without header marker but pre-existing header', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath(
          'edge-cases',
          'rule-doc-without-header-marker-pre-existing-header',
        ),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('updates the documentation', async function () {
      await generate(tempDir);

      expect(
        readFileSync(join(tempDir, 'docs/rules/no-foo.md'), 'utf8'),
      ).toMatchSnapshot();
    });
  });

  describe('rule doc with YAML-formatted metadata (front matter) above title and comment marker', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath(
          'edge-cases',
          'rule-doc-yaml-front-matter-above-title-and-comment-marker',
        ),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('updates the documentation', async function () {
      await generate(tempDir);

      expect(
        readFileSync(join(tempDir, 'docs/rules/no-foo.md'), 'utf8'),
      ).toMatchSnapshot();
    });
  });

  describe('rule doc with YAML-formatted metadata (front matter) and nothing else', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('edge-cases', 'rule-doc-yaml-front-matter-only'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('updates the documentation', async function () {
      await generate(tempDir);

      expect(
        readFileSync(join(tempDir, 'docs/rules/no-foo.md'), 'utf8'),
      ).toMatchSnapshot();
    });
  });
});
