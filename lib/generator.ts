import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { getAllNamedOptions, hasOptions } from './rule-options.js';
import {
  loadPlugin,
  getPluginPrefix,
  getPluginRoot,
  getPathWithExactFileNameCasing,
} from './package-json.js';
import { updateRulesList } from './rule-list.js';
import { generateRuleHeaderLines } from './rule-notices.js';
import {
  parseRuleDocNoticesOption,
  parseRuleListColumnsOption,
  parseConfigEmojiOptions,
} from './option-parsers.js';
import { END_RULE_HEADER_MARKER } from './markers.js';
import { findSectionHeader, replaceOrCreateHeader } from './markdown.js';
import { resolveConfigsToRules } from './config-resolution.js';
import { OPTION_DEFAULTS, OPTION_TYPE, GenerateOptions } from './options.js';
import { diff } from 'jest-diff';
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
  // Check for the content and also the versions of the content with escaped quotes
  // in case escaping is needed where the content is referenced.
  const hasContent =
    contents.includes(content) ||
    contents.includes(content.replace(/"/g, '\\"')) ||
    contents.includes(content.replace(/'/g, "\\'"));
  if (hasContent !== expected) {
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
    if (possibleHeaders.length > 1) {
      console.error(
        `\`${ruleName}\` rule doc should ${
          expected ? '' : 'not '
        }have included ${
          expected ? 'one' : 'any'
        } of these headers: ${possibleHeaders.join(', ')}`
      );
    } else {
      console.error(
        `\`${ruleName}\` rule doc should ${
          expected ? '' : 'not '
        }have included the header: ${possibleHeaders.join(', ')}`
      );
    }

    process.exitCode = 1;
  }
}

// eslint-disable-next-line complexity
export async function generate(path: string, options?: GenerateOptions) {
  const plugin = await loadPlugin(path);
  const pluginPrefix = getPluginPrefix(path);
  const configsToRules = await resolveConfigsToRules(plugin);

  if (!plugin.rules) {
    throw new Error('Could not find exported `rules` object in ESLint plugin.');
  }

  // Options. Add default values as needed.
  const check = options?.check ?? OPTION_DEFAULTS[OPTION_TYPE.CHECK];
  const configEmojis = parseConfigEmojiOptions(plugin, options?.configEmoji);
  const ignoreConfig =
    options?.ignoreConfig ?? OPTION_DEFAULTS[OPTION_TYPE.IGNORE_CONFIG];
  const ignoreDeprecatedRules =
    options?.ignoreDeprecatedRules ??
    OPTION_DEFAULTS[OPTION_TYPE.IGNORE_DEPRECATED_RULES];
  const initRuleDocs =
    options?.initRuleDocs ?? OPTION_DEFAULTS[OPTION_TYPE.INIT_RULE_DOCS];
  const pathRuleDoc =
    options?.pathRuleDoc ?? OPTION_DEFAULTS[OPTION_TYPE.PATH_RULE_DOC];
  const pathRuleList =
    options?.pathRuleList ?? OPTION_DEFAULTS[OPTION_TYPE.PATH_RULE_LIST];
  const ruleDocNotices = parseRuleDocNoticesOption(options?.ruleDocNotices);
  const ruleDocSectionExclude =
    options?.ruleDocSectionExclude ??
    OPTION_DEFAULTS[OPTION_TYPE.RULE_DOC_SECTION_EXCLUDE];
  const ruleDocSectionInclude =
    options?.ruleDocSectionInclude ??
    OPTION_DEFAULTS[OPTION_TYPE.RULE_DOC_SECTION_INCLUDE];
  const ruleDocSectionOptions =
    options?.ruleDocSectionOptions ??
    OPTION_DEFAULTS[OPTION_TYPE.RULE_DOC_SECTION_OPTIONS];
  const ruleDocTitleFormat =
    options?.ruleDocTitleFormat ??
    OPTION_DEFAULTS[OPTION_TYPE.RULE_DOC_TITLE_FORMAT];
  const ruleListColumns = parseRuleListColumnsOption(options?.ruleListColumns);
  const splitBy = options?.splitBy ?? OPTION_DEFAULTS[OPTION_TYPE.SPLIT_BY];
  const urlConfigs =
    options?.urlConfigs ?? OPTION_DEFAULTS[OPTION_TYPE.URL_CONFIGS];

  // Gather details about rules.
  const details: RuleDetails[] = Object.entries(plugin.rules)
    .map(([name, rule]): RuleDetails => {
      return typeof rule === 'object'
        ? // Object-style rule.
          {
            name,
            description: rule.meta?.docs?.description,
            fixable: rule.meta?.fixable
              ? ['code', 'whitespace'].includes(rule.meta.fixable)
              : false,
            hasSuggestions: rule.meta?.hasSuggestions ?? false,
            requiresTypeChecking:
              rule.meta?.docs?.requiresTypeChecking ?? false,
            deprecated: rule.meta?.deprecated ?? false,
            schema: rule.meta?.schema,
            type: rule.meta?.type,
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
            type: undefined,
          };
    })
    .filter(
      // Filter out deprecated rules from being checked, displayed, or updated if the option is set.
      (details) => !ignoreDeprecatedRules || !details.deprecated
    );

  // Update rule doc for each rule.
  for (const { name, description, schema } of details) {
    const pathToDoc = join(path, pathRuleDoc).replace(/{name}/g, name);

    if (!existsSync(pathToDoc)) {
      if (!initRuleDocs) {
        throw new Error(
          `Could not find rule doc: ${relative(getPluginRoot(path), pathToDoc)}`
        );
      }

      mkdirSync(dirname(pathToDoc), { recursive: true });
      writeFileSync(pathToDoc, '', {});
    }

    // Regenerate the header (title/notices) of each rule doc.
    const newHeaderLines = generateRuleHeaderLines(
      description,
      name,
      plugin,
      configsToRules,
      pluginPrefix,
      configEmojis,
      ignoreConfig,
      ruleDocNotices,
      ruleDocTitleFormat,
      urlConfigs
    );

    const contents = readFileSync(pathToDoc).toString();
    const contentsNew = replaceOrCreateHeader(
      contents,
      newHeaderLines,
      END_RULE_HEADER_MARKER
    );

    if (check) {
      if (contentsNew !== contents) {
        console.error(
          `Please run eslint-doc-generator. A rule doc is out-of-date: ${relative(
            getPluginRoot(path),
            pathToDoc
          )}`
        );
        console.error(diff(contentsNew, contents, { expand: false }));
        process.exitCode = 1;
      }
    } else {
      writeFileSync(pathToDoc, contentsNew);
    }

    // Check for potential issues with the rule doc.

    // Check for required sections.
    for (const section of ruleDocSectionInclude) {
      expectSectionHeader(name, contents, [section], true);
    }

    // Check for disallowed sections.
    for (const section of ruleDocSectionExclude) {
      expectSectionHeader(name, contents, [section], false);
    }

    if (ruleDocSectionOptions) {
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
  }

  // Find the README.
  const pathToReadme = getPathWithExactFileNameCasing(join(path, pathRuleList));
  if (!pathToReadme || !existsSync(pathToReadme)) {
    throw new Error(`Could not find ${pathRuleList} in ESLint plugin.`);
  }

  // Update the rules list in the README.
  const readmeContents = readFileSync(pathToReadme, 'utf8');
  const readmeContentsNew = updateRulesList(
    details,
    readmeContents,
    plugin,
    configsToRules,
    pluginPrefix,
    pathRuleDoc,
    pathToReadme,
    path,
    configEmojis,
    ignoreConfig,
    ruleListColumns,
    urlConfigs,
    splitBy
  );

  if (check) {
    if (readmeContentsNew !== readmeContents) {
      console.error(
        `Please run eslint-doc-generator. ${relative(
          getPluginRoot(path),
          pathToReadme
        )} is out-of-date.`
      );
      console.error(diff(readmeContentsNew, readmeContents, { expand: false }));
      process.exitCode = 1;
    }
  } else {
    writeFileSync(pathToReadme, readmeContentsNew, 'utf8');
  }
}
