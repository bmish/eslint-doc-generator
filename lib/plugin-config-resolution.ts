import { existsSync } from 'node:fs';
import { importAbs } from './import.js';
import type { Plugin, Config, Rules, ConfigsToRules } from './types.js';

/**
 * ESLint configs can extend other configs, so for convenience, let's resolve all the rules in each config upfront.
 */
export async function resolveConfigsToRules(
  plugin: Plugin
): Promise<ConfigsToRules> {
  const configs: Record<string, Rules> = {};
  for (const [configName, config] of Object.entries(plugin.configs || {})) {
    configs[configName] = await resolveConfigRules(config);
  }
  return configs;
}

/**
 * Recursively gather all the rules from a config that may extend other configs.
 */
async function resolveConfigRules(config: Config): Promise<Rules> {
  const rules = { ...config.rules };
  for (const override of config.overrides || []) {
    Object.assign(rules, override.rules);
    const extendedRulesFromOverride = await resolveConfigExtends(
      override.extends || []
    );
    Object.assign(rules, extendedRulesFromOverride);
  }
  const extendedRules = await resolveConfigExtends(config.extends || []);
  Object.assign(rules, extendedRules);
  return rules;
}

async function resolveConfigExtends(
  extendItems: readonly string[] | string
): Promise<Rules> {
  const rules: Rules = {};
  // eslint-disable-next-line unicorn/no-instanceof-array -- using Array.isArray() loses type information about the array.
  for (const extend of extendItems instanceof Array
    ? extendItems
    : [extendItems]) {
    if (
      ['plugin:', 'eslint:'].some((prefix) => extend.startsWith(prefix)) ||
      !existsSync(extend)
    ) {
      // Ignore external configs.
      continue;
    }

    const { default: config } = (await importAbs(extend)) as {
      default: Config;
    };
    const extendedRules = await resolveConfigRules(config);
    Object.assign(rules, extendedRules);
  }
  return rules;
}
