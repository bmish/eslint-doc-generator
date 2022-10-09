import type { Plugin, ConfigsToRules } from './types.js';

export function hasCustomConfigs(plugin: Plugin, ignoreConfig?: string[]) {
  return Object.keys(plugin.configs || {}).some(
    // Consider a config custom if not-recommended and not ignored.
    (configName) =>
      configName !== 'recommended' && !ignoreConfig?.includes(configName)
  );
}

export function hasAnyConfigs(configsToRules: ConfigsToRules) {
  return Object.keys(configsToRules).length > 0;
}

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
 * Convert list of configs to string list of formatted names.
 */
export function configNamesToList(configNames: readonly string[]) {
  return `\`${configNames.join('`, `')}\``;
}
