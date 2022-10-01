import { END_RULE_HEADER_MARKER } from './markers.js';
import {
  EMOJI_DEPRECATED,
  EMOJI_FIXABLE,
  EMOJI_HAS_SUGGESTIONS,
  EMOJI_CONFIGS,
} from './emojis.js';
import type { RuleModule, Plugin } from './types.js';

enum MESSAGE_TYPE {
  CONFIGS = 'configs',
  DEPRECATED = 'deprecated',
  FIXABLE = 'fixable',
  HAS_SUGGESTIONS = 'hasSuggestions',
}

const MESSAGES = {
  [MESSAGE_TYPE.CONFIGS]: `${EMOJI_CONFIGS} This rule is enabled in the following configs:`, // TODO: include link to configs in the plugin's README.
  [MESSAGE_TYPE.DEPRECATED]: `${EMOJI_DEPRECATED} This rule is deprecated.`,
  [MESSAGE_TYPE.FIXABLE]: `${EMOJI_FIXABLE} This rule is automatically fixable using the \`--fix\` [option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix) on the command line.`,
  [MESSAGE_TYPE.HAS_SUGGESTIONS]: `${EMOJI_HAS_SUGGESTIONS} This rule provides [suggestions](https://eslint.org/docs/developer-guide/working-with-rules#providing-suggestions) that can be applied manually.`,
};

/**
 * Get config names that a given rule belongs to.
 */
function getConfigsForRule(
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
function configNamesToList(configNames: readonly string[]) {
  return `\`${configNames.join('`, `')}\``;
}

/**
 * Convert list of rule names to string list of links.
 */
function ruleNamesToList(ruleNames: readonly string[]) {
  return ruleNames
    .map((ruleName) => `[${ruleName}](${ruleName}.md)`)
    .join(', ');
}

/**
 * Determine which notices should and should not be included at the top of a rule doc.
 */
function getNoticesForRule(rule: RuleModule) {
  const notices: {
    [key in MESSAGE_TYPE]: boolean;
  } = {
    [MESSAGE_TYPE.CONFIGS]: !rule.meta.deprecated,
    [MESSAGE_TYPE.DEPRECATED]: rule.meta.deprecated || false,
    [MESSAGE_TYPE.FIXABLE]: Boolean(rule.meta.fixable),
    [MESSAGE_TYPE.HAS_SUGGESTIONS]: rule.meta.hasSuggestions || false,
  };

  return notices;
}

/**
 * Get the lines for the notice section at the top of a rule doc.
 */
function getRuleNoticeLines(
  ruleName: string,
  plugin: Plugin,
  pluginPrefix: string
) {
  const lines: string[] = [];

  const rule = plugin.rules[ruleName];
  const notices = getNoticesForRule(rule);
  let messageType: keyof typeof notices;

  for (messageType in notices) {
    const expected = notices[messageType];

    if (!expected) {
      // This notice should not be included.
      continue;
    }

    lines.push(''); // Blank line first.

    if (messageType === MESSAGE_TYPE.CONFIGS) {
      // This notice should have a list of the rule's configs.
      const configsEnabled = getConfigsForRule(ruleName, plugin, pluginPrefix);
      if (configsEnabled.length > 0) {
        const message = `${MESSAGES[MESSAGE_TYPE.CONFIGS]} ${configNamesToList(
          configsEnabled
        )}.`;

        lines.push(message);
      }
    } else if (messageType === MESSAGE_TYPE.DEPRECATED) {
      // This notice should include links to the replacement rule(s) if available.
      const message =
        Array.isArray(rule.meta.replacedBy) && rule.meta.replacedBy.length > 0
          ? `${MESSAGES[messageType]} It was replaced by ${ruleNamesToList(
              rule.meta.replacedBy
            )}.`
          : MESSAGES[messageType];

      lines.push(message);
    } else {
      lines.push(MESSAGES[messageType]);
    }
  }

  return lines;
}

/**
 * Generate a rule doc header for a particular rule.
 * @param description - rule description
 * @param name - rule name
 * @returns {string[]} - lines for new header including marker
 */
export function generateRuleHeaderLines(
  description: string,
  name: string,
  plugin: Plugin,
  pluginPrefix: string
): string[] {
  return [
    `# ${description} (\`${name}\`)`,
    ...getRuleNoticeLines(name, plugin, pluginPrefix),
    END_RULE_HEADER_MARKER,
  ];
}
