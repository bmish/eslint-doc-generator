import { BEGIN_RULE_LIST_MARKER, END_RULE_LIST_MARKER } from './markers.js';
import {
  EMOJI_CONFIG_RECOMMENDED,
  EMOJI_DEPRECATED,
  EMOJI_FIXABLE,
  EMOJI_HAS_SUGGESTIONS,
  EMOJI_REQUIRES_TYPE_CHECKING,
  EMOJI_CONFIGS,
} from './emojis.js';
import { hasCustomConfigs, getConfigsForRule } from './configs.js';
import { findSectionHeader, format } from './markdown.js';
import type { Plugin, RuleDetails, ConfigsToRules } from './types.js';

function getConfigurationColumnValueForRule(
  rule: RuleDetails,
  configsToRules: ConfigsToRules,
  pluginPrefix: string
): string {
  const badges: string[] = [];
  const configs = getConfigsForRule(rule.name, configsToRules, pluginPrefix);
  for (const configName of configs) {
    if (configName === 'all') {
      // Ignore any config named `all` as it's not helpful to include it for every rule.
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

  if (rule.deprecated) {
    // While not technically a config, we'll show the deprecation emoji in the config column to save space.
    badges.push(EMOJI_DEPRECATED);
  }

  return badges.join(' ');
}

function buildRuleRow(
  rule: RuleDetails,
  configsToRules: ConfigsToRules,
  pluginPrefix: string,
  includeTypesColumn: boolean
): string[] {
  const columns = [
    `[${rule.name}](docs/rules/${rule.name}.md)`,
    rule.description || '',
    getConfigurationColumnValueForRule(rule, configsToRules, pluginPrefix),
    rule.fixable ? EMOJI_FIXABLE : '',
    rule.hasSuggestions ? EMOJI_HAS_SUGGESTIONS : '',
  ];
  if (includeTypesColumn) {
    columns.push(rule.requiresTypeChecking ? EMOJI_REQUIRES_TYPE_CHECKING : '');
  }
  return columns;
}

function generateRulesListMarkdown(
  details: RuleDetails[],
  plugin: Plugin,
  configsToRules: ConfigsToRules,
  pluginPrefix: string
): string {
  // Since such rules are rare, we'll only include the types column if at least one rule requires type checking.
  const includeTypesColumn = details.some(
    (detail: RuleDetails) => detail.requiresTypeChecking
  );
  const listHeaderRow = [
    'Rule',
    'Description',
    hasCustomConfigs(plugin) ? EMOJI_CONFIGS : EMOJI_CONFIG_RECOMMENDED, // If there are custom configs, use the general config emoji.
    EMOJI_FIXABLE,
    EMOJI_HAS_SUGGESTIONS,
  ];
  if (includeTypesColumn) {
    listHeaderRow.push(EMOJI_REQUIRES_TYPE_CHECKING);
  }
  const listSpacerRow = Array.from({ length: listHeaderRow.length }).fill('-');
  return [
    listHeaderRow,
    listSpacerRow,
    ...details
      .sort(({ name: a }, { name: b }) => a.localeCompare(b))
      .map((rule: RuleDetails) =>
        buildRuleRow(rule, configsToRules, pluginPrefix, includeTypesColumn)
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
  pathToReadme: string
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
      `README.md is missing rules list markers: ${BEGIN_RULE_LIST_MARKER}${END_RULE_LIST_MARKER}`
    );
  }

  const preList = markdown.slice(0, Math.max(0, listStartIndex));
  const postList = markdown.slice(Math.max(0, listEndIndex));

  // New rule list.
  const list = await format(
    generateRulesListMarkdown(details, plugin, configsToRules, pluginPrefix),
    pathToReadme
  );

  return `${preList}${BEGIN_RULE_LIST_MARKER}\n\n${list}\n${END_RULE_LIST_MARKER}${postList}`;
}
