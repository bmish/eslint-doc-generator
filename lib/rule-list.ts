import { BEGIN_RULE_LIST_MARKER, END_RULE_LIST_MARKER } from './markers.js';
import {
  EMOJI_DEPRECATED,
  EMOJI_FIXABLE,
  EMOJI_HAS_SUGGESTIONS,
  EMOJI_OPTIONS,
  EMOJI_REQUIRES_TYPE_CHECKING,
} from './emojis.js';
import { getConfigsForRule, findConfigEmoji } from './configs.js';
import { getColumns, COLUMN_HEADER } from './rule-list-columns.js';
import { findSectionHeader } from './markdown.js';
import { getPluginRoot } from './package-json.js';
import { generateLegend } from './legend.js';
import { relative } from 'node:path';
import { COLUMN_TYPE, SEVERITY_TYPE } from './types.js';
import { markdownTable } from 'markdown-table';
import camelCase from 'camelcase';
import type {
  Plugin,
  RuleDetails,
  ConfigsToRules,
  ConfigEmojis,
} from './types.js';
import { EMOJIS_TYPE, RULE_TYPE } from './rule-type.js';
import { hasOptions } from './rule-options.js';

// Example: theWeatherIsNice => The Weather Is Nice
function camelCaseStringToTitle(str: string) {
  const text = str.replace(/([A-Z])/g, ' $1');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function isCamelCase(str: string) {
  return camelCase(str) === str;
}

function getPropertyFromRule(
  plugin: Plugin,
  ruleName: string,
  property: string
) {
  /* istanbul ignore next -- this shouldn't happen */
  if (!plugin.rules) {
    throw new Error(
      'Should not be attempting to get a property from a rule when there are no rules.'
    );
  }

  const rule = plugin.rules[ruleName];

  // Loop through all the nested property parts.
  const parts = property.split('.');
  // @ts-expect-error - Could be non-standard property on a function-style or object-style rule.
  let result = rule[parts[0]];
  for (const part of parts.slice(1)) {
    if (typeof result !== 'object') {
      return undefined; // eslint-disable-line unicorn/no-useless-undefined -- Rule doesn't have this property.
    }
    result = result[part];
  }
  return result;
}

/**
 * Get the emojis for the configs that set a rule to a certain severity.
 */
function getEmojisForConfigsSettingRuleToSeverity(
  ruleName: string,
  configsToRulesWithoutIgnored: ConfigsToRules,
  pluginPrefix: string,
  configEmojis: ConfigEmojis,
  severityType: SEVERITY_TYPE
) {
  const configsOfThisSeverity = getConfigsForRule(
    ruleName,
    configsToRulesWithoutIgnored,
    pluginPrefix,
    severityType
  );

  const emojis: string[] = [];
  for (const configName of configsOfThisSeverity) {
    // Find the emoji for each config or otherwise use a badge that can be defined in markdown.
    const emoji = findConfigEmoji(configEmojis, configName, {
      fallback: 'badge',
    });
    /* istanbul ignore next -- this shouldn't happen */
    if (typeof emoji !== 'string') {
      throw new TypeError('Emoji will always be a string thanks to fallback');
    }
    emojis.push(emoji);
  }

  return emojis;
}

function getConfigurationColumnValueForRule(
  rule: RuleDetails,
  configsToRules: ConfigsToRules,
  pluginPrefix: string,
  configEmojis: ConfigEmojis,
  ignoreConfig: string[],
  severityType: SEVERITY_TYPE
): string {
  const configsToRulesWithoutIgnored = Object.fromEntries(
    Object.entries(configsToRules).filter(
      ([configName]) => !ignoreConfig?.includes(configName)
    )
  );

  // Collect the emojis for the configs that set the rule to this severity level.
  return getEmojisForConfigsSettingRuleToSeverity(
    rule.name,
    configsToRulesWithoutIgnored,
    pluginPrefix,
    configEmojis,
    severityType
  ).join(' ');
}

function buildRuleRow(
  columnsEnabled: Record<COLUMN_TYPE, boolean>,
  rule: RuleDetails,
  configsToRules: ConfigsToRules,
  pluginPrefix: string,
  pathRuleDoc: string,
  configEmojis: ConfigEmojis,
  ignoreConfig: string[],
  urlRuleDoc?: string
): string[] {
  const columns: {
    [key in COLUMN_TYPE]: string;
  } = {
    // Alphabetical order.
    [COLUMN_TYPE.CONFIGS_ERROR]: getConfigurationColumnValueForRule(
      rule,
      configsToRules,
      pluginPrefix,
      configEmojis,
      ignoreConfig,
      SEVERITY_TYPE.error
    ),
    [COLUMN_TYPE.CONFIGS_OFF]: getConfigurationColumnValueForRule(
      rule,
      configsToRules,
      pluginPrefix,
      configEmojis,
      ignoreConfig,
      SEVERITY_TYPE.off
    ),
    [COLUMN_TYPE.CONFIGS_WARN]: getConfigurationColumnValueForRule(
      rule,
      configsToRules,
      pluginPrefix,
      configEmojis,
      ignoreConfig,
      SEVERITY_TYPE.warn
    ),
    [COLUMN_TYPE.DEPRECATED]: rule.deprecated ? EMOJI_DEPRECATED : '',
    [COLUMN_TYPE.DESCRIPTION]: rule.description || '',
    [COLUMN_TYPE.FIXABLE]: rule.fixable ? EMOJI_FIXABLE : '',
    [COLUMN_TYPE.FIXABLE_AND_HAS_SUGGESTIONS]: `${
      rule.fixable ? EMOJI_FIXABLE : ''
    }${rule.hasSuggestions ? EMOJI_HAS_SUGGESTIONS : ''}`,
    [COLUMN_TYPE.HAS_SUGGESTIONS]: rule.hasSuggestions
      ? EMOJI_HAS_SUGGESTIONS
      : '',
    [COLUMN_TYPE.NAME]: `[${rule.name}](${(urlRuleDoc ?? pathRuleDoc).replace(
      /{name}/g,
      rule.name
    )})`,
    [COLUMN_TYPE.OPTIONS]: hasOptions(rule.schema) ? EMOJI_OPTIONS : '',
    [COLUMN_TYPE.REQUIRES_TYPE_CHECKING]: rule.requiresTypeChecking
      ? EMOJI_REQUIRES_TYPE_CHECKING
      : '',
    [COLUMN_TYPE.TYPE]: rule.type ? EMOJIS_TYPE[rule.type as RULE_TYPE] : '', // Convert union type to enum.
  };

  // List columns using the ordering and presence of columns specified in columnsEnabled.
  return Object.keys(columnsEnabled).flatMap((column) =>
    columnsEnabled[column as COLUMN_TYPE]
      ? [columns[column as COLUMN_TYPE]]
      : []
  );
}

function generateRulesListMarkdown(
  columns: Record<COLUMN_TYPE, boolean>,
  details: RuleDetails[],
  configsToRules: ConfigsToRules,
  pluginPrefix: string,
  pathRuleDoc: string,
  configEmojis: ConfigEmojis,
  ignoreConfig: string[],
  urlRuleDoc?: string
): string {
  const listHeaderRow = (
    Object.entries(columns) as [COLUMN_TYPE, boolean][]
  ).flatMap(([columnType, enabled]) => {
    if (!enabled) {
      return [];
    }
    const headerStrOrFn = COLUMN_HEADER[columnType];
    return [
      typeof headerStrOrFn === 'function'
        ? headerStrOrFn({ details })
        : headerStrOrFn,
    ];
  });

  return markdownTable(
    [
      listHeaderRow,
      ...details
        .sort(({ name: a }, { name: b }) =>
          a.toLowerCase().localeCompare(b.toLowerCase())
        )
        .map((rule: RuleDetails) =>
          buildRuleRow(
            columns,
            rule,
            configsToRules,
            pluginPrefix,
            pathRuleDoc,
            configEmojis,
            ignoreConfig,
            urlRuleDoc
          )
        ),
    ],
    { align: 'l' } // Left-align headers.
  );
}

/**
 * Generate multiple rule lists given the `splitBy` property.
 */
function generateRulesListMarkdownWithSplitBy(
  columns: Record<COLUMN_TYPE, boolean>,
  details: RuleDetails[],
  plugin: Plugin,
  configsToRules: ConfigsToRules,
  pluginPrefix: string,
  pathRuleDoc: string,
  configEmojis: ConfigEmojis,
  ignoreConfig: string[],
  splitBy: string,
  urlRuleDoc?: string
): string {
  const values = new Set(
    details.map((detail) => getPropertyFromRule(plugin, detail.name, splitBy))
  );

  // Common values for boolean properties.
  const ENABLED_VALUES = new Set([true, 'true', 'on', 'yes']);
  const DISABLED_VALUES = new Set([
    undefined,
    null, // eslint-disable-line unicorn/no-null
    false,
    '',
    'false',
    'no',
    'off',
  ]);

  if (values.size === 1 && DISABLED_VALUES.has([...values.values()][0])) {
    throw new Error(`No rules found with --split-by property "${splitBy}"."`);
  }

  const parts: string[] = [];

  // Show any rules that don't have a value for this split-by property first, or for which the boolean property is off.
  if ([...DISABLED_VALUES.values()].some((val) => values.has(val))) {
    const rulesForThisValue = details.filter((detail) =>
      DISABLED_VALUES.has(getPropertyFromRule(plugin, detail.name, splitBy))
    );
    parts.push(
      generateRulesListMarkdown(
        columns,
        rulesForThisValue,
        configsToRules,
        pluginPrefix,
        pathRuleDoc,
        configEmojis,
        ignoreConfig,
        urlRuleDoc
      )
    );
  }

  // For each possible non-disabled value, show a header and list of corresponding rules.
  for (const value of [...values.values()]
    .filter((value) => !DISABLED_VALUES.has(value))
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))) {
    const rulesForThisValue = details.filter(
      (detail) => getPropertyFromRule(plugin, detail.name, splitBy) === value
    );

    // Turn splitBy into a title.
    // E.g. meta.docs.requiresTypeChecking to "Requires Type Checking".
    // TODO: handle other types of variable casing.
    const splitByParts = splitBy.split('.');
    const splitByFinalPart = splitByParts[splitByParts.length - 1];
    const splitByTitle = isCamelCase(splitByFinalPart)
      ? camelCaseStringToTitle(splitByParts[splitByParts.length - 1])
      : splitByFinalPart;

    parts.push(
      `### ${ENABLED_VALUES.has(value) ? splitByTitle : value}`,
      generateRulesListMarkdown(
        columns,
        rulesForThisValue,
        configsToRules,
        pluginPrefix,
        pathRuleDoc,
        configEmojis,
        ignoreConfig,
        urlRuleDoc
      )
    );
  }

  return parts.join('\n\n');
}

export function updateRulesList(
  details: RuleDetails[],
  markdown: string,
  plugin: Plugin,
  configsToRules: ConfigsToRules,
  pluginPrefix: string,
  pathRuleDoc: string,
  pathToReadme: string,
  pathToPlugin: string,
  configEmojis: ConfigEmojis,
  ignoreConfig: string[],
  ruleListColumns: COLUMN_TYPE[],
  urlConfigs?: string,
  urlRuleDoc?: string,
  splitBy?: string
): string {
  let listStartIndex = markdown.indexOf(BEGIN_RULE_LIST_MARKER);
  let listEndIndex = markdown.indexOf(END_RULE_LIST_MARKER);

  // Find the best possible section to insert the rules list into if the markers are missing.
  const rulesSectionHeader = findSectionHeader(markdown, 'rules');
  const rulesSectionIndex = rulesSectionHeader
    ? markdown.indexOf(rulesSectionHeader)
    : -1;

  if (
    listStartIndex === -1 &&
    listEndIndex === -1 &&
    rulesSectionHeader &&
    rulesSectionIndex !== -1
  ) {
    // If the markers are missing, we'll try to find the rules section and insert the list there.
    listStartIndex = rulesSectionIndex + rulesSectionHeader.length;
    listEndIndex = rulesSectionIndex + rulesSectionHeader.length - 1;
  } else {
    // Account for length of pre-existing marker.
    listEndIndex += END_RULE_LIST_MARKER.length;
  }

  if (listStartIndex === -1 || listEndIndex === -1) {
    throw new Error(
      `${relative(
        getPluginRoot(pathToPlugin),
        pathToReadme
      )} is missing rules list markers: ${BEGIN_RULE_LIST_MARKER}${END_RULE_LIST_MARKER}`
    );
  }

  const preList = markdown.slice(0, Math.max(0, listStartIndex));
  const postList = markdown.slice(Math.max(0, listEndIndex));

  // Determine columns to include in the rules list.
  const columns = getColumns(
    plugin,
    details,
    configsToRules,
    ruleListColumns,
    pluginPrefix,
    ignoreConfig
  );

  // New legend.
  const legend = generateLegend(
    columns,
    plugin,
    configsToRules,
    configEmojis,
    pluginPrefix,
    ignoreConfig,
    urlConfigs
  );

  // New rule list.
  const list = splitBy
    ? generateRulesListMarkdownWithSplitBy(
        columns,
        details,
        plugin,
        configsToRules,
        pluginPrefix,
        pathRuleDoc,
        configEmojis,
        ignoreConfig,
        splitBy,
        urlRuleDoc
      )
    : generateRulesListMarkdown(
        columns,
        details,
        configsToRules,
        pluginPrefix,
        pathRuleDoc,
        configEmojis,
        ignoreConfig,
        urlRuleDoc
      );

  const newContent = `${legend ? `${legend}\n\n` : ''}${list}`;

  return `${preList}${BEGIN_RULE_LIST_MARKER}\n\n${newContent}\n\n${END_RULE_LIST_MARKER}${postList}`;
}
