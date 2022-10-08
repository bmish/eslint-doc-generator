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
  REQUIRES_TYPE_CHECKING = 'requiresTypeChecking',
  RULE = 'rules',
}

export const COLUMN_HEADER = {
  [COLUMN_TYPE.CONFIGS]: EMOJI_CONFIGS,
  [COLUMN_TYPE.CONFIG_RECOMMENDED]: EMOJI_CONFIG_RECOMMENDED,
  [COLUMN_TYPE.DEPRECATED]: EMOJI_DEPRECATED,
  [COLUMN_TYPE.DESCRIPTION]: 'Description',
  [COLUMN_TYPE.FIXABLE]: EMOJI_FIXABLE,
  [COLUMN_TYPE.HAS_SUGGESTIONS]: EMOJI_HAS_SUGGESTIONS,
  [COLUMN_TYPE.REQUIRES_TYPE_CHECKING]: EMOJI_REQUIRES_TYPE_CHECKING,
  [COLUMN_TYPE.RULE]: 'Rule',
};

/**
 * Decide what columns to display for the rules list.
 */
export function getColumns(
  details: RuleDetails[],
  plugin: Plugin,
  configsToRules: ConfigsToRules
) {
  const columns: COLUMN_TYPE[] = [];

  columns.push(COLUMN_TYPE.RULE, COLUMN_TYPE.DESCRIPTION);
  if (hasCustomConfigs(plugin)) {
    columns.push(COLUMN_TYPE.CONFIGS); // If there are custom configs, use the general config emoji.
  } else if (hasAnyConfigs(configsToRules)) {
    columns.push(COLUMN_TYPE.CONFIG_RECOMMENDED); // If there are no custom configs, but there are configs, use the recommended config emoji.
  }
  columns.push(COLUMN_TYPE.FIXABLE, COLUMN_TYPE.HAS_SUGGESTIONS);
  if (details.some((detail: RuleDetails) => detail.requiresTypeChecking)) {
    columns.push(COLUMN_TYPE.REQUIRES_TYPE_CHECKING);
  }
  if (details.some((detail) => detail.deprecated)) {
    columns.push(COLUMN_TYPE.DEPRECATED);
  }

  return columns;
}
