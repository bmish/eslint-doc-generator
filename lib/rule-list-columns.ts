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
  NAME = 'rules',
  REQUIRES_TYPE_CHECKING = 'requiresTypeChecking',
}

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
  ignoreConfig: string[]
) {
  const columns: {
    [key in COLUMN_TYPE]: boolean;
  } = {
    // Object keys in display order.
    [COLUMN_TYPE.NAME]: true,
    [COLUMN_TYPE.DESCRIPTION]: details.some((detail) => detail.description),
    // Show the configs column if there exists a non-ignored config.
    [COLUMN_TYPE.CONFIGS]: Object.keys(configsToRules).some(
      (config) => !ignoreConfig?.includes(config)
    ),
    [COLUMN_TYPE.FIXABLE]: details.some((detail) => detail.fixable),
    [COLUMN_TYPE.HAS_SUGGESTIONS]: details.some(
      (detail) => detail.hasSuggestions
    ),
    [COLUMN_TYPE.REQUIRES_TYPE_CHECKING]: details.some(
      (detail) => detail.requiresTypeChecking
    ),
    [COLUMN_TYPE.DEPRECATED]: details.some((detail) => detail.deprecated),
  };

  return columns;
}
