import {
  EMOJI_CONFIGS,
  EMOJI_DEPRECATED,
  EMOJI_FIXABLE,
  EMOJI_HAS_SUGGESTIONS,
  EMOJI_REQUIRES_TYPE_CHECKING,
  EMOJI_TYPE,
} from './emojis.js';
import { RULE_TYPES } from './rule-type.js';
import type { RuleDetails, ConfigsToRules, ConfigEmojis } from './types.js';

export enum COLUMN_TYPE {
  CONFIGS = 'configs',
  DEPRECATED = 'deprecated',
  DESCRIPTION = 'description',
  FIXABLE = 'fixable',
  HAS_SUGGESTIONS = 'hasSuggestions',
  NAME = 'name',
  REQUIRES_TYPE_CHECKING = 'requiresTypeChecking',
  TYPE = 'type',
}

export const COLUMN_TYPE_DEFAULT_PRESENCE_AND_ORDERING: {
  [key in COLUMN_TYPE]: boolean;
} = {
  // Object keys ordered in display order.
  // Object values indicate whether the column is displayed by default.
  [COLUMN_TYPE.NAME]: true,
  [COLUMN_TYPE.DESCRIPTION]: true,
  [COLUMN_TYPE.CONFIGS]: true,
  [COLUMN_TYPE.FIXABLE]: true,
  [COLUMN_TYPE.HAS_SUGGESTIONS]: true,
  [COLUMN_TYPE.REQUIRES_TYPE_CHECKING]: true,
  [COLUMN_TYPE.TYPE]: false,
  [COLUMN_TYPE.DEPRECATED]: true,
};

/**
 * An object containing the column header for each column (as a string or function to generate the string).
 */
export const COLUMN_HEADER: {
  [key in COLUMN_TYPE]:
    | string
    | ((data: {
        configNames: string[];
        configEmojis: ConfigEmojis;
        ignoreConfig: string[];
      }) => string);
} = {
  // Use the general config emoji if there are multiple configs or the sole config doesn't have an emoji.
  [COLUMN_TYPE.CONFIGS]: ({
    configNames,
    configEmojis,
    ignoreConfig,
  }: {
    configNames: string[];
    configEmojis: ConfigEmojis;
    ignoreConfig: string[];
    urlConfigs?: string;
  }) => {
    const configNamesWithoutIgnored = configNames.filter(
      (configName) => !ignoreConfig?.includes(configName)
    );
    return configNamesWithoutIgnored.length > 1
      ? EMOJI_CONFIGS
      : configEmojis?.find((configEmoji) =>
          configNamesWithoutIgnored.includes(configEmoji.config)
        )?.emoji ?? EMOJI_CONFIGS;
  },

  // Simple strings.
  [COLUMN_TYPE.DEPRECATED]: EMOJI_DEPRECATED,
  [COLUMN_TYPE.DESCRIPTION]: 'Description',
  [COLUMN_TYPE.FIXABLE]: EMOJI_FIXABLE,
  [COLUMN_TYPE.HAS_SUGGESTIONS]: EMOJI_HAS_SUGGESTIONS,
  [COLUMN_TYPE.NAME]: 'Name',
  [COLUMN_TYPE.REQUIRES_TYPE_CHECKING]: EMOJI_REQUIRES_TYPE_CHECKING,
  [COLUMN_TYPE.TYPE]: EMOJI_TYPE,
};

/**
 * Decide what columns to display for the rules list.
 * Only display columns for which there is at least one rule that has a value for that column.
 */
export function getColumns(
  details: RuleDetails[],
  configsToRules: ConfigsToRules,
  ruleListColumns: COLUMN_TYPE[],
  ignoreConfig: string[]
): Record<COLUMN_TYPE, boolean> {
  const columns: {
    [key in COLUMN_TYPE]: boolean;
  } = {
    // Alphabetical order.
    // Show the configs column if there exists a non-ignored config.
    [COLUMN_TYPE.CONFIGS]: Object.keys(configsToRules).some(
      (config) => !ignoreConfig?.includes(config)
    ),
    [COLUMN_TYPE.DEPRECATED]: details.some((detail) => detail.deprecated),
    [COLUMN_TYPE.DESCRIPTION]: details.some((detail) => detail.description),
    [COLUMN_TYPE.FIXABLE]: details.some((detail) => detail.fixable),
    [COLUMN_TYPE.HAS_SUGGESTIONS]: details.some(
      (detail) => detail.hasSuggestions
    ),
    [COLUMN_TYPE.NAME]: true,
    [COLUMN_TYPE.REQUIRES_TYPE_CHECKING]: details.some(
      (detail) => detail.requiresTypeChecking
    ),
    // Show type column only if we found at least one rule with a standard type.
    [COLUMN_TYPE.TYPE]: details.some(
      (detail) => detail.type && RULE_TYPES.includes(detail.type as any) // eslint-disable-line @typescript-eslint/no-explicit-any
    ),
  };

  // Recreate object using the ordering and presence of columns specified in ruleListColumns.
  return Object.fromEntries(
    ruleListColumns.map((column) => [column, columns[column]])
  ) as Record<COLUMN_TYPE, boolean>;
}

/**
 * Parse the option, check for errors, and set defaults.
 */
export function parseRuleListColumnsOption(
  ruleListColumns: string | undefined
): COLUMN_TYPE[] {
  const values = ruleListColumns ? ruleListColumns.split(',') : [];
  const COLUMN_TYPE_VALUES = new Set(Object.values(COLUMN_TYPE).map(String));

  // Check for invalid.
  const invalid = values.find((val) => !COLUMN_TYPE_VALUES.has(val));
  if (invalid) {
    throw new Error(`Invalid ruleListColumns option: ${invalid}`);
  }
  if (values.length !== new Set(values).size) {
    throw new Error('Duplicate value detected in ruleListColumns option.');
  }

  if (values.length === 0) {
    // Use default columns and ordering.
    values.push(
      ...Object.entries(COLUMN_TYPE_DEFAULT_PRESENCE_AND_ORDERING)
        .filter(([_col, enabled]) => enabled)
        .map(([col]) => col)
    );
  }

  return values as COLUMN_TYPE[];
}
