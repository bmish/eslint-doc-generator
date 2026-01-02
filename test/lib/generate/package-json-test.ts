import { generate } from '../../../lib/generator.js';
import { join, resolve } from 'node:path';
import { readFileSync, mkdtempSync, cpSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import {
  setupFixture,
  cleanupFixture,
  getFixturePath,
} from '../fixture-helper.js';

describe('generate (package.json)', function () {
  describe('Missing plugin package.json', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('edge-cases', 'missing-plugin-package-json'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('throws an error', async function () {
      await expect(generate(tempDir)).rejects.toThrowErrorMatchingSnapshot();
    });
  });

  describe('Missing plugin package.json `name` field', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('edge-cases', 'missing-plugin-package-json-name-field'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('throws an error', async function () {
      await expect(generate(tempDir)).rejects.toThrowErrorMatchingSnapshot();
    });
  });

  describe('Scoped plugin name', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('edge-cases', 'scoped-plugin-name'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('determines the correct plugin prefix', async function () {
      await generate(tempDir);
      expect(readFileSync(join(tempDir, 'docs/rules/no-foo.md'), 'utf8')).toMatchSnapshot();
    });
  });

  describe('Scoped plugin with custom plugin name', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('edge-cases', 'scoped-plugin-with-custom-plugin-name'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('determines the correct plugin prefix', async function () {
      await generate(tempDir);
      expect(readFileSync(join(tempDir, 'README.md'), 'utf8')).toMatchSnapshot();
      expect(readFileSync(join(tempDir, 'docs/rules/no-foo.md'), 'utf8')).toMatchSnapshot();
    });
  });

  describe('No configs found', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('edge-cases', 'no-configs-found'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('omits the config column', async function () {
      await generate(tempDir);
      expect(readFileSync(join(tempDir, 'README.md'), 'utf8')).toMatchSnapshot();
      expect(readFileSync(join(tempDir, 'docs/rules/no-foo.md'), 'utf8')).toMatchSnapshot();
    });
  });

  describe('No exported rules object found', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('edge-cases', 'no-exported-rules-object-found'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('throws an error', async function () {
      await expect(generate(tempDir)).rejects.toThrowErrorMatchingSnapshot();
    });
  });

  describe('package.json using exports, as string', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('edge-cases', 'package-json-using-exports-as-string'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('finds the entry point', async function () {
      await expect(generate(tempDir)).resolves.toBeUndefined();
    });
  });

  describe('package.json using exports, object with dot', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('edge-cases', 'package-json-using-exports-object-with-dot'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('finds the entry point', async function () {
      await expect(generate(tempDir)).resolves.toBeUndefined();
    });
  });

  describe('plugin entry point in JSON format', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('edge-cases', 'plugin-entry-point-in-json-format'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('generates the documentation', async function () {
      await generate(tempDir);

      expect(readFileSync(join(tempDir, 'README.md'), 'utf8')).toMatchSnapshot();

      expect(readFileSync(join(tempDir, 'docs/rules/no-foo.md'), 'utf8')).toMatchSnapshot();
    });
  });

  describe('plugin entry point specified but does not exist', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('edge-cases', 'plugin-entry-point-specified-but-does-not-exist'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('throws an error', async function () {
      await expect(generate(tempDir)).rejects.toThrow(
        'ESLint plugin entry point does not exist. Tried: ./index.js',
      );
    });
  });

  describe("plugin entry point with type: 'module' and main field specified", function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('edge-cases', 'plugin-entry-point-with-type-module-and-main-field-specified'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('finds the entry point', async function () {
      await expect(generate(tempDir)).resolves.toBeUndefined();
    });
  });

  describe('passing absolute path for plugin root', function () {
    let tempDir: string;

    beforeEach(function () {
      const fixturePath = getFixturePath('edge-cases', 'no-configs-found');
      tempDir = mkdtempSync(join(tmpdir(), 'eslint-doc-gen-'));
      cpSync(fixturePath, tempDir, { recursive: true });
      // Write minimal files for this test
      writeFileSync(join(tempDir, 'package.json'), JSON.stringify({
        name: 'eslint-plugin-test',
        exports: './index.js',
        type: 'module',
      }, null, 2));
      writeFileSync(join(tempDir, 'index.js'), 'export default { rules: {}, configs: {} };');
      writeFileSync(join(tempDir, 'README.md'), '<!-- begin auto-generated rules list --><!-- end auto-generated rules list -->');
    });

    afterEach(function () {
      rmSync(tempDir, { recursive: true, force: true });
    });

    it('finds the entry point', async function () {
      await expect(generate(resolve(tempDir))).resolves.toBeUndefined();
    });
  });
});
