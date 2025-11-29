import { join } from 'node:path';
import { ConfigFormat } from './config-format.js';
import { RuleDocTitleFormat } from './rule-doc-title-format.js';
import {
  COLUMN_TYPE,
  GenerateOptions,
  NOTICE_TYPE,
  OPTION_TYPE,
  ResolvedGenerateOptions,
} from './types.js';

export const COLUMN_TYPE_DEFAULT_PRESENCE_AND_ORDERING: {
  [key in COLUMN_TYPE]: boolean;
} = {
  // Object keys ordered in display order.
  // Object values indicate whether the column is displayed by default.
  [COLUMN_TYPE.NAME]: true,
  [COLUMN_TYPE.DESCRIPTION]: true,
  [COLUMN_TYPE.CONFIGS_ERROR]: true,
  [COLUMN_TYPE.CONFIGS_WARN]: true,
  [COLUMN_TYPE.CONFIGS_OFF]: true,
  [COLUMN_TYPE.FIXABLE]: true,
  [COLUMN_TYPE.FIXABLE_AND_HAS_SUGGESTIONS]: false, // Optional, consolidated column.
  [COLUMN_TYPE.HAS_SUGGESTIONS]: true,
  [COLUMN_TYPE.OPTIONS]: false,
  [COLUMN_TYPE.REQUIRES_TYPE_CHECKING]: true,
  [COLUMN_TYPE.TYPE]: false,
  [COLUMN_TYPE.DEPRECATED]: true,
};

export const NOTICE_TYPE_DEFAULT_PRESENCE_AND_ORDERING: {
  [key in NOTICE_TYPE]: boolean;
} = {
  // Object keys ordered in display order.
  // Object values indicate whether the column is displayed by default.
  [NOTICE_TYPE.DEPRECATED]: true, // Most important.
  [NOTICE_TYPE.CONFIGS]: true,
  [NOTICE_TYPE.FIXABLE]: false,
  [NOTICE_TYPE.FIXABLE_AND_HAS_SUGGESTIONS]: true, // Default, consolidated notice.
  [NOTICE_TYPE.HAS_SUGGESTIONS]: false,
  [NOTICE_TYPE.OPTIONS]: false,
  [NOTICE_TYPE.REQUIRES_TYPE_CHECKING]: true,
  [NOTICE_TYPE.TYPE]: false,
  [NOTICE_TYPE.DESCRIPTION]: false,
};

// Using these variables ensures they have the correct type (not just a plain string).
const DEFAULT_RULE_DOC_TITLE_FORMAT: RuleDocTitleFormat =
  'desc-parens-prefix-name';
const DEFAULT_CONFIG_FORMAT: ConfigFormat = 'name';

export const OPTION_DEFAULTS = {
  [OPTION_TYPE.CHECK]: false,
  [OPTION_TYPE.CONFIG_EMOJI]: [],
  [OPTION_TYPE.CONFIG_FORMAT]: DEFAULT_CONFIG_FORMAT,
  [OPTION_TYPE.IGNORE_CONFIG]: [],
  [OPTION_TYPE.IGNORE_DEPRECATED_RULES]: false,
  [OPTION_TYPE.INIT_RULE_DOCS]: false,
  [OPTION_TYPE.PATH_RULE_DOC]: join('docs', 'rules', '{name}.md'),
  [OPTION_TYPE.PATH_RULE_LIST]: ['README.md'],
  [OPTION_TYPE.POSTPROCESS]: (content: string) => content,
  [OPTION_TYPE.RULE_DOC_NOTICES]: Object.entries(
    NOTICE_TYPE_DEFAULT_PRESENCE_AND_ORDERING,
  )
    .filter(([_col, enabled]) => enabled)
    .map(([col]) => col),
  [OPTION_TYPE.RULE_DOC_SECTION_EXCLUDE]: [],
  [OPTION_TYPE.RULE_DOC_SECTION_INCLUDE]: [],
  [OPTION_TYPE.RULE_DOC_SECTION_OPTIONS]: true,
  [OPTION_TYPE.RULE_DOC_TITLE_FORMAT]: DEFAULT_RULE_DOC_TITLE_FORMAT,
  [OPTION_TYPE.RULE_LIST_COLUMNS]: Object.entries(
    COLUMN_TYPE_DEFAULT_PRESENCE_AND_ORDERING,
  )
    .filter(([_col, enabled]) => enabled)
    .map(([col]) => col),
  [OPTION_TYPE.RULE_LIST_SPLIT]: [],
  [OPTION_TYPE.URL_CONFIGS]: undefined,
  [OPTION_TYPE.URL_RULE_DOC]: undefined,
} satisfies Record<OPTION_TYPE, unknown>; // Satisfies is used to ensure all options are included, but without losing type information.

/** Combines provided options with default options. */
export function getResolvedOptions(
  options: GenerateOptions = {},
): ResolvedGenerateOptions {
  const check = options.check ?? OPTION_DEFAULTS[OPTION_TYPE.CHECK];
  const configEmoji =
    options.configEmoji ?? OPTION_DEFAULTS[OPTION_TYPE.CONFIG_EMOJI];
  const configFormat =
    options.configFormat ?? OPTION_DEFAULTS[OPTION_TYPE.CONFIG_FORMAT];
  const ignoreConfig = stringOrArrayWithFallback(
    options?.ignoreConfig,
    OPTION_DEFAULTS[OPTION_TYPE.IGNORE_CONFIG],
  );

  // @ts-expect-error This will be filled in later with all the remaining options. This being
  // unfinished will not affect anything at runtime, because the options that are not yet present
  // here are still being calculated in the old way.
  return {
    check,
    configEmoji,
    configFormat,
    ignoreConfig,
  };
}

function stringOrArrayWithFallback<T extends string | readonly string[]>(
  stringOrArray: undefined | T,
  fallback: T,
): T {
  return stringOrArray && stringOrArray.length > 0 ? stringOrArray : fallback;
}
