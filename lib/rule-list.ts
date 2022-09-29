import { BEGIN_RULE_LIST_MARKER, END_RULE_LIST_MARKER } from './markers.js';
import type { Plugin, RuleDetails } from './types.js';

function getConfigurationColumnValueForRule(
  rule: RuleDetails,
  plugin: Plugin,
  pluginPrefix: string
): string {
  const badges: string[] = [];
  for (const configName of Object.keys(plugin.configs)) {
    if (configName === 'all') {
      // Ignore any config named `all` as it's not helpful to include it for every rule.
      continue;
    }
    if (`${pluginPrefix}/${rule.name}` in plugin.configs[configName].rules) {
      // ✅ is the emoji commonly used by `recommended` configs.
      // For other config names, the user can manually define a badge image.
      badges.push(configName === 'recommended' ? '✅' : `![${configName}][]`);
    }
  }

  if (rule.deprecated) {
    // While not technically a config, we'll show the deprecation emoji in the config column to save space.
    badges.push('❌');
  }

  return badges.join(' ');
}

function buildRuleRow(
  rule: RuleDetails,
  plugin: Plugin,
  pluginPrefix: string,
  includeTypesColumn: boolean
): string[] {
  const columns = [
    `[${rule.name}](docs/rules/${rule.name}.md)`,
    rule.description,
    getConfigurationColumnValueForRule(rule, plugin, pluginPrefix),
    rule.fixable ? '🔧' : '',
    rule.hasSuggestions ? '💡' : '',
  ];
  if (includeTypesColumn) {
    columns.push(rule.requiresTypeChecking ? '💭' : '');
  }
  return columns;
}

function generateRulesListMarkdown(
  details: RuleDetails[],
  plugin: Plugin,
  pluginPrefix: string
): string {
  // Since such rules are rare, we'll only include the types column if at least one rule requires type checking.
  const includeTypesColumn = details.some(
    (detail: RuleDetails) => detail.requiresTypeChecking
  );
  const listHeaderRow = ['Rule', 'Description', '💼', '🔧', '💡'];
  if (includeTypesColumn) {
    listHeaderRow.push('💭');
  }
  const listSpacerRow = Array.from({ length: listHeaderRow.length }).fill('-');
  return [
    listHeaderRow,
    listSpacerRow,
    ...details
      .sort(({ name: a }, { name: b }) => a.localeCompare(b))
      .map((rule: RuleDetails) =>
        buildRuleRow(rule, plugin, pluginPrefix, includeTypesColumn)
      ),
  ]
    .map((column) => [...column, ' '].join('|'))
    .join('\n');
}

export function updateRulesList(
  details: RuleDetails[],
  markdown: string,
  plugin: Plugin,
  pluginPrefix: string
): string {
  const listStartIndex = markdown.indexOf(BEGIN_RULE_LIST_MARKER);
  const listEndIndex = markdown.indexOf(END_RULE_LIST_MARKER);

  if (listStartIndex === -1 || listEndIndex === -1) {
    throw new Error('README.md is missing rules list markers.');
  }

  return [
    markdown.slice(0, Math.max(0, listStartIndex - 1)),
    BEGIN_RULE_LIST_MARKER,
    '',
    generateRulesListMarkdown(details, plugin, pluginPrefix),
    '',
    markdown.slice(Math.max(0, listEndIndex)),
  ].join('\n');
}
