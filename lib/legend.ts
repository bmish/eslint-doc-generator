import {
  EMOJI_DEPRECATED,
  EMOJI_FIXABLE,
  EMOJI_HAS_SUGGESTIONS,
  EMOJI_CONFIG,
  EMOJI_REQUIRES_TYPE_CHECKING,
  EMOJI_TYPE,
} from './emojis.js';
import { getConfigsForRule, findConfigEmoji } from './configs.js';
import {
  COLUMN_TYPE,
  ConfigEmojis,
  Plugin,
  ConfigsToRules,
  SEVERITY_ERROR,
  SEVERITY_WARN,
  SEVERITY_OFF,
  SEVERITY_TYPE,
} from './types.js';
import { RULE_TYPE_MESSAGES_LEGEND, RULE_TYPES } from './rule-type.js';

/**
 * An object containing the legends for each column (as a string or function to generate the string).
 */
const LEGENDS: {
  [key in COLUMN_TYPE]:
    | string
    | undefined // For no legend.
    | ((data: {
        plugin: Plugin;
        configsToRules: ConfigsToRules;
        configEmojis: ConfigEmojis;
        pluginPrefix: string;
        ignoreConfig: string[];
        urlConfigs?: string;
      }) => string[]);
} = {
  // Legends are included for each config. A generic config legend is also included if there are multiple configs.
  [COLUMN_TYPE.CONFIGS]: ({
    plugin,
    configsToRules,
    configEmojis,
    pluginPrefix,
    urlConfigs,
    ignoreConfig,
  }) => {
    /* istanbul ignore next -- this shouldn't happen */
    if (!plugin.configs || !plugin.rules) {
      throw new Error(
        'Should not be attempting to display configs column when there are no configs/rules.'
      );
    }

    // Add link to configs documentation if provided.
    const configsLinkOrWord = urlConfigs
      ? `[Configurations](${urlConfigs})`
      : 'Configurations';
    const configLinkOrWord = urlConfigs
      ? `[configuration](${urlConfigs})`
      : 'configuration';

    const ruleNames = Object.keys(plugin.rules);
    const configNamesWithoutIgnored = Object.entries(configsToRules)
      .filter(([configName, _config]) =>
        // Only consider configs that configure at least one of the plugin's rules.
        ruleNames.some((ruleName) =>
          getConfigsForRule(ruleName, configsToRules, pluginPrefix).includes(
            configName
          )
        )
      )
      // Filter out ignored configs.
      .filter(([configName]) => !ignoreConfig?.includes(configName))
      .map(([configName]) => configName);

    const legends = [];
    if (
      (configNamesWithoutIgnored.length > 1 ||
        !configEmojis.find((configEmoji) =>
          configNamesWithoutIgnored.includes(configEmoji.config)
        )?.emoji) &&
      // If any configs are using the generic config emoji, then don't display the generic config legend.
      !configEmojis
        .filter(({ config }) => !ignoreConfig?.includes(config))
        .some((configEmoji) => configEmoji.emoji === EMOJI_CONFIG)
    ) {
      // Generic config emoji will be used if the plugin has multiple configs or the sole config has no emoji.
      legends.push(`${EMOJI_CONFIG} ${configsLinkOrWord} enabled in.`);
    }
    legends.push(
      ...configNamesWithoutIgnored.flatMap((configName) => {
        if (!findConfigEmoji(configEmojis, configName)) {
          // No legend for this config as it has no emoji.
          return [];
        }

        let hasErrorRule = false;
        let hasWarnRule = false;
        let hasOffRule = false;
        for (const ruleName of ruleNames) {
          if (
            getConfigsForRule(
              ruleName,
              configsToRules,
              pluginPrefix,
              SEVERITY_ERROR
            ).includes(configName)
          ) {
            hasErrorRule = true;
          }
          if (
            getConfigsForRule(
              ruleName,
              configsToRules,
              pluginPrefix,
              SEVERITY_WARN
            ).includes(configName)
          ) {
            hasWarnRule = true;
          }
          if (
            getConfigsForRule(
              ruleName,
              configsToRules,
              pluginPrefix,
              SEVERITY_OFF
            ).includes(configName)
          ) {
            hasOffRule = true;
          }
        }

        const legendsForThisConfig = [];
        if (hasErrorRule) {
          legendsForThisConfig.push(
            `${findConfigEmoji(configEmojis, configName, {
              severity: SEVERITY_TYPE.error,
            })} Enabled in the \`${configName}\` ${configLinkOrWord}.`
          );
        }
        if (hasWarnRule) {
          legendsForThisConfig.push(
            `${findConfigEmoji(configEmojis, configName, {
              severity: SEVERITY_TYPE.warn,
            })} Warns in the \`${configName}\` ${configLinkOrWord}.`
          );
        }
        if (hasOffRule) {
          legendsForThisConfig.push(
            `${findConfigEmoji(configEmojis, configName, {
              severity: SEVERITY_TYPE.off,
            })} Disabled in the \`${configName}\` ${configLinkOrWord}.`
          );
        }
        return legendsForThisConfig;
      })
    );
    return legends;
  },

  // Legends are included for each rule type present.
  [COLUMN_TYPE.TYPE]: ({ plugin }) => {
    /* istanbul ignore next -- this shouldn't happen */
    if (!plugin.rules) {
      throw new Error(
        'Should not be attempting to display type column when there are no rules.'
      );
    }
    const rules = plugin.rules;

    const legends: string[] = [];

    let hasAnyRuleType = false;
    for (const ruleType of RULE_TYPES) {
      const hasThisRuleType = Object.values(rules).some(
        (rule) => typeof rule === 'object' && rule.meta.type === ruleType
      );
      if (hasThisRuleType) {
        if (!hasAnyRuleType) {
          hasAnyRuleType = true;
          // Add general rule type emoji first.
          legends.push(`${EMOJI_TYPE} The type of rule.`);
        }
        legends.push(RULE_TYPE_MESSAGES_LEGEND[ruleType]);
      }
    }

    return legends;
  },

  // Simple strings.
  [COLUMN_TYPE.DEPRECATED]: `${EMOJI_DEPRECATED} Deprecated.`,
  [COLUMN_TYPE.DESCRIPTION]: undefined,
  [COLUMN_TYPE.FIXABLE]: `${EMOJI_FIXABLE} Automatically fixable by the [\`--fix\` CLI option](https://eslint.org/docs/user-guide/command-line-interface#--fix).`,
  [COLUMN_TYPE.HAS_SUGGESTIONS]: `${EMOJI_HAS_SUGGESTIONS} Manually fixable by [editor suggestions](https://eslint.org/docs/developer-guide/working-with-rules#providing-suggestions).`,
  [COLUMN_TYPE.NAME]: undefined,
  [COLUMN_TYPE.REQUIRES_TYPE_CHECKING]: `${EMOJI_REQUIRES_TYPE_CHECKING} Requires type information.`,
};

export function generateLegend(
  columns: Record<COLUMN_TYPE, boolean>,
  plugin: Plugin,
  configsToRules: ConfigsToRules,
  configEmojis: ConfigEmojis,
  pluginPrefix: string,
  ignoreConfig: string[],
  urlConfigs?: string
) {
  return (Object.entries(columns) as [COLUMN_TYPE, boolean][])
    .flatMap(([columnType, enabled]) => {
      if (!enabled) {
        // This column is turned off.
        return [];
      }
      const legendStrOrFn = LEGENDS[columnType];
      if (!legendStrOrFn) {
        // No legend specified for this column.
        return [];
      }
      return typeof legendStrOrFn === 'function'
        ? legendStrOrFn({
            plugin,
            configsToRules,
            configEmojis,
            pluginPrefix,
            urlConfigs,
            ignoreConfig,
          })
        : [legendStrOrFn];
    })
    .join('\\\n'); // Back slash ensures these end up displayed on separate lines.
}
