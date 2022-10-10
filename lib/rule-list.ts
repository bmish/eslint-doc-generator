import { BEGIN_RULE_LIST_MARKER, END_RULE_LIST_MARKER } from './markers.js';
import {
  EMOJI_CONFIG_RECOMMENDED,
  EMOJI_DEPRECATED,
  EMOJI_FIXABLE,
  EMOJI_HAS_SUGGESTIONS,
  EMOJI_REQUIRES_TYPE_CHECKING,
} from './emojis.js';
import { getConfigsForRule, hasAnyConfigs } from './configs.js';
import { COLUMN_TYPE, getColumns, COLUMN_HEADER } from './rule-list-columns.js';
import { findSectionHeader, format } from './markdown.js';
import { getPluginRoot } from './package-json.js';
import { generateLegend } from './legend.js';
import { relative } from 'node:path';
import type { Plugin, RuleDetails, ConfigsToRules } from './types.js';

function getConfigurationColumnValueForRule(
  rule: RuleDetails,
  configsToRules: ConfigsToRules,
  pluginPrefix: string,
  ignoreConfig?: string[]
): string {
  const badges: string[] = [];
  const configs = getConfigsForRule(rule.name, configsToRules, pluginPrefix);
  for (const configName of configs) {
    if (ignoreConfig?.includes(configName)) {
      // Ignore config.
      continue;
    }
    // Use the standard `recommended` emoji for that config.
    // For other config names, the user can manually define a badge image.
    badges.push(
      configName === 'recommended'
        ? EMOJI_CONFIG_RECOMMENDED
        : `![${configName}][]`
    );
  }
  return badges.join(' ');
}

function buildRuleRow(
  columnsEnabled: Record<COLUMN_TYPE, boolean>,
  rule: RuleDetails,
  configsToRules: ConfigsToRules,
  pluginPrefix: string,
  includeTypesColumn: boolean,
  ignoreConfig?: string[]
): string[] {
  const columns: string[] = [];
  if (columnsEnabled[COLUMN_TYPE.NAME]) {
    columns.push(`[${rule.name}](docs/rules/${rule.name}.md)`);
  }
  if (columnsEnabled[COLUMN_TYPE.DESCRIPTION]) {
    columns.push(rule.description || '');
  }
  if (
    (columnsEnabled[COLUMN_TYPE.CONFIGS] ||
      columnsEnabled[COLUMN_TYPE.CONFIG_RECOMMENDED]) &&
    hasAnyConfigs(configsToRules)
  ) {
    columns.push(
      getConfigurationColumnValueForRule(
        rule,
        configsToRules,
        pluginPrefix,
        ignoreConfig
      )
    );
  }
  if (columnsEnabled[COLUMN_TYPE.FIXABLE]) {
    columns.push(rule.fixable ? EMOJI_FIXABLE : '');
  }
  if (columnsEnabled[COLUMN_TYPE.HAS_SUGGESTIONS]) {
    columns.push(rule.hasSuggestions ? EMOJI_HAS_SUGGESTIONS : '');
  }
  if (
    columnsEnabled[COLUMN_TYPE.REQUIRES_TYPE_CHECKING] &&
    includeTypesColumn
  ) {
    columns.push(rule.requiresTypeChecking ? EMOJI_REQUIRES_TYPE_CHECKING : '');
  }
  if (columnsEnabled[COLUMN_TYPE.DEPRECATED] && rule.deprecated) {
    columns.push(EMOJI_DEPRECATED);
  }
  return columns;
}

function generateRulesListMarkdown(
  columns: Record<COLUMN_TYPE, boolean>,
  details: RuleDetails[],
  configsToRules: ConfigsToRules,
  pluginPrefix: string,
  ignoreConfig?: string[]
): string {
  // Since such rules are rare, we'll only include the types column if at least one rule requires type checking.
  const includeTypesColumn = details.some(
    (detail: RuleDetails) => detail.requiresTypeChecking
  );
  const listHeaderRow = (
    Object.entries(columns) as [COLUMN_TYPE, boolean][]
  ).flatMap(([columnType, enabled]) => {
    if (!enabled) {
      return [];
    }
    return [COLUMN_HEADER[columnType]];
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
          includeTypesColumn,
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
  ignoreConfig?: string[],
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
  const columns = getColumns(details, plugin, configsToRules, ignoreConfig);

  // New legend.
  const legend = generateLegend(columns, urlConfigs);

  // New rule list.
  const list = generateRulesListMarkdown(
    columns,
    details,
    configsToRules,
    pluginPrefix,
    ignoreConfig
  );

  const newContent = await format(`${legend}\n\n${list}`, pathToReadme);

  return `${preList}${BEGIN_RULE_LIST_MARKER}\n\n${newContent}\n\n${END_RULE_LIST_MARKER}${postList}`;
}
