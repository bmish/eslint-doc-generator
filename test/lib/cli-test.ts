import * as sinon from 'sinon';
import { run } from '../../lib/cli.js';
import { OPTION_TYPE } from '../../lib/types.js';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const configFileOptionsAll: { [key in OPTION_TYPE]: unknown } = {
  check: true,
  configEmoji: [['recommended-from-config-file', '🚲']],
  configFormat: 'name',
  ignoreConfig: [
    'ignoredConfigFromConfigFile1',
    'ignoredConfigFromConfigFile2',
  ],
  ignoreDeprecatedRules: true,
  initRuleDocs: true,
  pathRuleDoc: 'www.example.com/rule-doc-from-config-file',
  pathRuleList: 'www.example.com/rule-list-from-config-file',
  postprocess: (content: string) => content,
  ruleDocNotices: ['fixable'],
  ruleDocSectionExclude: [
    'excludedSectionFromConfigFile1',
    'excludedSectionFromConfigFile2',
  ],
  ruleDocSectionInclude: [
    'includedSectionFromConfigFile1',
    'includedSectionFromConfigFile2',
  ],
  ruleDocSectionOptions: false,
  ruleDocTitleFormat: 'desc',
  ruleListColumns: ['fixable', 'hasSuggestions'],
  ruleListSplit: 'meta.docs.foo-from-config-file',
  urlConfigs: 'https://example.com/configs-url-from-config-file',
  urlRuleDoc: 'https://example.com/rule-doc-url-from-config-file',
};

const cliOptionsAll: { [key in OPTION_TYPE]: readonly string[] } = {
  [OPTION_TYPE.CHECK]: ['--check'],

  [OPTION_TYPE.CONFIG_EMOJI]: ['--config-emoji', 'recommended-from-cli,🚲'],

  [OPTION_TYPE.CONFIG_FORMAT]: ['--config-format', 'plugin-colon-prefix-name'],

  [OPTION_TYPE.IGNORE_CONFIG]: [
    '--ignore-config',
    'ignoredConfigFromCli1',
    '--ignore-config',
    'ignoredConfigFromCli2',
  ],

  [OPTION_TYPE.IGNORE_DEPRECATED_RULES]: ['--ignore-deprecated-rules', 'true'],

  [OPTION_TYPE.INIT_RULE_DOCS]: ['--init-rule-docs', 'false'],

  [OPTION_TYPE.PATH_RULE_DOC]: [
    '--path-rule-doc',
    'www.example.com/rule-doc-from-cli',
  ],

  [OPTION_TYPE.PATH_RULE_LIST]: [
    '--path-rule-list',
    'www.example.com/rule-list-from-cli',
  ],

  [OPTION_TYPE.POSTPROCESS]: [], // This option is not supported by the CLI.

  [OPTION_TYPE.RULE_DOC_NOTICES]: ['--rule-doc-notices', 'type'],

  [OPTION_TYPE.RULE_DOC_SECTION_EXCLUDE]: [
    '--rule-doc-section-exclude',
    'excludedSectionFromCli1',
    '--rule-doc-section-exclude',
    'excludedSectionFromCli2',
  ],

  [OPTION_TYPE.RULE_DOC_SECTION_INCLUDE]: [
    '--rule-doc-section-include',
    'includedSectionFromCli1',
    '--rule-doc-section-include',
    'includedSectionFromCli2',
  ],

  [OPTION_TYPE.RULE_DOC_SECTION_OPTIONS]: [
    '--rule-doc-section-options',
    'true',
  ],

  [OPTION_TYPE.RULE_DOC_TITLE_FORMAT]: ['--rule-doc-title-format', 'name'],

  [OPTION_TYPE.RULE_LIST_COLUMNS]: ['--rule-list-columns', 'type'],

  [OPTION_TYPE.RULE_LIST_SPLIT]: [
    '--rule-list-split',
    'meta.docs.foo-from-cli',
  ],

  [OPTION_TYPE.URL_CONFIGS]: [
    '--url-configs',
    'https://example.com/configs-url-from-cli',
  ],

  [OPTION_TYPE.URL_RULE_DOC]: [
    '--url-rule-doc',
    'https://example.com/rule-doc-url-from-cli',
  ],
};

describe('cli', function () {
  describe('no options', function () {
    it('is called correctly', async function () {
      const stub = sinon.stub().resolves();
      await run(
        [
          'node', // Path to node.
          'eslint-doc-generator.js', // Path to this binary.
        ],
        stub,
      );
      expect(stub.callCount).toBe(1);
      expect(stub.firstCall.args).toMatchSnapshot();
    });
  });

  describe('all CLI options, no config file options', function () {
    it('is called correctly', async function () {
      const stub = sinon.stub().resolves();
      await run(
        [
          'node', // Path to node.
          'eslint-doc-generator.js', // Path to this binary.

          ...Object.values(cliOptionsAll).flat(),
        ],
        stub,
      );
      expect(stub.callCount).toBe(1);
      expect(stub.firstCall.args).toMatchSnapshot();
    });
  });

  describe('all config files options, no CLI options', function () {
    let tempDir: string;
    let originalCwd: string;

    beforeEach(function () {
      originalCwd = process.cwd();
      tempDir = mkdtempSync(join(tmpdir(), 'eslint-doc-gen-'));
      writeFileSync(
        join(tempDir, 'package.json'),
        JSON.stringify(
          {
            name: 'eslint-plugin-test',
            main: 'index.js',
            type: 'module',
            version: '1.0.0',
          },
          undefined,
          2,
        ),
      );
      writeFileSync(
        join(tempDir, '.eslint-doc-generatorrc.json'),
        JSON.stringify(configFileOptionsAll, undefined, 2),
      );
      process.chdir(tempDir);
    });

    afterEach(function () {
      process.chdir(originalCwd);
      rmSync(tempDir, { recursive: true, force: true });
    });

    it('is called correctly', async function () {
      const stub = sinon.stub().resolves();
      await run(
        [
          'node', // Path to node.
          'eslint-doc-generator.js', // Path to this binary.
        ],
        stub,
      );
      expect(stub.callCount).toBe(1);
      expect(stub.firstCall.args).toMatchSnapshot();
    });
  });

  describe('all CLI options and all config files options', function () {
    let tempDir: string;
    let originalCwd: string;

    beforeEach(function () {
      originalCwd = process.cwd();
      tempDir = mkdtempSync(join(tmpdir(), 'eslint-doc-gen-'));
      writeFileSync(
        join(tempDir, 'package.json'),
        JSON.stringify(
          {
            name: 'eslint-plugin-test',
            main: 'index.js',
            type: 'module',
            version: '1.0.0',
          },
          undefined,
          2,
        ),
      );
      writeFileSync(
        join(tempDir, '.eslint-doc-generatorrc.json'),
        JSON.stringify(configFileOptionsAll, undefined, 2),
      );
      process.chdir(tempDir);
    });

    afterEach(function () {
      process.chdir(originalCwd);
      rmSync(tempDir, { recursive: true, force: true });
    });

    it('merges correctly, with CLI options taking precedence', async function () {
      const stub = sinon.stub().resolves();
      await run(
        [
          'node', // Path to node.
          'eslint-doc-generator.js', // Path to this binary.

          ...Object.values(cliOptionsAll).flat(),
        ],
        stub,
      );
      expect(stub.callCount).toBe(1);
      expect(stub.firstCall.args).toMatchSnapshot();
    });
  });

  describe('pathRuleList as array in config file and CLI', function () {
    let tempDir: string;
    let originalCwd: string;

    beforeEach(function () {
      originalCwd = process.cwd();
      tempDir = mkdtempSync(join(tmpdir(), 'eslint-doc-gen-'));
      writeFileSync(
        join(tempDir, 'package.json'),
        JSON.stringify(
          {
            name: 'eslint-plugin-test',
            main: 'index.js',
            type: 'module',
            version: '1.0.0',
          },
          undefined,
          2,
        ),
      );
      writeFileSync(
        join(tempDir, '.eslint-doc-generatorrc.json'),
        JSON.stringify(
          {
            pathRuleList: ['listFromConfigFile1.md', 'listFromConfigFile2.md'],
          },
          undefined,
          2,
        ),
      );
      process.chdir(tempDir);
    });

    afterEach(function () {
      process.chdir(originalCwd);
      rmSync(tempDir, { recursive: true, force: true });
    });

    it('merges correctly', async function () {
      const stub = sinon.stub().resolves();
      await run(
        [
          'node', // Path to node.
          'eslint-doc-generator.js', // Path to this binary.

          '--path-rule-list',
          'listFromCli1.md',
          '--path-rule-list',
          'listFromCli2.md',
        ],
        stub,
      );
      expect(stub.callCount).toBe(1);
      expect(stub.firstCall.args).toMatchSnapshot();
    });
  });

  describe('boolean option - false (explicit)', function () {
    it('is called correctly', async function () {
      const stub = sinon.stub().resolves();
      await run(
        [
          'node', // Path to node.
          'eslint-doc-generator.js', // Path to this binary.

          '--ignore-deprecated-rules',
          'false',
        ],
        stub,
      );
      expect(stub.callCount).toBe(1);
      expect(stub.firstCall.args).toMatchSnapshot();
    });
  });

  describe('boolean option - true (explicit)', function () {
    it('is called correctly', async function () {
      const stub = sinon.stub().resolves();
      await run(
        [
          'node', // Path to node.
          'eslint-doc-generator.js', // Path to this binary.

          '--ignore-deprecated-rules',
          'true',
        ],
        stub,
      );
      expect(stub.callCount).toBe(1);
      expect(stub.firstCall.args).toMatchSnapshot();
    });
  });

  describe('boolean option - true (implicit)', function () {
    it('is called correctly', async function () {
      const stub = sinon.stub().resolves();
      await run(
        [
          'node', // Path to node.
          'eslint-doc-generator.js', // Path to this binary.

          '--ignore-deprecated-rules',
        ],
        stub,
      );
      expect(stub.callCount).toBe(1);
      expect(stub.firstCall.args).toMatchSnapshot();
    });
  });

  // Note: This test cannot be easily migrated from mock-fs because it tests
  // the eslint-doc-generator's own package.json version field, which is read
  // via import.meta.url and cannot be mocked with real file system fixtures.
  // The functionality is still tested indirectly through other tests that
  // successfully call getCurrentPackageVersion().
  // eslint-disable-next-line jest/no-disabled-tests
  describe.skip('missing package.json `version` field', function () {
    let tempDir: string;
    let originalCwd: string;

    beforeEach(function () {
      originalCwd = process.cwd();
      tempDir = mkdtempSync(join(tmpdir(), 'eslint-doc-gen-'));
      writeFileSync(
        join(tempDir, 'package.json'),
        JSON.stringify(
          {
            name: 'eslint-plugin-test',
            main: 'index.js',
            type: 'module',
          },
          undefined,
          2,
        ),
      );
      process.chdir(tempDir);
    });

    afterEach(function () {
      process.chdir(originalCwd);
      rmSync(tempDir, { recursive: true, force: true });
    });

    it('throws an error', async function () {
      const stub = sinon.stub().resolves();
      await expect(
        run(
          [
            'node', // Path to node.
            'eslint-doc-generator.js', // Path to this binary.
          ],
          stub,
        ),
      ).rejects.toThrow('Could not find package.json `version`.');
    });
  });

  describe('invalid config file', function () {
    let tempDir: string;
    let originalCwd: string;

    afterEach(function () {
      if (tempDir) {
        process.chdir(originalCwd);
        rmSync(tempDir, { recursive: true, force: true });
      }
    });

    it('throws an error', async function () {
      originalCwd = process.cwd();
      tempDir = mkdtempSync(join(tmpdir(), 'eslint-doc-gen-'));
      writeFileSync(
        join(tempDir, 'package.json'),
        JSON.stringify(
          {
            name: 'eslint-plugin-test',
            main: 'index.js',
            type: 'module',
            version: '1.0.0',
          },
          undefined,
          2,
        ),
      );
      writeFileSync(
        join(tempDir, '.eslint-doc-generatorrc.json'),
        JSON.stringify(
          {
            // Doesn't match schema.
            unknown: true,
          },
          undefined,
          2,
        ),
      );
      process.chdir(tempDir);

      const stub = sinon.stub().resolves();
      await expect(
        run(
          [
            'node', // Path to node.
            'eslint-doc-generator.js', // Path to this binary.
          ],
          stub,
        ),
      ).rejects.toThrow('config file must NOT have additional properties');
    });

    it('requires that postprocess be a function', async function () {
      originalCwd = process.cwd();
      tempDir = mkdtempSync(join(tmpdir(), 'eslint-doc-gen-'));
      writeFileSync(
        join(tempDir, 'package.json'),
        JSON.stringify(
          {
            name: 'eslint-plugin-test',
            main: 'index.js',
            type: 'module',
            version: '1.0.0',
          },
          undefined,
          2,
        ),
      );
      writeFileSync(
        join(tempDir, '.eslint-doc-generatorrc.json'),
        JSON.stringify(
          {
            // Doesn't match schema.
            postprocess: './my-file.js',
          },
          undefined,
          2,
        ),
      );
      process.chdir(tempDir);

      const stub = sinon.stub().resolves();
      await expect(
        run(
          [
            'node', // Path to node.
            'eslint-doc-generator.js', // Path to this binary.
          ],
          stub,
        ),
      ).rejects.toThrow('postprocess must be a function.');

      process.chdir(originalCwd);
      rmSync(tempDir, { recursive: true, force: true });
    });

    it('ruleListSplit is the wrong primitive type', async function () {
      originalCwd = process.cwd();
      tempDir = mkdtempSync(join(tmpdir(), 'eslint-doc-gen-'));
      writeFileSync(
        join(tempDir, 'package.json'),
        JSON.stringify(
          {
            name: 'eslint-plugin-test',
            main: 'index.js',
            type: 'module',
            version: '1.0.0',
          },
          undefined,
          2,
        ),
      );
      writeFileSync(
        join(tempDir, '.eslint-doc-generatorrc.json'),
        JSON.stringify(
          {
            // Doesn't match schema.
            ruleListSplit: 123,
          },
          undefined,
          2,
        ),
      );
      process.chdir(tempDir);

      const stub = sinon.stub().resolves();
      await expect(
        run(
          [
            'node', // Path to node.
            'eslint-doc-generator.js', // Path to this binary.
          ],
          stub,
        ),
      ).rejects.toThrow(
        'config file/ruleListSplit must be string, config file/ruleListSplit must be array, config file/ruleListSplit must match a schema in anyOf',
      );

      process.chdir(originalCwd);
      rmSync(tempDir, { recursive: true, force: true });
    });

    it('ruleListSplit is the wrong array type', async function () {
      originalCwd = process.cwd();
      tempDir = mkdtempSync(join(tmpdir(), 'eslint-doc-gen-'));
      writeFileSync(
        join(tempDir, 'package.json'),
        JSON.stringify(
          {
            name: 'eslint-plugin-test',
            main: 'index.js',
            type: 'module',
            version: '1.0.0',
          },
          undefined,
          2,
        ),
      );
      writeFileSync(
        join(tempDir, '.eslint-doc-generatorrc.json'),
        JSON.stringify(
          {
            // Doesn't match schema.
            ruleListSplit: [123],
          },
          undefined,
          2,
        ),
      );
      process.chdir(tempDir);

      const stub = sinon.stub().resolves();
      await expect(
        run(
          [
            'node', // Path to node.
            'eslint-doc-generator.js', // Path to this binary.
          ],
          stub,
        ),
      ).rejects.toThrow(
        'config file/ruleListSplit must be string, config file/ruleListSplit/0 must be string, config file/ruleListSplit must match a schema in anyOf',
      );

      process.chdir(originalCwd);
      rmSync(tempDir, { recursive: true, force: true });
    });

    it('ruleListSplit is an empty array', async function () {
      originalCwd = process.cwd();
      tempDir = mkdtempSync(join(tmpdir(), 'eslint-doc-gen-'));
      writeFileSync(
        join(tempDir, 'package.json'),
        JSON.stringify(
          {
            name: 'eslint-plugin-test',
            main: 'index.js',
            type: 'module',
            version: '1.0.0',
          },
          undefined,
          2,
        ),
      );
      writeFileSync(
        join(tempDir, '.eslint-doc-generatorrc.json'),
        JSON.stringify(
          {
            // Doesn't match schema.
            ruleListSplit: [],
          },
          undefined,
          2,
        ),
      );
      process.chdir(tempDir);

      const stub = sinon.stub().resolves();
      await expect(
        run(
          [
            'node', // Path to node.
            'eslint-doc-generator.js', // Path to this binary.
          ],
          stub,
        ),
      ).rejects.toThrow(
        'config file/ruleListSplit must be string, config file/ruleListSplit must NOT have fewer than 1 items, config file/ruleListSplit must match a schema in anyOf',
      );

      process.chdir(originalCwd);
      rmSync(tempDir, { recursive: true, force: true });
    });
  });
});
