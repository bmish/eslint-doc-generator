import { END_RULE_HEADER_MARKER } from './markers.js';
import {
  EMOJI_DEPRECATED,
  EMOJI_FIXABLE,
  EMOJI_HAS_SUGGESTIONS,
  EMOJI_REQUIRES_TYPE_CHECKING,
  EMOJI_CONFIG_FROM_SEVERITY,
} from './emojis.js';
import { findConfigEmoji, getConfigsForRule } from './configs.js';
import {
  RuleModule,
  Plugin,
  ConfigsToRules,
  ConfigEmojis,
  SEVERITY_TYPE,
  NOTICE_TYPE,
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

function severityToTerminology(severity: SEVERITY_TYPE) {
  switch (severity) {
    case SEVERITY_TYPE.error:
      return 'is enabled';
    case SEVERITY_TYPE.warn:
      return '_warns_';
    case SEVERITY_TYPE.off:
      return 'is _disabled_';
    /* istanbul ignore next -- this shouldn't happen */
    default:
      throw new Error(`Unknown severity: ${severity}`);
  }
}

function configsToNoticeSentence(
  configs: string[],
  severity: SEVERITY_TYPE,
  configsLinkOrWord: string,
  configLinkOrWord: string,
  configEmojis: ConfigEmojis
): string | undefined {
  // Create CSV list of configs with their emojis.
  const csv = configs
    .map((config) => {
      const emoji = findConfigEmoji(configEmojis, config);
      return `${emoji ? `${emoji} ` : ''}\`${config}\``;
    })
    .join(', ');

  const term = severityToTerminology(severity);
  const sentence =
    configs.length > 1
      ? `This rule ${term} in the following ${configsLinkOrWord}: ${csv}.`
      : configs.length === 1
      ? `This rule ${term} in the ${csv} ${configLinkOrWord}.`
      : undefined;

  return sentence;
}

/**
 * An object containing the text for each notice type (as a string or function to generate the string).
 */
const RULE_NOTICES: {
  [key in NOTICE_TYPE]:
    | string
    | undefined
    | ((data: {
        configsError: string[];
        configsWarn: string[];
        configsOff: string[];
        configEmojis: ConfigEmojis;
        urlConfigs?: string;
        replacedBy: readonly string[] | undefined;
        pluginPrefix: string;
        type?: RULE_TYPE;
      }) => string);
} = {
  // Configs notice varies based on whether the rule is configured in one or more configs.
  [NOTICE_TYPE.CONFIGS]: ({
    configsError,
    configsWarn,
    configsOff,
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
      (!configsError || configsError.length === 0) &&
      (!configsWarn || configsWarn.length === 0) &&
      (!configsOff || configsOff.length === 0)
    ) {
      throw new Error(
        'Should not be trying to display config notice for rule not configured in any configs.'
      );
    }

    // Use the emoji(s) for the severity levels this rule is set to in various configs.
    const emojis: string[] = [];
    if (configsError.length > 0) {
      emojis.push(EMOJI_CONFIG_FROM_SEVERITY[SEVERITY_TYPE.error]);
    }
    if (configsWarn.length > 0) {
      emojis.push(EMOJI_CONFIG_FROM_SEVERITY[SEVERITY_TYPE.warn]);
    }
    if (configsOff.length > 0) {
      emojis.push(EMOJI_CONFIG_FROM_SEVERITY[SEVERITY_TYPE.off]);
    }

    const sentences = [
      configsToNoticeSentence(
        configsError,
        SEVERITY_TYPE.error,
        configsLinkOrWord,
        configLinkOrWord,
        configEmojis
      ),
      configsToNoticeSentence(
        configsWarn,
        SEVERITY_TYPE.warn,
        configsLinkOrWord,
        configLinkOrWord,
        configEmojis
      ),
      configsToNoticeSentence(
        configsOff,
        SEVERITY_TYPE.off,
        configsLinkOrWord,
        configLinkOrWord,
        configEmojis
      ),
    ]
      .filter(Boolean)
      .join(' ');

    return `${emojis.join('')} ${sentences}`;
  },

  // Deprecated notice has optional "replaced by" rules list.
  [NOTICE_TYPE.DEPRECATED]: ({ replacedBy, pluginPrefix }) =>
    `${EMOJI_DEPRECATED} This rule is deprecated.${
      replacedBy && replacedBy.length > 0
        ? ` It was replaced by ${ruleNamesToList(replacedBy, pluginPrefix)}.`
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
function ruleNamesToList(ruleNames: readonly string[], pluginPrefix: string) {
  return ruleNames
    .map((ruleName) => {
      // Ignore plugin prefix if it's included in rule name.
      // While we could display the prefix if we wanted, it definitely cannot be part of the link.
      const ruleNameWithoutPluginPrefix = ruleName.startsWith(
        `${pluginPrefix}/`
      )
        ? ruleName.slice(pluginPrefix.length + 1)
        : ruleName;
      return `[\`${ruleNameWithoutPluginPrefix}\`](${ruleNameWithoutPluginPrefix}.md)`;
    })
    .join(', ');
}

/**
 * Determine which notices should and should not be included at the top of a rule doc.
 */
function getNoticesForRule(
  rule: RuleModule,
  configsError: string[],
  configsWarn: string[],
  configsOff: string[],
  ruleDocNotices: NOTICE_TYPE[]
) {
  const notices: {
    [key in NOTICE_TYPE]: boolean;
  } = {
    // Alphabetical order.
    [NOTICE_TYPE.CONFIGS]:
      configsError.length > 0 ||
      configsWarn.length > 0 ||
      configsOff.length > 0,
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

  const configsError = getConfigsForRule(
    ruleName,
    configsToRules,
    pluginPrefix,
    SEVERITY_TYPE.error
  ).filter((configName) => !ignoreConfig?.includes(configName));

  const configsWarn = getConfigsForRule(
    ruleName,
    configsToRules,
    pluginPrefix,
    SEVERITY_TYPE.warn
  ).filter((configName) => !ignoreConfig?.includes(configName));

  const configsOff = getConfigsForRule(
    ruleName,
    configsToRules,
    pluginPrefix,
    SEVERITY_TYPE.off
  ).filter((configName) => !ignoreConfig?.includes(configName));

  const notices = getNoticesForRule(
    rule,
    configsError,
    configsWarn,
    configsOff,
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
            configsError,
            configsWarn,
            configsOff,
            configEmojis,
            urlConfigs,
            replacedBy: rule.meta?.replacedBy,
            pluginPrefix,
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
