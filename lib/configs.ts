import type { Plugin } from './types.js';

export function hasCustomConfigs(plugin: Plugin) {
  return Object.keys(plugin.configs || {}).some(
    // Ignore the common configs.
    (configName) => !['all', 'recommended'].includes(configName)
  );
}

/**
 * Get config names that a given rule belongs to.
 */
export function getConfigsForRule(
  ruleName: string,
  plugin: Plugin,
  pluginPrefix: string
) {
  const { configs } = plugin;
  const configNames: Array<keyof typeof configs> = [];
  let configName: keyof typeof configs;

  for (configName in configs) {
    const config = configs[configName];
    const value = config.rules[`${pluginPrefix}/${ruleName}`];
    const isEnabled = [2, 'error'].includes(value);

    if (isEnabled) {
      configNames.push(configName);
    }
  }

  return configNames.sort();
}

/**
 * Convert list of configs to string list of formatted names.
 */
export function configNamesToList(configNames: readonly string[]) {
  return `\`${configNames.join('`, `')}\``;
}
