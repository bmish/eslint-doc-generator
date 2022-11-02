import {
  EMOJI_CONFIGS,
  EMOJI_CONFIG_ERROR,
  RESERVED_EMOJIS,
} from './emojis.js';
import { SEVERITY_TYPE_TO_SET } from './types.js';
import type {
  Plugin,
  ConfigsToRules,
  ConfigEmojis,
  SEVERITY_TYPE,
} from './types.js';

export function getConfigsThatSetARule(
  plugin: Plugin,
  configsToRules: ConfigsToRules,
  pluginPrefix: string,
  ignoreConfig: string[],
  severityType?: SEVERITY_TYPE
) {
  /* istanbul ignore next -- this shouldn't happen */
  if (!plugin.rules) {
    throw new Error('Missing rules in plugin.');
  }
  const ruleNames = Object.keys(plugin.rules);
  return (
    Object.entries(configsToRules)
      .filter(([configName]) =>
        // Only consider configs that configure at least one of the plugin's rules.
        ruleNames.some((ruleName) =>
          getConfigsForRule(
            ruleName,
            configsToRules,
            pluginPrefix,
            severityType
          ).includes(configName)
        )
      )
      // Filter out ignored configs.
      .filter(([configName]) => !ignoreConfig?.includes(configName))
      .map(([configName]) => configName)
      .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
  );
}

/**
 * Get config names that a given rule belongs to.
 * @param severityType - Include configs that set the rule to this severity. Omit to allow any severity.
 */
export function getConfigsForRule(
  ruleName: string,
  configsToRules: ConfigsToRules,
  pluginPrefix: string,
  severityType?: SEVERITY_TYPE
) {
  const severity = severityType
    ? SEVERITY_TYPE_TO_SET[severityType]
    : undefined;
  const configNames: Array<keyof typeof configsToRules> = [];

  for (const configName in configsToRules) {
    const rules = configsToRules[configName];
    const value = rules[`${pluginPrefix}/${ruleName}`];
    const isSet =
      ((typeof value === 'string' || typeof value === 'number') &&
        (!severity || severity.has(value))) ||
      (typeof value === 'object' &&
        Array.isArray(value) &&
        value.length > 0 &&
        (!severity || severity.has(value[0])));

    if (isSet) {
      configNames.push(configName);
    }
  }

  return configNames.sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase())
  );
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

      if (RESERVED_EMOJIS.includes(emoji)) {
        throw new Error(`Cannot specify reserved emoji ${EMOJI_CONFIG_ERROR}.`);
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

/**
 * Find the representation of a config to display.
 * @param configEmojis - known list of configs and corresponding emojis
 * @param configName - name of the config to find an emoji for
 * @param options
 * @param options.fallback - if true and no emoji is found, choose whether to fallback to a badge.
 * @returns the string to display for the config
 */
export function findConfigEmoji(
  configEmojis: ConfigEmojis,
  configName: string,
  options?: {
    fallback?: 'badge';
  }
) {
  let emoji = configEmojis.find(
    (configEmoji) => configEmoji.config === configName
  )?.emoji;
  if (!emoji) {
    if (options?.fallback === 'badge') {
      emoji = `![${configName}][]`;
    } else {
      // No fallback.
      return undefined; // eslint-disable-line unicorn/no-useless-undefined
    }
  }

  return emoji;
}
