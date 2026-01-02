import { generate } from '../../../lib/generator.js';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import {
  setupFixture,
  cleanupFixture,
  getFixturePath,
} from '../fixture-helper.js';

describe('generate (configs list)', function () {
  describe('basic', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('generate', 'configs-list', 'basic'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('generates the documentation', async function () {
      await generate(tempDir);
      expect(readFileSync(join(tempDir, 'README.md'), 'utf8')).toMatchSnapshot();
    });
  });

  describe('with --ignore-config', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('generate', 'configs-list', 'with-ignore-config'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('generates the documentation', async function () {
      await generate(tempDir, { ignoreConfig: ['foo'] });
      expect(readFileSync(join(tempDir, 'README.md'), 'utf8')).toMatchSnapshot();
    });
  });

  describe('with --config-format', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('generate', 'configs-list', 'with-config-format'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('generates the documentation', async function () {
      await generate(tempDir, { configFormat: 'prefix-name' });
      expect(readFileSync(join(tempDir, 'README.md'), 'utf8')).toMatchSnapshot();
    });
  });

  describe('with configs not defined in alphabetical order', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('generate', 'configs-list', 'configs-not-defined-in-alphabetical-order'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('generates the documentation', async function () {
      await generate(tempDir);
      expect(readFileSync(join(tempDir, 'README.md'), 'utf8')).toMatchSnapshot();
    });
  });

  describe('when a config exports a description', function () {
    describe('property=description', function () {
      let tempDir: string;

      beforeEach(function () {
        tempDir = setupFixture(
          getFixturePath('generate', 'configs-list', 'when-config-exports-description-property-description'),
        );
      });

      afterEach(function () {
        cleanupFixture(tempDir);
      });

      it('generates the documentation', async function () {
        await generate(tempDir);
        expect(readFileSync(join(tempDir, 'README.md'), 'utf8')).toMatchSnapshot();
      });
    });

    describe('property=meta.description', function () {
      let tempDir: string;

      beforeEach(function () {
        tempDir = setupFixture(
          getFixturePath('generate', 'configs-list', 'when-config-exports-description-property-meta-description'),
        );
      });

      afterEach(function () {
        cleanupFixture(tempDir);
      });

      it('generates the documentation', async function () {
        await generate(tempDir);
        expect(readFileSync(join(tempDir, 'README.md'), 'utf8')).toMatchSnapshot();
      });
    });

    describe('property=meta.docs.description', function () {
      let tempDir: string;

      beforeEach(function () {
        tempDir = setupFixture(
          getFixturePath('generate', 'configs-list', 'when-config-exports-description-property-meta-docs-description'),
        );
      });

      afterEach(function () {
        cleanupFixture(tempDir);
      });

      it('generates the documentation', async function () {
        await generate(tempDir);
        expect(readFileSync(join(tempDir, 'README.md'), 'utf8')).toMatchSnapshot();
      });
    });
  });

  describe('when a config description needs to be escaped in table', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('generate', 'configs-list', 'when-config-description-needs-to-be-escaped-in-table'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('generates the documentation', async function () {
      await generate(tempDir);
      expect(readFileSync(join(tempDir, 'README.md'), 'utf8')).toMatchSnapshot();
    });
  });

  describe('when there are no configs', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('generate', 'configs-list', 'when-there-are-no-configs'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('generates the documentation', async function () {
      await generate(tempDir);
      expect(readFileSync(join(tempDir, 'README.md'), 'utf8')).toMatchSnapshot();
    });
  });

  describe('when all configs are ignored', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('generate', 'configs-list', 'when-all-configs-are-ignored'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('generates the documentation', async function () {
      await generate(tempDir, { ignoreConfig: ['recommended'] });
      expect(readFileSync(join(tempDir, 'README.md'), 'utf8')).toMatchSnapshot();
    });
  });
});
