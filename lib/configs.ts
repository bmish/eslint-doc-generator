import {
  EMOJI_CONFIGS,
  EMOJI_CONFIG,
  EMOJI_CONFIG_WARN,
  EMOJI_CONFIG_OFF,
} from './emojis.js';
import type {
  Plugin,
  ConfigsToRules,
  ConfigEmojis,
  RuleSeverity,
  SEVERITY_TYPE,
} from './types.js';

/**
 * Get config names that a given rule belongs to.
 * @param severity - Include configs that set the rule to this severity. Omit to allow any severity.
 */
export function getConfigsForRule(
  ruleName: string,
  configsToRules: ConfigsToRules,
  pluginPrefix: string,
  severity?: Set<RuleSeverity>
) {
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

      if (Object.keys(plugin.configs)?.length > 1 && emoji === EMOJI_CONFIG) {
        throw new Error(
          `Cannot use the general configs emoji ${EMOJI_CONFIG} for an individual config when multiple configs are present.`
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

function emojiWithSuperscript(
  emoji: string,
  superscriptEmoji: string,
  noWrap = false
) {
  if (emoji === superscriptEmoji) {
    // Avoid double emoji.
    return emoji;
  }
  // Style is to ensure superscript doesn't wrap to separate line, useful in constrained spaces.
  return noWrap
    ? `<span style="white-space:nowrap">${emoji}<sup>${superscriptEmoji}</sup></span>`
    : `${emoji}<sup>${superscriptEmoji}</sup>`;
}

/**
 * Find the representation of a config to display.
 * @param configEmojis - known list of configs and corresponding emojis
 * @param configName - name of the config to find an emoji for
 * @param options
 * @param options.severity - if present, decorate the config's emoji for the given severity level
 * @param options.fallback - if true and no emoji is found, choose whether to fallback to a generic config emoji or a badge
 * @param options.noWrap - whether to add styling to ensure the superscript doesn't wrap to a separate line when used in constrained spaces
 * @returns the string to display for the config
 */
export function findConfigEmoji(
  configEmojis: ConfigEmojis,
  configName: string,
  options?: {
    severity?: SEVERITY_TYPE;
    fallback?: 'badge' | 'emoji';
    noWrap?: boolean;
  }
) {
  let emoji = configEmojis.find(
    (configEmoji) => configEmoji.config === configName
  )?.emoji;
  if (!emoji) {
    if (options?.fallback === 'badge') {
      emoji = `![${configName}][]`;
    } else if (options?.fallback === 'emoji') {
      emoji = EMOJI_CONFIG;
    } else {
      // No fallback.
      return undefined; // eslint-disable-line unicorn/no-useless-undefined
    }
  }

  switch (options?.severity) {
    case 'warn':
      return emojiWithSuperscript(emoji, EMOJI_CONFIG_WARN, options.noWrap);
    case 'off':
      return emojiWithSuperscript(emoji, EMOJI_CONFIG_OFF, options.noWrap);
    default:
      return emoji;
  }
}
