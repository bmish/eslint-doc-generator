import { EMOJI_CONFIGS } from './emojis.js';
import type { Plugin, ConfigsToRules, ConfigEmojis } from './types.js';

const SEVERITY_ENABLED = new Set([2, 'error']);

/**
 * Get config names that a given rule belongs to.
 */
export function getConfigsForRule(
  ruleName: string,
  configsToRules: ConfigsToRules,
  pluginPrefix: string
) {
  const configNames: Array<keyof typeof configsToRules> = [];

  for (const configName in configsToRules) {
    const rules = configsToRules[configName];
    const value = rules[`${pluginPrefix}/${ruleName}`];
    const isEnabled =
      ((typeof value === 'string' || typeof value === 'number') &&
        SEVERITY_ENABLED.has(value)) ||
      (typeof value === 'object' &&
        Array.isArray(value) &&
        value.length > 0 &&
        SEVERITY_ENABLED.has(value[0]));

    if (isEnabled) {
      configNames.push(configName);
    }
  }

  return configNames.sort();
}

/**
 * Parse the options, check for errors, and set defaults.
 */
export function parseConfigEmojiOptions(
  plugin: Plugin,
  configEmoji?: string[]
): ConfigEmojis {
  const configsWithDefaultEmojiRemoved: string[] = [];
  const configEmojis =
    configEmoji?.flatMap((configEmojiItem) => {
      const [config, emoji, ...extra] = configEmojiItem.split(',');

      if (config && !emoji && Object.keys(EMOJI_CONFIGS).includes(config)) {
        // User wants to remove the default emoji for this config.
        configsWithDefaultEmojiRemoved.push(config);
        return [];
      }

      if (!config || !emoji || extra.length > 0) {
        throw new Error(
          `Invalid configEmoji option: ${configEmojiItem}. Expected format: config,emoji`
        );
      }
      if (plugin.configs?.[config] === undefined) {
        throw new Error(
          `Invalid configEmoji option: ${config} config not found.`
        );
      }
      return [{ config, emoji }];
    }) || [];

  // Add default emojis for the common configs for which the user hasn't already specified an emoji.
  for (const [config, emoji] of Object.entries(EMOJI_CONFIGS)) {
    if (configsWithDefaultEmojiRemoved.includes(config)) {
      // Skip the default emoji for this config.
      continue;
    }
    if (!configEmojis.some((configEmoji) => configEmoji.config === config)) {
      configEmojis.push({ config, emoji });
    }
  }

  return configEmojis;
}
