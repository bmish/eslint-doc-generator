import { generate } from '../../../lib/generator.js';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import { EMOJI_CONFIG_ERROR } from '../../../lib/emojis.js';
import {
  setupFixture,
  cleanupFixture,
  getFixturePath,
} from '../fixture-helper.js';

describe('generate (--config-emoji)', function () {
  describe('basic', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('generate', 'option-config-emoji', 'basic'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('shows the correct emojis', async function () {
      await generate(tempDir, {
        configEmoji: [
          ['recommended', '🔥'],
          ['stylistic', '🎨'],
          ['custom', '🌟'],
        ],
      });
      expect(readFileSync(join(tempDir, 'README.md'), 'utf8')).toMatchSnapshot();
      expect(readFileSync(join(tempDir, 'docs/rules/no-foo.md'), 'utf8')).toMatchSnapshot();
      expect(readFileSync(join(tempDir, 'docs/rules/no-bar.md'), 'utf8')).toMatchSnapshot();
      expect(readFileSync(join(tempDir, 'docs/rules/no-baz.md'), 'utf8')).toMatchSnapshot();
    });
  });

  describe('with default emoji for common config', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('generate', 'option-config-emoji', 'default-emoji'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('uses the default emoji when no configEmoji option is provided', async function () {
      await generate(tempDir); // No configEmoji option - should use default ✅ for recommended
      expect(readFileSync(join(tempDir, 'README.md'), 'utf8')).toMatchSnapshot();
      expect(readFileSync(join(tempDir, 'docs/rules/no-foo.md'), 'utf8')).toMatchSnapshot();
    });
  });

  describe('with manually supplied badge markdown', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('generate', 'option-config-emoji', 'badge-markdown'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('uses the badge markdown as provided', async function () {
      await generate(tempDir, {
        configEmoji: [
          [
            'funConfig',
            '![fun config badge](https://img.shields.io/badge/-fun-blue.svg)',
          ],
        ],
      });
      expect(readFileSync(join(tempDir, 'README.md'), 'utf8')).toMatchSnapshot();
      expect(readFileSync(join(tempDir, 'docs/rules/no-foo.md'), 'utf8')).toMatchSnapshot();
    });
  });

  describe('with missing emoji for a config', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('generate', 'option-config-emoji', 'missing-emoji'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('throws an error for configs without emojis', async function () {
      await expect(
        generate(tempDir, {
          configEmoji: [
            ['bar', '🎨'],
            // no emoji for baz - should throw error
            ['foo', '🔥'],
          ],
        }),
      ).rejects.toThrow(
        'Config "baz" does not have an emoji. Please provide one using the --config-emoji option or ignore the config using --ignore-config.',
      );
    });
  });

  describe('invalid format', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('generate', 'option-config-emoji', 'invalid-format'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('throws an error', async function () {
      await expect(
        // @ts-expect-error -- testing invalid input (too many items)
        generate(tempDir, { configEmoji: [['foo', 'bar', 'baz']] }),
      ).rejects.toThrow(
        'Invalid configEmoji option: foo,bar,baz. Expected format: config,emoji',
      );

      await expect(
        // @ts-expect-error -- testing invalid input (too few items)
        generate(tempDir, { configEmoji: [[]] }),
      ).rejects.toThrow(
        'Invalid configEmoji option: . Expected format: config,emoji',
      );
    });
  });

  describe('trying to remove a default emoji that does not exist', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('generate', 'option-config-emoji', 'invalid-format'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('throws an error', async function () {
      await expect(
        generate(tempDir, { configEmoji: [['config-without-default-emoji']] }),
      ).rejects.toThrow(
        'Invalid configEmoji option: config-without-default-emoji. Expected format: config,emoji',
      );
    });
  });

  describe('removing default emoji for a config', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('generate', 'option-config-emoji', 'remove-default-emoji'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('throws an error when no emoji is provided', async function () {
      await expect(
        generate(tempDir, {
          configEmoji: [['recommended']],
        }),
      ).rejects.toThrow(
        'Config "recommended" does not have an emoji. Please provide one using the --config-emoji option or ignore the config using --ignore-config.',
      );
    });
  });

  describe('non-existent config', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('generate', 'option-config-emoji', 'non-existent-config'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('throws an error', async function () {
      await expect(
        generate(tempDir, { configEmoji: [['config-does-not-exist', '🔥']] }),
      ).rejects.toThrow(
        'Invalid configEmoji option: config-does-not-exist config not found.',
      );
    });
  });

  describe('using a reserved emoji', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('generate', 'option-config-emoji', 'reserved-emoji'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('throws an error', async function () {
      await expect(
        generate(tempDir, { configEmoji: [['recommended', EMOJI_CONFIG_ERROR]] }),
      ).rejects.toThrow(`Cannot specify reserved emoji ${EMOJI_CONFIG_ERROR}.`);
    });
  });

  describe('duplicate config name', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('generate', 'option-config-emoji', 'duplicate-config'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('throws an error', async function () {
      await expect(
        generate(tempDir, {
          configEmoji: [
            ['recommended', '🔥'],
            ['recommended', '😋'],
          ],
        }),
      ).rejects.toThrow(
        'Duplicate config name in configEmoji options: recommended',
      );
    });
  });

  describe('with one config that does not have emoji', function () {
    let tempDir: string;

    beforeEach(function () {
      tempDir = setupFixture(
        getFixturePath('generate', 'option-config-emoji', 'config-without-emoji'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDir);
    });

    it('throws an error', async function () {
      await expect(generate(tempDir)).rejects.toThrow(
        'Config "configWithoutEmoji" does not have an emoji. Please provide one using the --config-emoji option or ignore the config using --ignore-config.',
      );
    });
  });
});
