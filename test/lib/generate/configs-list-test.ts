import { generate } from '../../../lib/generator.js';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import {
  setupFixture,
  cleanupFixture,
  getFixturePath,
} from '../fixture-helper.js';

describe('generate (configs list)', function () {
  let tempDir: string;

  beforeEach(function () {
    tempDir = setupFixture(getFixturePath('standard'));
  });

  afterEach(function () {
    cleanupFixture(tempDir);
  });

  it('generates the documentation', async function () {
    await generate(tempDir);
    expect(readFileSync(join(tempDir, 'README.md'), 'utf8')).toMatchSnapshot();
  });

  it('generates the documentation with --ignore-config', async function () {
    await generate(tempDir, { ignoreConfig: ['style'] });
    expect(readFileSync(join(tempDir, 'README.md'), 'utf8')).toMatchSnapshot();
  });

  it('generates the documentation with --config-format', async function () {
    await generate(tempDir, { configFormat: 'prefix-name' });
    expect(readFileSync(join(tempDir, 'README.md'), 'utf8')).toMatchSnapshot();
  });

  describe('with configs not defined in alphabetical order', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('edge-cases', 'configs-not-defined-in-alphabetical-order'),
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
          getFixturePath('edge-cases', 'when-config-exports-description-property-description'),
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
          getFixturePath('edge-cases', 'when-config-exports-description-property-meta-description'),
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
          getFixturePath('edge-cases', 'when-config-exports-description-property-meta-docs-description'),
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
        getFixturePath('edge-cases', 'when-config-description-needs-to-be-escaped-in-table'),
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
        getFixturePath('edge-cases', 'when-there-are-no-configs'),
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
        getFixturePath('edge-cases', 'when-all-configs-are-ignored'),
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
