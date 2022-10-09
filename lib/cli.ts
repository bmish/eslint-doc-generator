import { Command, Argument, Option } from 'commander';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { generate } from './generator.js';
import {
  RuleDocTitleFormat,
  RULE_DOC_TITLE_FORMAT_DEFAULT,
  RULE_DOC_TITLE_FORMATS,
} from './rule-doc-title-format.js';
import type { PackageJson } from 'type-fest';

const __dirname = dirname(fileURLToPath(import.meta.url));

function getCurrentPackageVersion(): string {
  const packageJson: PackageJson = JSON.parse(
    readFileSync(join(__dirname, '..', '..', 'package.json'), 'utf8') // Relative to compiled version of this file in the dist folder.
  );
  if (!packageJson.version) {
    throw new Error('Could not find package.json `version`.');
  }
  return packageJson.version;
}

// Used for collecting repeated CLI options into an array.
function collect(value: string, previous: string[]) {
  return [...previous, value];
}

export function run() {
  const program = new Command();

  program
    .version(getCurrentPackageVersion())
    .addArgument(
      new Argument('[path]', 'path to ESLint plugin root').default('.')
    )
    .option(
      '--ignore-config',
      '(optional) Config to ignore from being displayed (often used for an `all` config) (option can be repeated).',
      collect,
      []
    )
    .option(
      '--ignore-deprecated-rules',
      '(optional) Whether to ignore deprecated rules from being checked, displayed, or updated.',
      false
    )
    .option(
      '--rule-doc-section-include <section>',
      '(optional) Required section in each rule doc (option can be repeated).',
      collect,
      []
    )
    .option(
      '--rule-doc-section-exclude <section>',
      '(optional) Disallowed section in each rule doc (option can be repeated).',
      collect,
      []
    )
    .addOption(
      new Option(
        '--rule-doc-title-format <format>',
        '(optional) The format to use for rule doc titles.'
      )
        .choices(RULE_DOC_TITLE_FORMATS)
        .default(RULE_DOC_TITLE_FORMAT_DEFAULT)
    )
    .option(
      '--url-configs <url>',
      '(optional) Link to documentation about the ESLint configurations exported by the plugin.'
    )
    .action(async function (
      path,
      options: {
        ignoreConfig: string[];
        ignoreDeprecatedRules?: boolean;
        ruleDocSectionInclude: string[];
        ruleDocSectionExclude: string[];
        ruleDocTitleFormat: RuleDocTitleFormat;
        urlConfigs?: string;
      }
    ) {
      await generate(path, {
        ignoreConfig: options.ignoreConfig,
        ignoreDeprecatedRules: options.ignoreDeprecatedRules,
        ruleDocSectionInclude: options.ruleDocSectionInclude,
        ruleDocSectionExclude: options.ruleDocSectionExclude,
        ruleDocTitleFormat: options.ruleDocTitleFormat,
        urlConfigs: options.urlConfigs,
      });
    })
    .parse(process.argv);

  return program;
}
