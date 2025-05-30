import { existsSync } from 'node:fs';
import { importAbs } from './import.js';
import type { Plugin, Config, Rules, ConfigsToRules } from './types.js';
import { TSESLint } from '@typescript-eslint/utils';

import {
  ClassicConfig,
  FlatConfig,
  // eslint-disable-next-line import/extensions -- false positive
} from '@typescript-eslint/utils/dist/ts-eslint';

/**
 * ESLint configs can extend other configs, so for convenience, let's resolve all the rules in each config upfront.
 */
export async function resolveConfigsToRules(
  plugin: Plugin,
): Promise<ConfigsToRules> {
  const configs: Record<string, Rules> = {};
  for (const [configName, config] of Object.entries(plugin.configs || {})) {
    configs[configName] = await resolvePotentiallyFlatConfigs(config);
  }
  return configs;
}

/**
 * Check whether the passed config is an array and iterate over it
 */
async function resolvePotentiallyFlatConfigs(
  potentiallyFlatConfigs: TSESLint.Linter.ConfigType,
): Promise<Rules> {
  const rules: Rules = {};
  if (Array.isArray(potentiallyFlatConfigs)) {
    for (const config of potentiallyFlatConfigs) {
      Object.assign(rules, await resolvePotentiallyFlatConfigs(config));
    }
  } else {
    Object.assign(rules, await resolveConfigRules(potentiallyFlatConfigs));
  }
  return rules;
}

/**
 * Recursively gather all the rules from a config that may extend other configs.
 */
async function resolveConfigRules(
  config: ClassicConfig.Config | FlatConfig.Config,
): Promise<Rules> {
  const rules = { ...config.rules };
  if ('overrides' in config && config.overrides) {
    for (const override of config.overrides) {
      Object.assign(rules, override.rules);
      const extendedRulesFromOverride = await resolveConfigExtends(
        override.extends || [],
      );
      Object.assign(rules, extendedRulesFromOverride);
    }
  }
  if ('extends' in config && config.extends) {
    const extendedRules = await resolveConfigExtends(config.extends);
    Object.assign(rules, extendedRules);
  }
  return rules;
}

async function resolveConfigExtends(
  extendItems: readonly string[] | string,
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
