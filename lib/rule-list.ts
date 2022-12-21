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
import {
  COLUMN_TYPE,
  RuleListSplitFunction,
  RuleModule,
  SEVERITY_TYPE,
} from './types.js';
import { markdownTable } from 'markdown-table';
import type {
  Plugin,
  ConfigsToRules,
  ConfigEmojis,
  RuleNamesAndRules,
} from './types.js';
import { EMOJIS_TYPE } from './rule-type.js';
import { hasOptions } from './rule-options.js';
import { getLinkToRule } from './rule-link.js';
import { capitalizeOnlyFirstLetter } from './string.js';
import { noCase } from 'no-case';
import { getProperty } from 'dot-prop';
import { boolean, isBooleanable } from 'boolean';
import Ajv from 'ajv';

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
  return getProperty(rule, property) as unknown; // TODO: Incorrectly typed as undefined. This could be any type, not just undefined (https://github.com/sindresorhus/dot-prop/issues/95).
}

function getConfigurationColumnValueForRule(
  ruleName: string,
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
    ruleName,
    configsToRulesWithoutIgnored,
    pluginPrefix,
    configEmojis,
    severityType
  ).join(' ');
}

function buildRuleRow(
  ruleName: string,
  rule: RuleModule,
  columnsEnabled: Record<COLUMN_TYPE, boolean>,
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
      ruleName,
      configsToRules,
      pluginPrefix,
      configEmojis,
      ignoreConfig,
      SEVERITY_TYPE.error
    ),
    [COLUMN_TYPE.CONFIGS_OFF]: getConfigurationColumnValueForRule(
      ruleName,
      configsToRules,
      pluginPrefix,
      configEmojis,
      ignoreConfig,
      SEVERITY_TYPE.off
    ),
    [COLUMN_TYPE.CONFIGS_WARN]: getConfigurationColumnValueForRule(
      ruleName,
      configsToRules,
      pluginPrefix,
      configEmojis,
      ignoreConfig,
      SEVERITY_TYPE.warn
    ),
    [COLUMN_TYPE.DEPRECATED]: rule.meta?.deprecated ? EMOJI_DEPRECATED : '',
    [COLUMN_TYPE.DESCRIPTION]: rule.meta?.docs?.description || '',
    [COLUMN_TYPE.FIXABLE]: rule.meta?.fixable ? EMOJI_FIXABLE : '',
    [COLUMN_TYPE.FIXABLE_AND_HAS_SUGGESTIONS]: `${
      rule.meta?.fixable ? EMOJI_FIXABLE : ''
    }${rule.meta?.hasSuggestions ? EMOJI_HAS_SUGGESTIONS : ''}`,
    [COLUMN_TYPE.HAS_SUGGESTIONS]: rule.meta?.hasSuggestions
      ? EMOJI_HAS_SUGGESTIONS
      : '',
    [COLUMN_TYPE.NAME]() {
      return getLinkToRule(
        ruleName,
        pluginPrefix,
        pathPlugin,
        pathRuleDoc,
        pathRuleList,
        false,
        false,
        urlRuleDoc
      );
    },
    [COLUMN_TYPE.OPTIONS]: hasOptions(rule.meta?.schema) ? EMOJI_OPTIONS : '',
    [COLUMN_TYPE.REQUIRES_TYPE_CHECKING]: rule.meta?.docs?.requiresTypeChecking
      ? EMOJI_REQUIRES_TYPE_CHECKING
      : '',
    [COLUMN_TYPE.TYPE]: rule.meta?.type ? EMOJIS_TYPE[rule.meta?.type] : '',
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
  ruleNamesAndRules: RuleNamesAndRules,
  columns: Record<COLUMN_TYPE, boolean>,
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
        ? headerStrOrFn({ ruleNamesAndRules })
        : headerStrOrFn,
    ];
  });

  return markdownTable(
    [
      listHeaderRow,
      ...ruleNamesAndRules.map(([name, rule]) =>
        buildRuleRow(
          name,
          rule,
          columns,
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

type RulesAndHeaders = { title?: string; rules: RuleNamesAndRules }[];
type RulesAndHeadersReadOnly = Readonly<RulesAndHeaders>;

function generateRuleListMarkdownForRulesAndHeaders(
  rulesAndHeaders: RulesAndHeadersReadOnly,
  headerLevel: number,
  columns: Record<COLUMN_TYPE, boolean>,
  configsToRules: ConfigsToRules,
  pluginPrefix: string,
  pathPlugin: string,
  pathRuleDoc: string,
  pathRuleList: string,
  configEmojis: ConfigEmojis,
  ignoreConfig: readonly string[],
  urlRuleDoc?: string
): string {
  const parts: string[] = [];

  for (const { title, rules } of rulesAndHeaders) {
    if (title) {
      parts.push(`${'#'.repeat(headerLevel)} ${title}`);
    }
    parts.push(
      generateRulesListMarkdown(
        rules,
        columns,
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

/**
 * Get the pairs of rules and headers for a given split property.
 */
function getRulesAndHeadersForSplit(
  ruleNamesAndRules: RuleNamesAndRules,
  plugin: Plugin,
  ruleListSplit: readonly string[]
): RulesAndHeadersReadOnly {
  const rulesAndHeaders: RulesAndHeaders = [];

  // Initially, all rules are unused.
  let unusedRules: RuleNamesAndRules = ruleNamesAndRules;

  // Loop through each split property.
  for (const ruleListSplitItem of ruleListSplit) {
    // Store the rules and headers for this split property.
    const rulesAndHeadersForThisSplit: RulesAndHeaders = [];

    // Check what possible values this split property can have.
    const valuesForThisPropertyFromUnusedRules = [
      ...new Set(
        unusedRules.map(([name]) =>
          getPropertyFromRule(plugin, name, ruleListSplitItem)
        )
      ).values(),
    ];
    const valuesForThisPropertyFromAllRules = [
      ...new Set(
        ruleNamesAndRules.map(([name]) =>
          getPropertyFromRule(plugin, name, ruleListSplitItem)
        )
      ).values(),
    ];

    // Throw an exception if there are no possible rules with this split property.
    if (
      valuesForThisPropertyFromAllRules.length === 1 &&
      isConsideredFalse(valuesForThisPropertyFromAllRules[0])
    ) {
      throw new Error(
        `No rules found with --rule-list-split property "${ruleListSplitItem}".`
      );
    }

    // For each possible non-disabled value, show a header and list of corresponding rules.
    const valuesNotFalseAndNotTrue =
      valuesForThisPropertyFromUnusedRules.filter(
        (val) => !isConsideredFalse(val) && !isBooleanableTrue(val)
      );
    const valuesTrue = valuesForThisPropertyFromUnusedRules.filter((val) =>
      isBooleanableTrue(val)
    );
    const valuesNew = [
      ...valuesNotFalseAndNotTrue,
      ...(valuesTrue.length > 0 ? [true] : []), // If there are multiple true values, combine them all into one.
    ];
    for (const value of valuesNew.sort((a, b) =>
      String(a).toLowerCase().localeCompare(String(b).toLowerCase())
    )) {
      // Rules with the property set to this value.
      const rulesForThisValue = unusedRules.filter(([name]) => {
        const property = getPropertyFromRule(plugin, name, ruleListSplitItem);
        return (
          property === value || (value === true && isBooleanableTrue(property))
        );
      });

      // Turn ruleListSplit into a title.
      // E.g. meta.docs.requiresTypeChecking to "Requires Type Checking".
      const ruleListSplitParts = ruleListSplitItem.split('.');
      const ruleListSplitFinalPart =
        ruleListSplitParts[ruleListSplitParts.length - 1];
      const ruleListSplitTitle = noCase(ruleListSplitFinalPart, {
        transform: (str) => capitalizeOnlyFirstLetter(str),
      });

      // Add a list for the rules with property set to this value.
      rulesAndHeadersForThisSplit.push({
        title: String(isBooleanableTrue(value) ? ruleListSplitTitle : value),
        rules: rulesForThisValue,
      });

      // Remove these rules from the unused rules.
      unusedRules = unusedRules.filter(
        (rule) => !rulesForThisValue.includes(rule)
      );
    }

    // Add the rules and headers for this split property to the beginning of the list of all rules and headers.
    rulesAndHeaders.unshift(...rulesAndHeadersForThisSplit);
  }

  // All remaining unused rules go at the beginning.
  if (unusedRules.length > 0) {
    rulesAndHeaders.unshift({ rules: unusedRules });
  }

  return rulesAndHeaders;
}

export function updateRulesList(
  ruleNamesAndRules: RuleNamesAndRules,
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
  ruleListSplit: readonly string[] | RuleListSplitFunction,
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
    ruleNamesAndRules,
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

  // Determine the pairs of rules and headers based on any split property.
  const rulesAndHeaders: RulesAndHeaders = [];
  if (typeof ruleListSplit === 'function') {
    const userDefinedLists = ruleListSplit(ruleNamesAndRules);

    // Schema for the user-defined lists.
    const schema = {
      // Array of rule lists.
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          rules: {
            type: 'array',
            items: {
              type: 'array',
              items: [
                { type: 'string' }, // The rule name.
                { type: 'object' }, // The rule object (won't bother trying to validate deeper than this).
              ],
              minItems: 2,
              maxItems: 2,
            },
            minItems: 1,
            uniqueItems: true,
          },
        },
        required: ['rules'],
        additionalProperties: false,
      },
      minItems: 1,
      uniqueItems: true,
    };

    // Validate the user-defined lists.
    const ajv = new Ajv();
    const validate = ajv.compile(schema);
    const valid = validate(userDefinedLists);
    if (!valid) {
      throw new Error(
        validate.errors
          ? ajv.errorsText(validate.errors, {
              dataVar: 'ruleListSplit return value',
            })
          : /* istanbul ignore next -- this shouldn't happen */
            'Invalid ruleListSplit return value'
      );
    }

    rulesAndHeaders.push(...userDefinedLists);
  } else if (ruleListSplit.length > 0) {
    rulesAndHeaders.push(
      ...getRulesAndHeadersForSplit(ruleNamesAndRules, plugin, ruleListSplit)
    );
  } else {
    rulesAndHeaders.push({ rules: ruleNamesAndRules });
  }

  // New rule list.
  const list = generateRuleListMarkdownForRulesAndHeaders(
    rulesAndHeaders,
    ruleListSplitHeaderLevel,
    columns,
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
