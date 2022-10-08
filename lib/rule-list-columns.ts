import { hasCustomConfigs, hasAnyConfigs } from './configs.js';
import {
  EMOJI_CONFIG_RECOMMENDED,
  EMOJI_DEPRECATED,
  EMOJI_FIXABLE,
  EMOJI_HAS_SUGGESTIONS,
  EMOJI_REQUIRES_TYPE_CHECKING,
  EMOJI_CONFIGS,
} from './emojis.js';
import type { Plugin, RuleDetails, ConfigsToRules } from './types.js';

export enum COLUMN_TYPE {
  CONFIGS = 'configs',
  CONFIG_RECOMMENDED = 'configRecommended',
  DEPRECATED = 'deprecated',
  DESCRIPTION = 'description',
  FIXABLE = 'fixable',
  HAS_SUGGESTIONS = 'hasSuggestions',
  NAME = 'rules',
  REQUIRES_TYPE_CHECKING = 'requiresTypeChecking',
}

export const COLUMN_HEADER = {
  [COLUMN_TYPE.CONFIGS]: EMOJI_CONFIGS,
  [COLUMN_TYPE.CONFIG_RECOMMENDED]: EMOJI_CONFIG_RECOMMENDED,
  [COLUMN_TYPE.DEPRECATED]: EMOJI_DEPRECATED,
  [COLUMN_TYPE.DESCRIPTION]: 'Description',
  [COLUMN_TYPE.FIXABLE]: EMOJI_FIXABLE,
  [COLUMN_TYPE.HAS_SUGGESTIONS]: EMOJI_HAS_SUGGESTIONS,
  [COLUMN_TYPE.NAME]: 'Rule',
  [COLUMN_TYPE.REQUIRES_TYPE_CHECKING]: EMOJI_REQUIRES_TYPE_CHECKING,
};

/**
 * Decide what columns to display for the rules list.
 * Only display columns for which there is at least one rule that has a value for that column.
 */
export function getColumns(
  details: RuleDetails[],
  plugin: Plugin,
  configsToRules: ConfigsToRules
) {
  const columns: {
    [key in COLUMN_TYPE]: boolean;
  } = {
    // Object keys in display order.
    [COLUMN_TYPE.NAME]: true,
    [COLUMN_TYPE.DESCRIPTION]: details.some((detail) => detail.description),
    [COLUMN_TYPE.CONFIGS]: hasCustomConfigs(plugin), // If there are custom configs, use the general config emoji.
    [COLUMN_TYPE.CONFIG_RECOMMENDED]:
      !hasCustomConfigs(plugin) && hasAnyConfigs(configsToRules), // If there are no custom configs, but there are configs, use the recommended config emoji.
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
