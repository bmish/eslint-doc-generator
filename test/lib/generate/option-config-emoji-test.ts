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
  let tempDir: string;

  beforeEach(function () {
    tempDir = setupFixture(getFixturePath('standard'));
  });

  afterEach(function () {
    cleanupFixture(tempDir);
  });

  it('shows the correct emojis', async function () {
    await generate(tempDir, {
      configEmoji: [
        ['recommended', '🔥'],
        ['style', '🎨'],
        ['all', '🌟'],
      ],
    });
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
  });

  it('uses the default emoji when no configEmoji option is provided', async function () {
    await generate(tempDir); // No configEmoji option - should use default ✅ for recommended
    expect(readFileSync(join(tempDir, 'README.md'), 'utf8')).toMatchSnapshot();
    expect(
      readFileSync(join(tempDir, 'docs/rules/no-foo.md'), 'utf8'),
    ).toMatchSnapshot();
  });

  it('uses the badge markdown as provided', async function () {
    await generate(tempDir, {
      configEmoji: [
        [
          'recommended',
          '![fun config badge](https://img.shields.io/badge/-fun-blue.svg)',
        ],
      ],
    });
    expect(readFileSync(join(tempDir, 'README.md'), 'utf8')).toMatchSnapshot();
    expect(
      readFileSync(join(tempDir, 'docs/rules/no-foo.md'), 'utf8'),
    ).toMatchSnapshot();
  });

  describe('with missing emoji for a config', function () {
    let tempDirMissing: string;

    beforeEach(function () {
      tempDirMissing = setupFixture(
        getFixturePath('error-cases', 'missing-config-emoji'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDirMissing);
    });

    it('throws an error for configs without emojis', async function () {
      await expect(
        generate(tempDirMissing, {
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

  it('throws an error for invalid format', async function () {
    await expect(
      // @ts-expect-error -- testing invalid input (too many items)
      generate(tempDir, { configEmoji: [['recommended', '🔥', 'extra']] }),
    ).rejects.toThrow(
      'Invalid configEmoji option: recommended,🔥,extra. Expected format: config,emoji',
    );

    await expect(
      // @ts-expect-error -- testing invalid input (too few items)
      generate(tempDir, { configEmoji: [[]] }),
    ).rejects.toThrow(
      'Invalid configEmoji option: . Expected format: config,emoji',
    );
  });

  it('throws an error when trying to remove a default emoji that does not exist', async function () {
    await expect(
      generate(tempDir, { configEmoji: [['config-without-default-emoji']] }),
    ).rejects.toThrow(
      'Invalid configEmoji option: config-without-default-emoji. Expected format: config,emoji',
    );
  });

  it('throws an error when removing default emoji for a config', async function () {
    await expect(
      generate(tempDir, {
        configEmoji: [['recommended']],
      }),
    ).rejects.toThrow(
      'Config "recommended" does not have an emoji. Please provide one using the --config-emoji option or ignore the config using --ignore-config.',
    );
  });

  it('throws an error for non-existent config', async function () {
    await expect(
      generate(tempDir, { configEmoji: [['config-does-not-exist', '🔥']] }),
    ).rejects.toThrow(
      'Invalid configEmoji option: config-does-not-exist config not found.',
    );
  });

  it('throws an error when using a reserved emoji', async function () {
    await expect(
      generate(tempDir, { configEmoji: [['recommended', EMOJI_CONFIG_ERROR]] }),
    ).rejects.toThrow(`Cannot specify reserved emoji ${EMOJI_CONFIG_ERROR}.`);
  });

  it('throws an error for duplicate config name', async function () {
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

  describe('with one config that does not have emoji', function () {
    let tempDirNoEmoji: string;

    beforeEach(function () {
      tempDirNoEmoji = setupFixture(
        getFixturePath('edge-cases', 'config-without-emoji'),
      );
    });

    afterEach(function () {
      cleanupFixture(tempDirNoEmoji);
    });

    it('throws an error', async function () {
      await expect(generate(tempDirNoEmoji)).rejects.toThrow(
        'Config "configWithoutEmoji" does not have an emoji. Please provide one using the --config-emoji option or ignore the config using --ignore-config.',
      );
    });
  });
});
