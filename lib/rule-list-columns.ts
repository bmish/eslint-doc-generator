import {
  EMOJI_DEPRECATED,
  EMOJI_FIXABLE,
  EMOJI_HAS_SUGGESTIONS,
  EMOJI_REQUIRES_TYPE_CHECKING,
  EMOJI_TYPE,
  EMOJI_CONFIG_FROM_SEVERITY,
  EMOJI_OPTIONS,
} from './emojis.js';
import { RULE_TYPES } from './rule-type.js';
import { COLUMN_TYPE, SEVERITY_TYPE } from './types.js';
import { getConfigsThatSetARule } from './plugin-configs.js';
import { hasOptions } from './rule-options.js';
import type { RuleDetails, ConfigsToRules, Plugin } from './types.js';

/**
 * An object containing the column header for each column (as a string or function to generate the string).
 */
export const COLUMN_HEADER: {
  [key in COLUMN_TYPE]:
    | string
    | ((data: { ruleDetails: readonly RuleDetails[] }) => string);
} = {
  [COLUMN_TYPE.NAME]: ({ ruleDetails }) => {
    const ruleNames = ruleDetails.map((ruleDetail) => ruleDetail.name);
    const longestRuleNameLength = Math.max(
      ...ruleNames.map(({ length }) => length)
    );
    const ruleDescriptions = ruleDetails.map(
      (ruleDetail) => ruleDetail.description
    );
    const longestRuleDescriptionLength = Math.max(
      ...ruleDescriptions.map((description) =>
        description ? description.length : 0
      )
    );

    const title = 'Name';

    // Add nbsp spaces to prevent rule names from wrapping to multiple lines.
    // Generally only needed when long descriptions are present causing the name column to wrap.
    const spaces =
      ruleNames.length > 0 &&
      longestRuleDescriptionLength >= 60 &&
      longestRuleNameLength > title.length
        ? ' '.repeat(longestRuleNameLength - title.length) // U+00A0 nbsp character.
        : '';

    return `${title}${spaces}`;
  },

  // Simple strings.
  [COLUMN_TYPE.CONFIGS_ERROR]: EMOJI_CONFIG_FROM_SEVERITY[SEVERITY_TYPE.error],
  [COLUMN_TYPE.CONFIGS_OFF]: EMOJI_CONFIG_FROM_SEVERITY[SEVERITY_TYPE.off],
  [COLUMN_TYPE.CONFIGS_WARN]: EMOJI_CONFIG_FROM_SEVERITY[SEVERITY_TYPE.warn],
  [COLUMN_TYPE.DEPRECATED]: EMOJI_DEPRECATED,
  [COLUMN_TYPE.DESCRIPTION]: 'Description',
  [COLUMN_TYPE.FIXABLE]: EMOJI_FIXABLE,
  [COLUMN_TYPE.FIXABLE_AND_HAS_SUGGESTIONS]: `${EMOJI_FIXABLE}${EMOJI_HAS_SUGGESTIONS}`,
  [COLUMN_TYPE.HAS_SUGGESTIONS]: EMOJI_HAS_SUGGESTIONS,
  [COLUMN_TYPE.OPTIONS]: EMOJI_OPTIONS,
  [COLUMN_TYPE.REQUIRES_TYPE_CHECKING]: EMOJI_REQUIRES_TYPE_CHECKING,
  [COLUMN_TYPE.TYPE]: EMOJI_TYPE,
};

/**
 * Decide what columns to display for the rules list.
 * Only display columns for which there is at least one rule that has a value for that column.
 */
export function getColumns(
  plugin: Plugin,
  ruleDetails: readonly RuleDetails[],
  configsToRules: ConfigsToRules,
  ruleListColumns: readonly COLUMN_TYPE[],
  pluginPrefix: string,
  ignoreConfig: readonly string[]
): Record<COLUMN_TYPE, boolean> {
  const columns: {
    [key in COLUMN_TYPE]: boolean;
  } = {
    // Alphabetical order.
    [COLUMN_TYPE.CONFIGS_ERROR]:
      getConfigsThatSetARule(
        plugin,
        configsToRules,
        pluginPrefix,
        ignoreConfig,
        SEVERITY_TYPE.error
      ).length > 0,
    [COLUMN_TYPE.CONFIGS_OFF]:
      getConfigsThatSetARule(
        plugin,
        configsToRules,
        pluginPrefix,
        ignoreConfig,
        SEVERITY_TYPE.off
      ).length > 0,
    [COLUMN_TYPE.CONFIGS_WARN]:
      getConfigsThatSetARule(
        plugin,
        configsToRules,
        pluginPrefix,
        ignoreConfig,
        SEVERITY_TYPE.warn
      ).length > 0,
    [COLUMN_TYPE.DEPRECATED]: ruleDetails.some(
      (ruleDetail) => ruleDetail.deprecated
    ),
    [COLUMN_TYPE.DESCRIPTION]: ruleDetails.some(
      (ruleDetail) => ruleDetail.description
    ),
    [COLUMN_TYPE.FIXABLE]: ruleDetails.some((ruleDetail) => ruleDetail.fixable),
    [COLUMN_TYPE.FIXABLE_AND_HAS_SUGGESTIONS]: ruleDetails.some(
      (ruleDetail) => ruleDetail.fixable || ruleDetail.hasSuggestions
    ),
    [COLUMN_TYPE.HAS_SUGGESTIONS]: ruleDetails.some(
      (ruleDetail) => ruleDetail.hasSuggestions
    ),
    [COLUMN_TYPE.NAME]: true,
    [COLUMN_TYPE.OPTIONS]: ruleDetails.some((ruleDetail) =>
      hasOptions(ruleDetail.schema)
    ),
    [COLUMN_TYPE.REQUIRES_TYPE_CHECKING]: ruleDetails.some(
      (ruleDetail) => ruleDetail.requiresTypeChecking
    ),
    // Show type column only if we found at least one rule with a standard type.
    [COLUMN_TYPE.TYPE]: ruleDetails.some(
      (ruleDetail) =>
        ruleDetail.type && RULE_TYPES.includes(ruleDetail.type as any) // eslint-disable-line @typescript-eslint/no-explicit-any
    ),
  };

  // Recreate object using the ordering and presence of columns specified in ruleListColumns.
  return Object.fromEntries(
    ruleListColumns.map((type) => [type, columns[type]])
  ) as Record<COLUMN_TYPE, boolean>;
}
