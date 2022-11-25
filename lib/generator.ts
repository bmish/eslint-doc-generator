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
import { generateRuleHeaderLines } from './rule-doc-notices.js';
import {
  parseRuleDocNoticesOption,
  parseRuleListColumnsOption,
  parseConfigEmojiOptions,
} from './option-parsers.js';
import { END_RULE_HEADER_MARKER } from './comment-markers.js';
import { findSectionHeader, replaceOrCreateHeader } from './markdown.js';
import { resolveConfigsToRules } from './plugin-config-resolution.js';
import { OPTION_DEFAULTS } from './options.js';
import { diff } from 'jest-diff';
import type { RuleDetails, GenerateOptions } from './types.js';
import { OPTION_TYPE } from './types.js';
import { replaceRulePlaceholder } from './rule-link.js';

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
    contents.includes(content.replace(/"/gu, '\\"')) ||
    contents.includes(content.replace(/'/gu, "\\'"));
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

function stringOrArrayWithFallback<T extends string | string[]>(
  stringOrArray: undefined | T,
  fallback: T
): T {
  return stringOrArray && stringOrArray.length > 0 ? stringOrArray : fallback;
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
  const ignoreConfig = stringOrArrayWithFallback(
    options?.ignoreConfig,
    OPTION_DEFAULTS[OPTION_TYPE.IGNORE_CONFIG]
  );
  const ignoreDeprecatedRules =
    options?.ignoreDeprecatedRules ??
    OPTION_DEFAULTS[OPTION_TYPE.IGNORE_DEPRECATED_RULES];
  const initRuleDocs =
    options?.initRuleDocs ?? OPTION_DEFAULTS[OPTION_TYPE.INIT_RULE_DOCS];
  const pathRuleDoc =
    options?.pathRuleDoc ?? OPTION_DEFAULTS[OPTION_TYPE.PATH_RULE_DOC];
  const pathRuleList = stringOrArrayWithFallback(
    options?.pathRuleList,
    OPTION_DEFAULTS[OPTION_TYPE.PATH_RULE_LIST]
  );
  const ruleDocNotices = parseRuleDocNoticesOption(options?.ruleDocNotices);
  const ruleDocSectionExclude = stringOrArrayWithFallback(
    options?.ruleDocSectionExclude,
    OPTION_DEFAULTS[OPTION_TYPE.RULE_DOC_SECTION_EXCLUDE]
  );
  const ruleDocSectionInclude = stringOrArrayWithFallback(
    options?.ruleDocSectionInclude,
    OPTION_DEFAULTS[OPTION_TYPE.RULE_DOC_SECTION_INCLUDE]
  );
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
  const urlRuleDoc =
    options?.urlRuleDoc ?? OPTION_DEFAULTS[OPTION_TYPE.URL_RULE_DOC];
  const postprocess =
    options?.postprocess ?? OPTION_DEFAULTS[OPTION_TYPE.POSTPROCESS];

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
  let initializedRuleDoc = false;
  for (const { name, description, schema } of details) {
    const pathToDoc = replaceRulePlaceholder(join(path, pathRuleDoc), name);

    if (!existsSync(pathToDoc)) {
      if (!initRuleDocs) {
        throw new Error(
          `Could not find rule doc: ${relative(getPluginRoot(path), pathToDoc)}`
        );
      }

      mkdirSync(dirname(pathToDoc), { recursive: true });
      writeFileSync(pathToDoc, '');
      initializedRuleDoc = true;
    }

    // Regenerate the header (title/notices) of each rule doc.
    const newHeaderLines = generateRuleHeaderLines(
      description,
      name,
      plugin,
      configsToRules,
      pluginPrefix,
      path,
      pathRuleDoc,
      configEmojis,
      ignoreConfig,
      ruleDocNotices,
      ruleDocTitleFormat,
      urlConfigs,
      urlRuleDoc
    );

    const contents = readFileSync(pathToDoc).toString();
    const contentsNew = await postprocess(
      replaceOrCreateHeader(contents, newHeaderLines, END_RULE_HEADER_MARKER),
      pathToDoc
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

  if (initRuleDocs && !initializedRuleDoc) {
    throw new Error(
      '--init-rule-docs was enabled, but no rule doc file needed to be created.'
    );
  }

  for (const pathRuleListItem of Array.isArray(pathRuleList)
    ? pathRuleList
    : [pathRuleList]) {
    // Find the exact filename.
    const pathToFile = getPathWithExactFileNameCasing(
      join(path, pathRuleListItem)
    );
    if (!pathToFile || !existsSync(pathToFile)) {
      throw new Error(`Could not find ${pathRuleList} in ESLint plugin.`);
    }

    // Update the rules list in this file.
    const fileContents = readFileSync(pathToFile, 'utf8');
    const fileContentsNew = await postprocess(
      updateRulesList(
        details,
        fileContents,
        plugin,
        configsToRules,
        pluginPrefix,
        pathRuleDoc,
        pathToFile,
        path,
        configEmojis,
        ignoreConfig,
        ruleListColumns,
        urlConfigs,
        urlRuleDoc,
        splitBy
      ),
      pathToFile
    );

    if (check) {
      if (fileContentsNew !== fileContents) {
        console.error(
          `Please run eslint-doc-generator. The rules table in ${relative(
            getPluginRoot(path),
            pathToFile
          )} is out-of-date.`
        );
        console.error(diff(fileContentsNew, fileContents, { expand: false }));
        process.exitCode = 1;
      }
    } else {
      writeFileSync(pathToFile, fileContentsNew, 'utf8');
    }
  }
}
