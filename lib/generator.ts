import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { getAllNamedOptions, hasOptions } from './rule-options.js';
import { loadPlugin, getPluginPrefix } from './package-json.js';
import { updateRulesList } from './rule-list.js';
import { generateRuleHeaderLines } from './rule-notices.js';
import { END_RULE_HEADER_MARKER } from './markers.js';
import { findSectionHeader, replaceOrCreateHeader } from './markdown.js';
import { resolveConfigsToRules } from './config-resolution.js';
import type { RuleDetails } from './types.js';

/**
 * Ensure a rule doc contains (or doesn't contain) some particular content.
 * Upon failure, output the failure and set a failure exit code.
 * @param ruleName - which rule we are checking
 * @param contents - the rule doc's contents
 * @param content - the content we are checking for
 * @param expected - whether the content should be present or not present
 */
function expectContent(
  ruleName: string,
  contents: string,
  content: string,
  expected: boolean
) {
  if (contents.includes(content) !== expected) {
    console.error(
      `\`${ruleName}\` rule doc should ${
        /* istanbul ignore next -- TODO: test !expected or remove parameter */
        expected ? '' : 'not '
      }have included: ${content}`
    );
    process.exitCode = 1;
  }
}

function expectSectionHeader(
  ruleName: string,
  contents: string,
  possibleHeaders: string[],
  expected: boolean
) {
  const found = possibleHeaders.some((header) =>
    findSectionHeader(contents, header)
  );
  if (found !== expected) {
    console.error(
      `\`${ruleName}\` rule doc should ${expected ? '' : 'not '}have included ${
        expected ? 'one' : 'any'
      } of these headers: ${possibleHeaders.join(', ')}`
    );
    process.exitCode = 1;
  }
}

export async function generate(path: string) {
  const plugin = await loadPlugin(path);
  const pluginPrefix = getPluginPrefix(path);
  const configsToRules = await resolveConfigsToRules(plugin);

  const pathTo = {
    readme: resolve(path, 'README.md'),
    docs: resolve(path, 'docs'),
  };

  if (!plugin.rules) {
    throw new Error('Could not find exported `rules` object in ESLint plugin.');
  }

  // Gather details about rules.
  const details: RuleDetails[] = Object.entries(plugin.rules).map(
    ([name, rule]): RuleDetails => {
      return typeof rule === 'object'
        ? // Object-style rule.
          {
            name,
            description: rule.meta.docs?.description,
            fixable: rule.meta.fixable
              ? ['code', 'whitespace'].includes(rule.meta.fixable)
              : false,
            hasSuggestions: rule.meta.hasSuggestions ?? false,
            requiresTypeChecking: rule.meta.docs?.requiresTypeChecking ?? false,
            deprecated: rule.meta.deprecated ?? false,
            schema: rule.meta.schema,
          }
        : // Deprecated function-style rule (does not support most of these features).
          {
            name,
            description: undefined,
            fixable: false,
            hasSuggestions: false,
            requiresTypeChecking: false,
            deprecated: false, // TODO: figure out how to access `deprecated` property that can be exported from function-style rules.
            schema: [], // TODO: figure out how to access `schema` property that can be exported from function-style rules.
          };
    }
  );

  // Update rule doc for each rule.
  for (const { name, description, schema, deprecated } of details) {
    const pathToDoc = join(pathTo.docs, 'rules', `${name}.md`);

    if (deprecated && !existsSync(pathToDoc)) {
      // Allow deprecated rules to forgo a rule doc file.
      continue;
    }

    // Regenerate the header (title/notices) of each rule doc.
    const newHeaderLines = generateRuleHeaderLines(
      description,
      name,
      plugin,
      configsToRules,
      pluginPrefix
    );

    const contents = readFileSync(pathToDoc).toString();
    const contentsNew = await replaceOrCreateHeader(
      contents,
      newHeaderLines,
      END_RULE_HEADER_MARKER,
      pathToDoc
    );

    writeFileSync(pathToDoc, contentsNew);

    // Check for potential issues with the rule doc.

    // Options section.
    expectSectionHeader(
      name,
      contents,
      ['Options', 'Config'],
      hasOptions(schema)
    );
    for (const namedOption of getAllNamedOptions(schema)) {
      expectContent(name, contents, namedOption, true); // Each rule option is mentioned.
    }
  }

  // Update the rules list in the README.
  const readme = await updateRulesList(
    details,
    readFileSync(pathTo.readme, 'utf8'),
    plugin,
    configsToRules,
    pluginPrefix,
    pathTo.readme
  );
  writeFileSync(pathTo.readme, readme, 'utf8');
}
