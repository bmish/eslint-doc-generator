import { Command, Argument, Option } from 'commander';
import { readFileSync } from 'node:fs';
import { RULE_DOC_TITLE_FORMATS } from './rule-doc-title-format.js';
import { OPTION_DEFAULTS, OPTION_TYPE, GenerateOptions } from './options.js';
import { cosmiconfig } from 'cosmiconfig';
import Ajv from 'ajv';
import merge from 'deepmerge';
import { COLUMN_TYPE, NOTICE_TYPE } from './types.js';
import type { PackageJson } from 'type-fest';

function getCurrentPackageVersion(): string {
  // When running as compiled code, use path relative to compiled version of this file in the dist folder.
  // When running as TypeScript (in a test), use path relative to this file.
  const pathToPackageJson = import.meta.url.endsWith('.ts')
    ? '../package.json'
    : /* istanbul ignore next -- can't test the compiled version in test */
      '../../package.json';
  const packageJson: PackageJson = JSON.parse(
    readFileSync(new URL(pathToPackageJson, import.meta.url), 'utf8')
  );
  if (!packageJson.version) {
    throw new Error('Could not find package.json `version`.');
  }
  return packageJson.version;
}

/** Used for collecting repeated CLI options into an array. */
function collect(value: string, previous: string[]) {
  return [...previous, value];
}

function parseBoolean(value: string | undefined): boolean {
  return ['true', undefined].includes(value);
}

/**
 * Load and validate the config file.
 * Cosmiconfig supports many possible filenames/formats.
 */
async function loadConfigFileOptions() {
  const explorer = cosmiconfig('eslint-doc-generator');
  const explorerResults = await explorer.search();
  if (explorerResults && !explorerResults.isEmpty) {
    // Validate schema for config file.
    const schemaStringArray = {
      type: 'array',
      uniqueItems: true,
      minItems: 1,
      items: {
        type: 'string',
        minLength: 1,
      },
    };
    const properties: { [key in OPTION_TYPE]: unknown } = {
      check: { type: 'boolean' },
      configEmoji: schemaStringArray,
      ignoreConfig: schemaStringArray,
      ignoreDeprecatedRules: { type: 'boolean' },
      initRuleDocs: { type: 'boolean' },
      pathRuleDoc: { type: 'string' },
      pathRuleList: { type: 'string' },
      ruleDocNotices: { type: 'string' },
      ruleDocSectionExclude: schemaStringArray,
      ruleDocSectionInclude: schemaStringArray,
      ruleDocSectionOptions: { type: 'boolean' },
      ruleDocTitleFormat: { type: 'string' },
      ruleListColumns: { type: 'string' },
      splitBy: { type: 'string' },
      urlConfigs: { type: 'string' },
    };
    const schema = {
      type: 'object',
      properties,
      additionalProperties: false,
    };

    const ajv = new Ajv();
    const validate = ajv.compile(schema);
    const valid = validate(explorerResults.config);
    if (!valid) {
      throw new Error(
        validate.errors
          ? ajv.errorsText(validate.errors, { dataVar: 'config file' })
          : /* istanbul ignore next -- this shouldn't happen */
            'Invalid config file'
      );
    }

    return explorerResults.config;
  }
  return {};
}

/**
 * Run the CLI and gather options.
 * When this is done, load any config file and merge with the CLI options.
 * Finally, invoke a callback with the merged options.
 * Note: Does not introduce default values. Default values should be handled in the callback function.
 */
export async function run(
  argv: string[],
  cb: (path: string, options: GenerateOptions) => Promise<void>
) {
  const program = new Command();

  await program
    .version(getCurrentPackageVersion())
    .addArgument(
      new Argument('[path]', 'path to ESLint plugin root').default('.')
    )
    .option(
      '--check [boolean]',
      `(optional) Whether to check for and fail if there is a diff. No output will be written. Typically used during CI. (default: ${
        OPTION_DEFAULTS[OPTION_TYPE.CHECK]
      })`,
      parseBoolean
    )
    .option(
      '--config-emoji <config-emoji>',
      '(optional) Custom emoji to use for a config. Format is `config-name,emoji`. Default emojis are provided for common configs. To remove a default emoji and rely on a badge instead, provide the config name without an emoji. Option can be repeated.',
      collect,
      []
    )
    .option(
      '--ignore-config <config>',
      '(optional) Config to ignore from being displayed (often used for an `all` config) (option can be repeated).',
      collect,
      []
    )
    .option(
      '--ignore-deprecated-rules [boolean]',
      `(optional) Whether to ignore deprecated rules from being checked, displayed, or updated. (default: ${
        OPTION_DEFAULTS[OPTION_TYPE.IGNORE_DEPRECATED_RULES]
      })`,
      parseBoolean
    )
    .option(
      '--init-rule-docs [boolean]',
      `(optional) Whether to create rule doc files if they don't yet exist. (default: ${
        OPTION_DEFAULTS[OPTION_TYPE.INIT_RULE_DOCS]
      })`,
      parseBoolean
    )
    .option(
      '--path-rule-doc <path>',
      `(optional) Path to markdown file for each rule doc. Use \`{name}\` placeholder for the rule name. (default: ${
        OPTION_DEFAULTS[OPTION_TYPE.PATH_RULE_DOC]
      })`
    )
    .option(
      '--path-rule-list <path>',
      `(optional) Path to markdown file with a rules section where the rules table list should live. (default: ${
        OPTION_DEFAULTS[OPTION_TYPE.PATH_RULE_LIST]
      })`
    )
    .option(
      '--rule-doc-notices <notices>',
      `(optional) Ordered, comma-separated list of notices to display in rule doc. Non-applicable notices will be hidden. (choices: "${Object.values(
        NOTICE_TYPE
      ).join('", "')}") (default: ${
        OPTION_DEFAULTS[OPTION_TYPE.RULE_DOC_NOTICES]
      })`
    )
    .option(
      '--rule-doc-section-exclude <section>',
      '(optional) Disallowed section in each rule doc (option can be repeated).',
      collect,
      []
    )
    .option(
      '--rule-doc-section-include <section>',
      '(optional) Required section in each rule doc (option can be repeated).',
      collect,
      []
    )
    .option(
      '--rule-doc-section-options [boolean]',
      `(optional) Whether to require an "Options" or "Config" rule doc section and mention of any named options for rules with options. (default: ${
        OPTION_DEFAULTS[OPTION_TYPE.RULE_DOC_SECTION_OPTIONS]
      })`,
      parseBoolean
    )
    .addOption(
      new Option(
        '--rule-doc-title-format <format>',
        `(optional) The format to use for rule doc titles. (default: ${
          OPTION_DEFAULTS[OPTION_TYPE.RULE_DOC_TITLE_FORMAT]
        })`
      ).choices(RULE_DOC_TITLE_FORMATS)
    )
    .option(
      '--rule-list-columns <columns>',
      `(optional) Ordered, comma-separated list of columns to display in rule list. Empty columns will be hidden. (choices: "${Object.values(
        COLUMN_TYPE
      ).join('", "')})" (default: ${
        OPTION_DEFAULTS[OPTION_TYPE.RULE_LIST_COLUMNS]
      })`
    )
    .option(
      '--split-by <property>',
      '(optional) Rule property to split the rules list by. A separate list and header will be created for each value. Example: `meta.type`.'
    )
    .option(
      '--url-configs <url>',
      '(optional) Link to documentation about the ESLint configurations exported by the plugin.'
    )
    .action(async function (path, options: GenerateOptions) {
      // Load config file options and merge with CLI options.
      // CLI options take precedence.
      // For this to work, we can't have any default values from the CLI options that will override the config file options (except empty arrays, as arrays will be merged).
      // Default values should be handled in the callback function.
      const configFileOptions = await loadConfigFileOptions();
      const generateOptions = merge(configFileOptions, options); // Recursive merge.

      // Invoke callback.
      await cb(path, generateOptions);
    })
    .parseAsync(argv);

  return program;
}
