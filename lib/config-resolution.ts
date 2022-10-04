import { existsSync } from 'node:fs';
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
  if (!config.extends) {
    return config.rules;
  }
  const rules = { ...config.rules };
  for (const extend of config.extends) {
    if (
      ['plugin:', 'eslint:'].some((prefix) => extend.startsWith(prefix)) ||
      !existsSync(extend)
    ) {
      // Ignore external configs.
      continue;
    }

    const { default: config } = await import(extend);
    const nestedRules = await resolveConfigRules(config);
    Object.assign(rules, nestedRules);
  }
  return rules;
}
