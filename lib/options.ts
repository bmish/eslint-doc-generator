import { RuleDocTitleFormat } from './rule-doc-title-format.js';
import { COLUMN_TYPE, NOTICE_TYPE } from './types.js';

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
  [NOTICE_TYPE.REQUIRES_TYPE_CHECKING]: true,
  [NOTICE_TYPE.TYPE]: false,
};

export enum OPTION_TYPE {
  CHECK = 'check',
  CONFIG_EMOJI = 'configEmoji',
  IGNORE_CONFIG = 'ignoreConfig',
  IGNORE_DEPRECATED_RULES = 'ignoreDeprecatedRules',
  PATH_RULE_DOC = 'pathRuleDoc',
  PATH_RULE_LIST = 'pathRuleList',
  RULE_DOC_NOTICES = 'ruleDocNotices',
  RULE_DOC_SECTION_EXCLUDE = 'ruleDocSectionExclude',
  RULE_DOC_SECTION_INCLUDE = 'ruleDocSectionInclude',
  RULE_DOC_SECTION_OPTIONS = 'ruleDocSectionOptions',
  RULE_DOC_TITLE_FORMAT = 'ruleDocTitleFormat',
  RULE_LIST_COLUMNS = 'ruleListColumns',
  SPLIT_BY = 'splitBy',
  URL_CONFIGS = 'urlConfigs',
}

const DEFAULT_RULE_DOC_TITLE_FORMAT: RuleDocTitleFormat =
  'desc-parens-prefix-name'; // Using this variable ensures this default has the correct type (not just a plain string).

// TODO: use TypeScript 4.9 satisfies keyword ([key in OPTION_TYPE]...) to ensure all options are included without losing type information.
export const OPTION_DEFAULTS = {
  [OPTION_TYPE.CHECK]: false,
  [OPTION_TYPE.CONFIG_EMOJI]: [],
  [OPTION_TYPE.IGNORE_CONFIG]: [],
  [OPTION_TYPE.IGNORE_DEPRECATED_RULES]: false,
  [OPTION_TYPE.PATH_RULE_DOC]: 'docs/rules/{name}.md',
  [OPTION_TYPE.PATH_RULE_LIST]: 'README.md',
  [OPTION_TYPE.RULE_DOC_NOTICES]: Object.entries(
    NOTICE_TYPE_DEFAULT_PRESENCE_AND_ORDERING
  )
    .filter(([_col, enabled]) => enabled)
    .map(([col]) => col)
    .join(','),
  [OPTION_TYPE.RULE_DOC_SECTION_EXCLUDE]: [],
  [OPTION_TYPE.RULE_DOC_SECTION_INCLUDE]: [],
  [OPTION_TYPE.RULE_DOC_SECTION_OPTIONS]: true,
  [OPTION_TYPE.RULE_DOC_TITLE_FORMAT]: DEFAULT_RULE_DOC_TITLE_FORMAT,
  [OPTION_TYPE.RULE_LIST_COLUMNS]: Object.entries(
    COLUMN_TYPE_DEFAULT_PRESENCE_AND_ORDERING
  )
    .filter(([_col, enabled]) => enabled)
    .map(([col]) => col)
    .join(','),
  [OPTION_TYPE.SPLIT_BY]: undefined,
  [OPTION_TYPE.URL_CONFIGS]: undefined,
};

export type GenerateOptions = {
  check?: boolean;
  configEmoji?: string[];
  ignoreConfig?: string[];
  ignoreDeprecatedRules?: boolean;
  pathRuleDoc?: string;
  pathRuleList?: string;
  ruleDocNotices?: string;
  ruleDocSectionExclude?: string[];
  ruleDocSectionInclude?: string[];
  ruleDocSectionOptions?: boolean;
  ruleDocTitleFormat?: RuleDocTitleFormat;
  ruleListColumns?: string;
  urlConfigs?: string;
  splitBy?: string;
};
