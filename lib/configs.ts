import type { Plugin, ConfigsToRules } from './types.js';

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
  configsToRules: ConfigsToRules,
  pluginPrefix: string
) {
  const configNames: Array<keyof typeof configsToRules> = [];

  for (const configName in configsToRules) {
    const rules = configsToRules[configName];
    const value = rules[`${pluginPrefix}/${ruleName}`];
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
