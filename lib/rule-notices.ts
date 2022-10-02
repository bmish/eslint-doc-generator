import { END_RULE_HEADER_MARKER } from './markers.js';
import {
  EMOJI_DEPRECATED,
  EMOJI_FIXABLE,
  EMOJI_HAS_SUGGESTIONS,
  EMOJI_CONFIGS,
  EMOJI_CONFIG_RECOMMENDED,
} from './emojis.js';
import { getConfigsForRule, configNamesToList } from './configs.js';
import type { RuleModule, Plugin } from './types.js';

enum MESSAGE_TYPE {
  CONFIGS = 'configs',
  CONFIG_RECOMMENDED = 'configRecommended',
  DEPRECATED = 'deprecated',
  FIXABLE = 'fixable',
  HAS_SUGGESTIONS = 'hasSuggestions',
}

const MESSAGES = {
  [MESSAGE_TYPE.CONFIGS]: `${EMOJI_CONFIGS} This rule is enabled in the following configs:`, // TODO: include link to configs in the plugin's README.
  [MESSAGE_TYPE.CONFIG_RECOMMENDED]: `${EMOJI_CONFIG_RECOMMENDED} This rule is enabled in the \`recommended\` config.`, // TODO: include link to configs in the plugin's README.
  [MESSAGE_TYPE.DEPRECATED]: `${EMOJI_DEPRECATED} This rule is deprecated.`,
  [MESSAGE_TYPE.FIXABLE]: `${EMOJI_FIXABLE} This rule is automatically fixable using the \`--fix\` [option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix) on the command line.`,
  [MESSAGE_TYPE.HAS_SUGGESTIONS]: `${EMOJI_HAS_SUGGESTIONS} This rule provides [suggestions](https://eslint.org/docs/developer-guide/working-with-rules#providing-suggestions) that can be applied manually.`,
};

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
function getNoticesForRule(rule: RuleModule, configsEnabled: string[]) {
  const notices: {
    [key in MESSAGE_TYPE]: boolean;
  } = {
    [MESSAGE_TYPE.CONFIGS]:
      configsEnabled.length > 1 ||
      (configsEnabled.length === 1 && configsEnabled[0] !== 'recommended'),
    [MESSAGE_TYPE.CONFIG_RECOMMENDED]:
      configsEnabled.length === 1 && configsEnabled[0] === 'recommended',
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
  const configsEnabled = getConfigsForRule(ruleName, plugin, pluginPrefix);
  const notices = getNoticesForRule(rule, configsEnabled);
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
      const message = `${MESSAGES[MESSAGE_TYPE.CONFIGS]} ${configNamesToList(
        configsEnabled
      )}.`;

      lines.push(message);
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

function toSentenceCase(str: string) {
  return str.replace(/^\w/, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase();
  });
}

function removeTrailingPeriod(str: string) {
  return str.replace(/\.$/, '');
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
  const descriptionFormatted = removeTrailingPeriod(
    toSentenceCase(description)
  );
  return [
    `# ${descriptionFormatted} (\`${pluginPrefix}/${name}\`)`,
    ...getRuleNoticeLines(name, plugin, pluginPrefix),
    END_RULE_HEADER_MARKER,
  ];
}
