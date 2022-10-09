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

export function run() {
  const program = new Command();

  program
    .version(getCurrentPackageVersion())
    .addArgument(
      new Argument('[path]', 'path to ESLint plugin root').default('.')
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
      options: { ruleDocTitleFormat: RuleDocTitleFormat; urlConfigs?: string }
    ) {
      await generate(path, {
        ruleDocTitleFormat: options.ruleDocTitleFormat,
        urlConfigs: options.urlConfigs,
      });
    })
    .parse(process.argv);

  return program;
}
