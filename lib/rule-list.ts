import {
  BEGIN_RULE_LIST_MARKER,
  END_RULE_LIST_MARKER,
} from './comment-markers.js';
import {
  EMOJI_DEPRECATED,
  EMOJI_FIXABLE,
  EMOJI_HAS_SUGGESTIONS,
  EMOJI_OPTIONS,
  EMOJI_REQUIRES_TYPE_CHECKING,
} from './emojis.js';
import { getEmojisForConfigsSettingRuleToSeverity } from './plugin-configs.js';
import { getColumns, COLUMN_HEADER } from './rule-list-columns.js';
import { findSectionHeader, findFinalHeaderLevel } from './markdown.js';
import { getPluginRoot } from './package-json.js';
import { generateLegend } from './rule-list-legend.js';
import { relative } from 'node:path';
import { COLUMN_TYPE, SEVERITY_TYPE } from './types.js';
import { markdownTable } from 'markdown-table';
import type {
  Plugin,
  RuleDetails,
  ConfigsToRules,
  ConfigEmojis,
} from './types.js';
import { EMOJIS_TYPE, RULE_TYPE } from './rule-type.js';
import { hasOptions } from './rule-options.js';
import { getLinkToRule } from './rule-link.js';
import { capitalizeOnlyFirstLetter } from './string.js';
import { noCase } from 'no-case';
import { getProperty } from 'dot-prop';
import { boolean, isBooleanable } from 'boolean';

function isBooleanableTrue(value: unknown): boolean {
  return isBooleanable(value) && boolean(value);
}

function isBooleanableFalse(value: unknown): boolean {
  return isBooleanable(value) && !boolean(value);
}

function isConsideredFalse(value: unknown): boolean {
  return (
    value === undefined ||
    value === null ||
    value === '' ||
    isBooleanableFalse(value)
  );
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
  return getProperty(rule, property) as any; // eslint-disable-line @typescript-eslint/no-explicit-any -- This could be any type, not just undefined (https://github.com/sindresorhus/dot-prop/issues/95).
}

function getConfigurationColumnValueForRule(
  rule: RuleDetails,
  configsToRules: ConfigsToRules,
  pluginPrefix: string,
  configEmojis: ConfigEmojis,
  ignoreConfig: readonly string[],
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
  pathPlugin: string,
  pathRuleDoc: string,
  pathRuleList: string,
  configEmojis: ConfigEmojis,
  ignoreConfig: readonly string[],
  urlRuleDoc?: string
): readonly string[] {
  const columns: {
    [key in COLUMN_TYPE]: string | (() => string);
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
    [COLUMN_TYPE.NAME]() {
      return getLinkToRule(
        rule.name,
        pluginPrefix,
        pathPlugin,
        pathRuleDoc,
        pathRuleList,
        false,
        false,
        urlRuleDoc
      );
    },
    [COLUMN_TYPE.OPTIONS]: hasOptions(rule.schema) ? EMOJI_OPTIONS : '',
    [COLUMN_TYPE.REQUIRES_TYPE_CHECKING]: rule.requiresTypeChecking
      ? EMOJI_REQUIRES_TYPE_CHECKING
      : '',
    [COLUMN_TYPE.TYPE]: rule.type ? EMOJIS_TYPE[rule.type as RULE_TYPE] : '', // Convert union type to enum.
  };

  // List columns using the ordering and presence of columns specified in columnsEnabled.
  return Object.keys(columnsEnabled).flatMap((column) => {
    const columnValueOrFn = columns[column as COLUMN_TYPE];
    return columnsEnabled[column as COLUMN_TYPE]
      ? [
          typeof columnValueOrFn === 'function'
            ? columnValueOrFn()
            : columnValueOrFn,
        ]
      : [];
  });
}

function generateRulesListMarkdown(
  columns: Record<COLUMN_TYPE, boolean>,
  details: readonly RuleDetails[],
  configsToRules: ConfigsToRules,
  pluginPrefix: string,
  pathPlugin: string,
  pathRuleDoc: string,
  pathRuleList: string,
  configEmojis: ConfigEmojis,
  ignoreConfig: readonly string[],
  urlRuleDoc?: string
): string {
  const listHeaderRow = (
    Object.entries(columns) as readonly [COLUMN_TYPE, boolean][]
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
      ...details.map((rule: RuleDetails) =>
        buildRuleRow(
          columns,
          rule,
          configsToRules,
          pluginPrefix,
          pathPlugin,
          pathRuleDoc,
          pathRuleList,
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
 * Generate multiple rule lists given the `ruleListSplit` property.
 */
function generateRulesListMarkdownWithRuleListSplit(
  columns: Record<COLUMN_TYPE, boolean>,
  details: readonly RuleDetails[],
  plugin: Plugin,
  configsToRules: ConfigsToRules,
  pluginPrefix: string,
  pathPlugin: string,
  pathRuleDoc: string,
  pathRuleList: string,
  configEmojis: ConfigEmojis,
  ignoreConfig: readonly string[],
  ruleListSplit: string,
  headerLevel: number,
  urlRuleDoc?: string
): string {
  const values = new Set(
    details.map((detail) =>
      getPropertyFromRule(plugin, detail.name, ruleListSplit)
    )
  );
  const valuesAll = [...values.values()];

  if (values.size === 1 && isConsideredFalse(valuesAll[0])) {
    throw new Error(
      `No rules found with --rule-list-split property "${ruleListSplit}".`
    );
  }

  const parts: string[] = [];

  // Show any rules that don't have a value for this rule-list-split property first, or for which the boolean property is off.
  if (valuesAll.some((val) => isConsideredFalse(val))) {
    const rulesForThisValue = details.filter((detail) =>
      isConsideredFalse(getPropertyFromRule(plugin, detail.name, ruleListSplit))
    );
    parts.push(
      generateRulesListMarkdown(
        columns,
        rulesForThisValue,
        configsToRules,
        pluginPrefix,
        pathPlugin,
        pathRuleDoc,
        pathRuleList,
        configEmojis,
        ignoreConfig,
        urlRuleDoc
      )
    );
  }

  // For each possible non-disabled value, show a header and list of corresponding rules.
  const valuesNotFalseAndNotTrue = valuesAll.filter(
    (val) => !isConsideredFalse(val) && !isBooleanableTrue(val)
  );
  const valuesTrue = valuesAll.filter((val) => isBooleanableTrue(val));
  const valuesNew = [
    ...valuesNotFalseAndNotTrue,
    ...(valuesTrue.length > 0 ? [true] : []), // If there are multiple true values, combine them all into one.
  ];
  for (const value of valuesNew.sort((a, b) =>
    String(a).toLowerCase().localeCompare(String(b).toLowerCase())
  )) {
    const rulesForThisValue = details.filter((detail) => {
      const property = getPropertyFromRule(plugin, detail.name, ruleListSplit);
      return (
        property === value || (value === true && isBooleanableTrue(property))
      );
    });

    // Turn ruleListSplit into a title.
    // E.g. meta.docs.requiresTypeChecking to "Requires Type Checking".
    const ruleListSplitParts = ruleListSplit.split('.');
    const ruleListSplitFinalPart =
      ruleListSplitParts[ruleListSplitParts.length - 1];
    const ruleListSplitTitle = noCase(ruleListSplitFinalPart, {
      transform: (str) => capitalizeOnlyFirstLetter(str),
    });

    parts.push(
      `${'#'.repeat(headerLevel)} ${
        isBooleanableTrue(value) ? ruleListSplitTitle : value
      }`,
      generateRulesListMarkdown(
        columns,
        rulesForThisValue,
        configsToRules,
        pluginPrefix,
        pathPlugin,
        pathRuleDoc,
        pathRuleList,
        configEmojis,
        ignoreConfig,
        urlRuleDoc
      )
    );
  }

  return parts.join('\n\n');
}

export function updateRulesList(
  details: readonly RuleDetails[],
  markdown: string,
  plugin: Plugin,
  configsToRules: ConfigsToRules,
  pluginPrefix: string,
  pathRuleDoc: string,
  pathRuleList: string,
  pathPlugin: string,
  configEmojis: ConfigEmojis,
  ignoreConfig: readonly string[],
  ruleListColumns: readonly COLUMN_TYPE[],
  ruleListSplit?: string,
  urlConfigs?: string,
  urlRuleDoc?: string
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
        getPluginRoot(pathPlugin),
        pathRuleList
      )} is missing rules list markers: ${BEGIN_RULE_LIST_MARKER}${END_RULE_LIST_MARKER}`
    );
  }

  const preList = markdown.slice(0, Math.max(0, listStartIndex));
  const postList = markdown.slice(Math.max(0, listEndIndex));

  // Determine what header level to use for sub-lists based on the last seen header level.
  const preListFinalHeaderLevel = findFinalHeaderLevel(preList);
  const ruleListSplitHeaderLevel = preListFinalHeaderLevel
    ? preListFinalHeaderLevel + 1
    : 1;

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
  const list = ruleListSplit
    ? generateRulesListMarkdownWithRuleListSplit(
        columns,
        details,
        plugin,
        configsToRules,
        pluginPrefix,
        pathPlugin,
        pathRuleDoc,
        pathRuleList,
        configEmojis,
        ignoreConfig,
        ruleListSplit,
        ruleListSplitHeaderLevel,
        urlRuleDoc
      )
    : generateRulesListMarkdown(
        columns,
        details,
        configsToRules,
        pluginPrefix,
        pathPlugin,
        pathRuleDoc,
        pathRuleList,
        configEmojis,
        ignoreConfig,
        urlRuleDoc
      );

  const newContent = `${legend ? `${legend}\n\n` : ''}${list}`;

  return `${preList}${BEGIN_RULE_LIST_MARKER}\n\n${newContent}\n\n${END_RULE_LIST_MARKER}${postList}`;
}
