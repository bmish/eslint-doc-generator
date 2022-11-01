import { END_RULE_HEADER_MARKER } from './markers.js';
import {
  EMOJI_DEPRECATED,
  EMOJI_FIXABLE,
  EMOJI_HAS_SUGGESTIONS,
  EMOJI_CONFIG,
  EMOJI_REQUIRES_TYPE_CHECKING,
} from './emojis.js';
import { findConfigEmoji, getConfigsForRule } from './configs.js';
import {
  RuleModule,
  Plugin,
  ConfigsToRules,
  ConfigEmojis,
  SEVERITY_TYPE,
  NOTICE_TYPE,
  SEVERITY_ERROR,
  SEVERITY_OFF,
  SEVERITY_WARN,
} from './types.js';
import { RULE_TYPE, RULE_TYPE_MESSAGES_NOTICES } from './rule-type.js';
import {
  RuleDocTitleFormat,
  RULE_DOC_TITLE_FORMAT_DEFAULT,
} from './rule-doc-title-format.js';

export const NOTICE_TYPE_DEFAULT_PRESENCE_AND_ORDERING: {
  [key in NOTICE_TYPE]: boolean;
} = {
  // Object keys ordered in display order.
  // Object values indicate whether the column is displayed by default.
  [NOTICE_TYPE.DEPRECATED]: true, // Most important.
  [NOTICE_TYPE.CONFIGS]: true,
  [NOTICE_TYPE.FIXABLE]: true,
  [NOTICE_TYPE.FIXABLE_AND_HAS_SUGGESTIONS]: true, // Potentially replaces FIXABLE and HAS_SUGGESTIONS.
  [NOTICE_TYPE.HAS_SUGGESTIONS]: true,
  [NOTICE_TYPE.REQUIRES_TYPE_CHECKING]: true,
  [NOTICE_TYPE.TYPE]: false,
};

/**
 * An object containing the text for each notice type (as a string or function to generate the string).
 */
const RULE_NOTICES: {
  [key in NOTICE_TYPE]:
    | string
    | undefined
    | ((data: {
        configsEnabled: string[];
        configsWarn: string[];
        configsDisabled: string[];
        configEmojis: ConfigEmojis;
        urlConfigs?: string;
        replacedBy: readonly string[] | undefined;
        type?: RULE_TYPE;
      }) => string);
} = {
  // Configs notice varies based on whether the rule is configured in one or more configs.
  [NOTICE_TYPE.CONFIGS]: ({
    configsEnabled,
    configsWarn,
    configsDisabled,
    configEmojis,
    urlConfigs,
  }) => {
    // Add link to configs documentation if provided.
    const configsLinkOrWord = urlConfigs
      ? `[configs](${urlConfigs})`
      : 'configs';
    const configLinkOrWord = urlConfigs ? `[config](${urlConfigs})` : 'config';

    /* istanbul ignore next -- this shouldn't happen */
    if (
      (!configsEnabled || configsEnabled.length === 0) &&
      (!configsWarn || configsWarn.length === 0) &&
      (!configsDisabled || configsDisabled.length === 0)
    ) {
      throw new Error(
        'Should not be trying to display config notice for rule not configured in any configs.'
      );
    }

    // If one applicable config with an emoji, use the emoji for that config, otherwise use the general config emoji.
    let emoji = '';
    if (
      configsEnabled.length + configsWarn.length + configsDisabled.length >
      1
    ) {
      emoji = EMOJI_CONFIG;
    } else if (configsEnabled.length > 0) {
      // @ts-expect-error -- will always be a string thanks to fallback
      emoji = findConfigEmoji(configEmojis, configsEnabled[0], {
        severity: SEVERITY_TYPE.error,
        fallback: 'emoji',
      });
    } else if (configsWarn.length > 0) {
      // @ts-expect-error -- will always be a string thanks to fallback
      emoji = findConfigEmoji(configEmojis, configsWarn[0], {
        severity: SEVERITY_TYPE.warn,
        fallback: 'emoji',
      });
    } else if (configsDisabled.length > 0) {
      // @ts-expect-error -- will always be a string thanks to fallback
      emoji = findConfigEmoji(configEmojis, configsDisabled[0], {
        severity: SEVERITY_TYPE.off,
        fallback: 'emoji',
      });
    }

    // List of configs that enable the rule.
    const configsEnabledCSV = configsEnabled
      .map((configEnabled) => {
        const emoji = configEmojis.find(
          (configEmoji) => configEmoji.config === configEnabled
        )?.emoji;
        return `${emoji ? `${emoji} ` : ''}\`${configEnabled}\``;
      })
      .join(', ');

    // List of configs that warn for the rule.
    const configsWarnCSV = configsWarn
      .map((configWarn) => {
        const emoji = configEmojis.find(
          (configEmoji) => configEmoji.config === configWarn
        )?.emoji;
        return `${emoji ? `${emoji} ` : ''}\`${configWarn}\``;
      })
      .join(', ');

    // List of configs that disable the rule.
    const configsDisabledCSV = configsDisabled
      .map((configDisabled) => {
        const emoji = configEmojis.find(
          (configEmoji) => configEmoji.config === configDisabled
        )?.emoji;
        return `${emoji ? `${emoji} ` : ''}\`${configDisabled}\``;
      })
      .join(', ');

    // Complete sentence for configs that enable the rule.
    const SENTENCE_ENABLED =
      configsEnabled.length > 1
        ? `This rule is enabled in the following ${configsLinkOrWord}: ${configsEnabledCSV}.`
        : configsEnabled.length === 1
        ? `This rule is enabled in the \`${configsEnabled?.[0]}\` ${configLinkOrWord}.`
        : undefined;

    // Complete sentence for configs that warn for the rule.
    const SENTENCE_WARN =
      configsWarn.length > 1
        ? `This rule _warns_ in the following ${configsLinkOrWord}: ${configsWarnCSV}.`
        : configsWarn.length === 1
        ? `This rule _warns_ in the \`${configsWarn?.[0]}\` ${configLinkOrWord}.`
        : undefined;

    // Complete sentence for configs that disable the rule.
    const SENTENCE_DISABLED =
      configsDisabled.length > 1
        ? `This rule is _disabled_ in the following ${configsLinkOrWord}: ${configsDisabledCSV}.`
        : configsDisabled.length === 1
        ? `This rule is _disabled_ in the \`${configsDisabled?.[0]}\` ${configLinkOrWord}.`
        : undefined;

    return `${emoji} ${[SENTENCE_ENABLED, SENTENCE_WARN, SENTENCE_DISABLED]
      .filter((sentence) => sentence !== undefined)
      .join(' ')}`;
  },

  // Deprecated notice has optional "replaced by" rules list.
  [NOTICE_TYPE.DEPRECATED]: ({ replacedBy }) =>
    `${EMOJI_DEPRECATED} This rule is deprecated.${
      replacedBy && replacedBy.length > 0
        ? ` It was replaced by ${ruleNamesToList(replacedBy)}.`
        : ''
    }`,

  [NOTICE_TYPE.TYPE]: ({ type }) => {
    /* istanbul ignore next -- this shouldn't happen */
    if (!type) {
      throw new Error(
        'Should not be trying to display type notice for rule with no type.'
      );
    }
    return RULE_TYPE_MESSAGES_NOTICES[type];
  },

  // Simple strings.
  [NOTICE_TYPE.FIXABLE]: `${EMOJI_FIXABLE} This rule is automatically fixable by the [\`--fix\` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).`,
  [NOTICE_TYPE.FIXABLE_AND_HAS_SUGGESTIONS]: `${EMOJI_FIXABLE}${EMOJI_HAS_SUGGESTIONS} This rule is automatically fixable by the [\`--fix\` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix) and manually fixable by [editor suggestions](https://eslint.org/docs/developer-guide/working-with-rules#providing-suggestions).`,
  [NOTICE_TYPE.HAS_SUGGESTIONS]: `${EMOJI_HAS_SUGGESTIONS} This rule is manually fixable by [editor suggestions](https://eslint.org/docs/developer-guide/working-with-rules#providing-suggestions).`,
  [NOTICE_TYPE.REQUIRES_TYPE_CHECKING]: `${EMOJI_REQUIRES_TYPE_CHECKING} This rule requires type information.`,
};

/**
 * Convert list of rule names to string list of links.
 */
function ruleNamesToList(ruleNames: readonly string[]) {
  return ruleNames
    .map((ruleName) => `[\`${ruleName}\`](${ruleName}.md)`)
    .join(', ');
}

/**
 * Determine which notices should and should not be included at the top of a rule doc.
 */
function getNoticesForRule(
  rule: RuleModule,
  configsEnabled: string[],
  configsWarn: string[],
  configsDisabled: string[],
  ruleDocNotices: NOTICE_TYPE[]
) {
  const notices: {
    [key in NOTICE_TYPE]: boolean;
  } = {
    // Alphabetical order.
    [NOTICE_TYPE.CONFIGS]:
      configsEnabled.length > 0 ||
      configsWarn.length > 0 ||
      configsDisabled.length > 0,
    [NOTICE_TYPE.DEPRECATED]: rule.meta?.deprecated || false,

    // FIXABLE_AND_HAS_SUGGESTIONS potentially replaces FIXABLE and HAS_SUGGESTIONS.
    [NOTICE_TYPE.FIXABLE]:
      Boolean(rule.meta?.fixable) &&
      (!rule.meta.hasSuggestions ||
        !ruleDocNotices.includes(NOTICE_TYPE.FIXABLE_AND_HAS_SUGGESTIONS)),
    [NOTICE_TYPE.FIXABLE_AND_HAS_SUGGESTIONS]:
      Boolean(rule.meta?.fixable) && Boolean(rule.meta?.hasSuggestions),
    [NOTICE_TYPE.HAS_SUGGESTIONS]:
      Boolean(rule.meta?.hasSuggestions) &&
      (!rule.meta.fixable ||
        !ruleDocNotices.includes(NOTICE_TYPE.FIXABLE_AND_HAS_SUGGESTIONS)),

    [NOTICE_TYPE.REQUIRES_TYPE_CHECKING]:
      rule.meta?.docs?.requiresTypeChecking || false,
    [NOTICE_TYPE.TYPE]: Boolean(rule.meta?.type),
  };

  // Recreate object using the ordering and presence of columns specified in ruleDocNotices.
  return Object.fromEntries(
    ruleDocNotices.map((type) => [type, notices[type]])
  ) as Record<NOTICE_TYPE, boolean>;
}

/**
 * Get the lines for the notice section at the top of a rule doc.
 */
function getRuleNoticeLines(
  ruleName: string,
  plugin: Plugin,
  configsToRules: ConfigsToRules,
  pluginPrefix: string,
  configEmojis: ConfigEmojis,
  ignoreConfig: string[],
  ruleDocNotices: NOTICE_TYPE[],
  urlConfigs?: string
) {
  const lines: string[] = [];

  const rule = plugin.rules?.[ruleName];
  /* istanbul ignore next */
  if (!rule) {
    // This is only to please TypeScript. We should always have a rule when this function is called.
    throw new Error('Rule not found');
  }

  if (typeof rule !== 'object') {
    // We don't support the deprecated, function-style rule format as there's not much information we can extract from it.
    // https://eslint.org/docs/latest/developer-guide/working-with-rules-deprecated
    return [];
  }

  const configsEnabled = getConfigsForRule(
    ruleName,
    configsToRules,
    pluginPrefix,
    SEVERITY_ERROR
  ).filter((configName) => !ignoreConfig?.includes(configName));

  const configsWarn = getConfigsForRule(
    ruleName,
    configsToRules,
    pluginPrefix,
    SEVERITY_WARN
  ).filter((configName) => !ignoreConfig?.includes(configName));

  const configsDisabled = getConfigsForRule(
    ruleName,
    configsToRules,
    pluginPrefix,
    SEVERITY_OFF
  ).filter((configName) => !ignoreConfig?.includes(configName));

  const notices = getNoticesForRule(
    rule,
    configsEnabled,
    configsWarn,
    configsDisabled,
    ruleDocNotices
  );
  let noticeType: keyof typeof notices;

  for (noticeType in notices) {
    const expected = notices[noticeType];

    if (!expected) {
      // This notice should not be included.
      continue;
    }

    lines.push(''); // Blank line first.

    const ruleNoticeStrOrFn = RULE_NOTICES[noticeType];

    /* istanbul ignore next -- this won't happen since we would have already bailed out earlier. */
    if (!ruleNoticeStrOrFn) {
      // No notice for this column.
      continue;
    }

    lines.push(
      typeof ruleNoticeStrOrFn === 'function'
        ? ruleNoticeStrOrFn({
            configsEnabled,
            configsWarn,
            configsDisabled,
            configEmojis,
            urlConfigs,
            replacedBy: rule.meta?.replacedBy,
            type: rule.meta?.type as RULE_TYPE, // Convert union type to enum.
          })
        : ruleNoticeStrOrFn
    );
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

function makeTitle(
  name: string,
  description: string | undefined,
  pluginPrefix: string,
  ruleDocTitleFormat?: RuleDocTitleFormat
) {
  const descriptionFormatted = description
    ? removeTrailingPeriod(toSentenceCase(description))
    : undefined;

  let ruleDocTitleFormatWithFallback: RuleDocTitleFormat =
    ruleDocTitleFormat ?? RULE_DOC_TITLE_FORMAT_DEFAULT;

  if (ruleDocTitleFormatWithFallback.includes('desc') && !description) {
    // If format includes the description but the rule is missing a description,
    // fallback to the corresponding format without the description.
    switch (ruleDocTitleFormatWithFallback) {
      case 'desc':
      case 'desc-parens-prefix-name':
        ruleDocTitleFormatWithFallback = 'prefix-name';
        break;
      case 'desc-parens-name':
        ruleDocTitleFormatWithFallback = 'name';
        break;
      /* istanbul ignore next -- this shouldn't happen */
      default:
        throw new Error(
          `Unhandled rule doc title format fallback: ${ruleDocTitleFormatWithFallback}`
        );
    }
  }

  switch (ruleDocTitleFormatWithFallback) {
    // Backticks (code-style) only used around rule name to differentiate it when the rule description is also present.
    case 'desc':
      return `# ${descriptionFormatted}`;
    case 'desc-parens-name':
      return `# ${descriptionFormatted} (\`${name}\`)`;
    case 'desc-parens-prefix-name':
      return `# ${descriptionFormatted} (\`${pluginPrefix}/${name}\`)`;
    case 'name':
      return `# ${name}`;
    case 'prefix-name':
      return `# ${pluginPrefix}/${name}`;
    /* istanbul ignore next -- this shouldn't happen */
    default:
      throw new Error(
        `Unhandled rule doc title format: ${ruleDocTitleFormatWithFallback}`
      );
  }
}

/**
 * Generate a rule doc header for a particular rule.
 * @returns {string} - new header including marker
 */
export function generateRuleHeaderLines(
  description: string | undefined,
  name: string,
  plugin: Plugin,
  configsToRules: ConfigsToRules,
  pluginPrefix: string,
  configEmojis: ConfigEmojis,
  ignoreConfig: string[],
  ruleDocNotices: NOTICE_TYPE[],
  ruleDocTitleFormat?: RuleDocTitleFormat,
  urlConfigs?: string
): string {
  return [
    makeTitle(name, description, pluginPrefix, ruleDocTitleFormat),
    ...getRuleNoticeLines(
      name,
      plugin,
      configsToRules,
      pluginPrefix,
      configEmojis,
      ignoreConfig,
      ruleDocNotices,
      urlConfigs
    ),
    '',
    END_RULE_HEADER_MARKER,
  ].join('\n');
}
