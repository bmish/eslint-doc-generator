import { Command, Argument } from 'commander';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { generate } from './generator.js';
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
    .option(
      '--url-configs <url>',
      '(optional) Link to documentation about the ESLint configurations exported by the plugin.'
    )
    .action(async function (path, options: { urlConfigs?: string }) {
      await generate(path, { urlConfigs: options.urlConfigs });
    })
    .parse(process.argv);

  return program;
}
