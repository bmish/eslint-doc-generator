import {
  EMOJI_CONFIGS,
  EMOJI_DEPRECATED,
  EMOJI_FIXABLE,
  EMOJI_HAS_SUGGESTIONS,
  EMOJI_REQUIRES_TYPE_CHECKING,
} from './emojis.js';
import type { RuleDetails, ConfigsToRules, ConfigEmojis } from './types.js';

export enum COLUMN_TYPE {
  CONFIGS = 'configs',
  DEPRECATED = 'deprecated',
  DESCRIPTION = 'description',
  FIXABLE = 'fixable',
  HAS_SUGGESTIONS = 'hasSuggestions',
  NAME = 'name',
  REQUIRES_TYPE_CHECKING = 'requiresTypeChecking',
}

export const COLUMN_TYPE_DEFAULT_ORDERING = [
  COLUMN_TYPE.NAME,
  COLUMN_TYPE.DESCRIPTION,
  COLUMN_TYPE.CONFIGS,
  COLUMN_TYPE.FIXABLE,
  COLUMN_TYPE.HAS_SUGGESTIONS,
  COLUMN_TYPE.REQUIRES_TYPE_CHECKING,
  COLUMN_TYPE.DEPRECATED,
];

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
    values.push(...COLUMN_TYPE_DEFAULT_ORDERING);
  }

  return values as COLUMN_TYPE[];
}
