import * as sinon from 'sinon';
import { run } from '../../lib/cli.js';
import mockFs from 'mock-fs';
import { OPTION_TYPE } from '../../lib/types.js';

const configFileOptionsAll: { [key in OPTION_TYPE]: unknown } = {
  check: true,
  configEmoji: ['recommended-from-config-file,🚲'],
  ignoreConfig: [
    'ignoredConfigFromConfigFile1',
    'ignoredConfigFromConfigFile2',
  ],
  ignoreDeprecatedRules: true,
  initRuleDocs: true,
  pathRuleDoc: 'www.example.com/rule-doc-from-config-file',
  pathRuleList: 'www.example.com/rule-list-from-config-file',
  ruleDocNotices: 'type',
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
  ruleListColumns: 'fixable,hasSuggestions',
  splitBy: 'meta.docs.foo-from-config-file',
  urlConfigs: 'https://example.com/configs-url-from-config-file',
  urlRuleDoc: 'https://example.com/rule-doc-url-from-config-file',
};

const cliOptionsAll: { [key in OPTION_TYPE]: string[] } = {
  [OPTION_TYPE.CHECK]: ['--check'],

  [OPTION_TYPE.CONFIG_EMOJI]: ['--config-emoji', 'recommended-from-cli,🚲'],

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

  [OPTION_TYPE.SPLIT_BY]: ['--split-by', 'meta.docs.foo-from-cli'],

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
        stub
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
        stub
      );
      expect(stub.callCount).toBe(1);
      expect(stub.firstCall.args).toMatchSnapshot();
    });
  });

  describe('all config files options, no CLI options', function () {
    beforeEach(function () {
      mockFs({
        'package.json': JSON.stringify({
          name: 'eslint-plugin-test',
          main: 'index.js',
          type: 'module',
          version: '1.0.0',
        }),

        '.eslint-doc-generatorrc.json': JSON.stringify(configFileOptionsAll),
      });
    });

    afterEach(function () {
      mockFs.restore();
    });

    it('is called correctly', async function () {
      const stub = sinon.stub().resolves();
      await run(
        [
          'node', // Path to node.
          'eslint-doc-generator.js', // Path to this binary.
        ],
        stub
      );
      expect(stub.callCount).toBe(1);
      expect(stub.firstCall.args).toMatchSnapshot();
    });
  });

  describe('all CLI options and all config files options', function () {
    beforeEach(function () {
      mockFs({
        'package.json': JSON.stringify({
          name: 'eslint-plugin-test',
          main: 'index.js',
          type: 'module',
          version: '1.0.0',
        }),

        '.eslint-doc-generatorrc.json': JSON.stringify(configFileOptionsAll),
      });
    });

    afterEach(function () {
      mockFs.restore();
    });

    it('merges correctly, with CLI options taking precedence', async function () {
      const stub = sinon.stub().resolves();
      await run(
        [
          'node', // Path to node.
          'eslint-doc-generator.js', // Path to this binary.

          ...Object.values(cliOptionsAll).flat(),
        ],
        stub
      );
      expect(stub.callCount).toBe(1);
      expect(stub.firstCall.args).toMatchSnapshot();
    });
  });

  describe('pathRuleList as array in config file and CLI', function () {
    beforeEach(function () {
      mockFs({
        'package.json': JSON.stringify({
          name: 'eslint-plugin-test',
          main: 'index.js',
          type: 'module',
          version: '1.0.0',
        }),

        '.eslint-doc-generatorrc.json': JSON.stringify({
          pathRuleList: ['listFromConfigFile1.md', 'listFromConfigFile2.md'],
        }),
      });
    });

    afterEach(function () {
      mockFs.restore();
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
        stub
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
        stub
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
        stub
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
        stub
      );
      expect(stub.callCount).toBe(1);
      expect(stub.firstCall.args).toMatchSnapshot();
    });
  });

  describe('missing package.json `version` field', function () {
    beforeEach(function () {
      mockFs({
        'package.json': JSON.stringify({
          name: 'eslint-plugin-test',
          main: 'index.js',
          type: 'module',
        }),
      });
    });

    afterEach(function () {
      mockFs.restore();
    });

    it('throws an error', async function () {
      const stub = sinon.stub().resolves();
      await expect(
        run(
          [
            'node', // Path to node.
            'eslint-doc-generator.js', // Path to this binary.
          ],
          stub
        )
      ).rejects.toThrow('Could not find package.json `version`.');
    });
  });

  describe('invalid config file', function () {
    beforeEach(function () {
      mockFs({
        'package.json': JSON.stringify({
          name: 'eslint-plugin-test',
          main: 'index.js',
          type: 'module',
          version: '1.0.0',
        }),

        '.eslint-doc-generatorrc.json': '{ "unknown": true }', // Doesn't match schema.
      });
    });

    afterEach(function () {
      mockFs.restore();
    });

    it('throws an error', async function () {
      const stub = sinon.stub().resolves();
      await expect(
        run(
          [
            'node', // Path to node.
            'eslint-doc-generator.js', // Path to this binary.
          ],
          stub
        )
      ).rejects.toThrow('config file must NOT have additional properties');
    });
  });
});
