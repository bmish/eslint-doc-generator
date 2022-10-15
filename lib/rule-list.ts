import { BEGIN_RULE_LIST_MARKER, END_RULE_LIST_MARKER } from './markers.js';
import {
  EMOJI_DEPRECATED,
  EMOJI_FIXABLE,
  EMOJI_HAS_SUGGESTIONS,
  EMOJI_REQUIRES_TYPE_CHECKING,
} from './emojis.js';
import { getConfigsForRule } from './configs.js';
import { COLUMN_TYPE, getColumns, COLUMN_HEADER } from './rule-list-columns.js';
import { findSectionHeader, format } from './markdown.js';
import { getPluginRoot } from './package-json.js';
import { generateLegend } from './legend.js';
import { relative } from 'node:path';
import type {
  Plugin,
  RuleDetails,
  ConfigsToRules,
  ConfigEmojis,
} from './types.js';
import { EMOJIS_TYPE, RULE_TYPE } from './rule-type.js';

function getConfigurationColumnValueForRule(
  rule: RuleDetails,
  configsToRules: ConfigsToRules,
  pluginPrefix: string,
  configEmojis: ConfigEmojis,
  ignoreConfig: string[]
): string {
  const badges: string[] = [];
  const configs = getConfigsForRule(rule.name, configsToRules, pluginPrefix);
  for (const configName of configs) {
    if (ignoreConfig?.includes(configName)) {
      // Ignore config.
      continue;
    }
    // Find the emoji for the config or otherwise use a badge that can be defined in markdown.
    const emoji = configEmojis?.find(
      (configEmoji) => configEmoji.config === configName
    )?.emoji;
    badges.push(emoji ?? `![${configName}][]`);
  }
  return badges.join(' ');
}

function buildRuleRow(
  columnsEnabled: Record<COLUMN_TYPE, boolean>,
  rule: RuleDetails,
  configsToRules: ConfigsToRules,
  pluginPrefix: string,
  configEmojis: ConfigEmojis,
  ignoreConfig: string[]
): string[] {
  const columns: {
    [key in COLUMN_TYPE]: string;
  } = {
    // Alphabetical order.
    [COLUMN_TYPE.CONFIGS]: getConfigurationColumnValueForRule(
      rule,
      configsToRules,
      pluginPrefix,
      configEmojis,
      ignoreConfig
    ),
    [COLUMN_TYPE.DEPRECATED]: rule.deprecated ? EMOJI_DEPRECATED : '',
    [COLUMN_TYPE.DESCRIPTION]: rule.description || '',
    [COLUMN_TYPE.FIXABLE]: rule.fixable ? EMOJI_FIXABLE : '',
    [COLUMN_TYPE.HAS_SUGGESTIONS]: rule.hasSuggestions
      ? EMOJI_HAS_SUGGESTIONS
      : '',
    [COLUMN_TYPE.NAME]: `[${rule.name}](docs/rules/${rule.name}.md)`,
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
  configEmojis: ConfigEmojis,
  ignoreConfig: string[]
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
        ? headerStrOrFn({
            configNames: Object.keys(configsToRules),
            configEmojis,
            ignoreConfig,
          })
        : headerStrOrFn,
    ];
  });
  const listSpacerRow = Array.from({ length: listHeaderRow.length }).fill(
    ':--'
  ); // Left-align header with colon.
  return [
    listHeaderRow,
    listSpacerRow,
    ...details
      .sort(({ name: a }, { name: b }) => a.localeCompare(b))
      .map((rule: RuleDetails) =>
        buildRuleRow(
          columns,
          rule,
          configsToRules,
          pluginPrefix,
          configEmojis,
          ignoreConfig
        )
      ),
  ]
    .map((column) => [...column, ' '].join('|'))
    .join('\n');
}

export async function updateRulesList(
  details: RuleDetails[],
  markdown: string,
  plugin: Plugin,
  configsToRules: ConfigsToRules,
  pluginPrefix: string,
  pathToReadme: string,
  pathToPlugin: string,
  configEmojis: ConfigEmojis,
  ignoreConfig: string[],
  ruleListColumns: COLUMN_TYPE[],
  urlConfigs?: string
): Promise<string> {
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
    details,
    configsToRules,
    ruleListColumns,
    ignoreConfig
  );

  // New legend.
  const legend = generateLegend(
    columns,
    plugin,
    configEmojis,
    ignoreConfig,
    urlConfigs
  );

  // New rule list.
  const list = generateRulesListMarkdown(
    columns,
    details,
    configsToRules,
    pluginPrefix,
    configEmojis,
    ignoreConfig
  );

  const newContent = await format(`${legend}\n\n${list}`, pathToReadme);

  return `${preList}${BEGIN_RULE_LIST_MARKER}\n\n${newContent}\n\n${END_RULE_LIST_MARKER}${postList}`;
}
