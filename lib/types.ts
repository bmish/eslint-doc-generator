import type { RuleDocTitleFormat } from './rule-doc-title-format.js';
import type { TSESLint, JSONSchema } from '@typescript-eslint/utils';

// Standard ESLint types.

export type RuleModule = TSESLint.RuleModule<string, unknown[]>;

export type Rules = TSESLint.Linter.RulesRecord;

export type RuleSeverity = TSESLint.Linter.RuleLevel;

export type Config = TSESLint.Linter.Config;

export type Plugin = TSESLint.Linter.Plugin;

// Custom types.

export const SEVERITY_ERROR = new Set<RuleSeverity>([2, 'error']);
export const SEVERITY_WARN = new Set<RuleSeverity>([1, 'warn']);
export const SEVERITY_OFF = new Set<RuleSeverity>([0, 'off']);

export enum SEVERITY_TYPE {
  'error' = 'error',
  'warn' = 'warn',
  'off' = 'off',
}

export const SEVERITY_TYPE_TO_SET: {
  [key in SEVERITY_TYPE]: Set<TSESLint.Linter.RuleLevel>;
} = {
  [SEVERITY_TYPE.error]: SEVERITY_ERROR,
  [SEVERITY_TYPE.warn]: SEVERITY_WARN,
  [SEVERITY_TYPE.off]: SEVERITY_OFF,
};

export type ConfigsToRules = Record<string, Rules>;

export interface RuleDetails {
  name: string;
  description?: string; // Rule might not have a description.
  fixable: boolean;
  hasSuggestions: boolean;
  requiresTypeChecking: boolean;
  deprecated: boolean;
  schema: JSONSchema.JSONSchema4;
  type?: string; // Rule might not have a type.
}

/**
 * Some configs may have an emoji defined.
 */
export type ConfigEmojis = { config: string; emoji: string }[];

/**
 * Rule doc notices.
 */
export enum NOTICE_TYPE {
  CONFIGS = 'configs',
  DEPRECATED = 'deprecated',
  FIXABLE = 'fixable',
  FIXABLE_AND_HAS_SUGGESTIONS = 'fixableAndHasSuggestions', // Consolidated notice for space-saving.
  HAS_SUGGESTIONS = 'hasSuggestions',
  OPTIONS = 'options',
  REQUIRES_TYPE_CHECKING = 'requiresTypeChecking',
  TYPE = 'type',
}

/**
 * Rule list columns.
 */
export enum COLUMN_TYPE {
  CONFIGS_ERROR = 'configsError',
  CONFIGS_OFF = 'configsOff',
  CONFIGS_WARN = 'configsWarn',
  DEPRECATED = 'deprecated',
  DESCRIPTION = 'description',
  FIXABLE = 'fixable',
  FIXABLE_AND_HAS_SUGGESTIONS = 'fixableAndHasSuggestions', // Consolidated column for space-saving.
  HAS_SUGGESTIONS = 'hasSuggestions',
  NAME = 'name',
  OPTIONS = 'options',
  REQUIRES_TYPE_CHECKING = 'requiresTypeChecking',
  TYPE = 'type',
}

export enum OPTION_TYPE {
  CHECK = 'check',
  CONFIG_EMOJI = 'configEmoji',
  IGNORE_CONFIG = 'ignoreConfig',
  IGNORE_DEPRECATED_RULES = 'ignoreDeprecatedRules',
  INIT_RULE_DOCS = 'initRuleDocs',
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
  URL_RULE_DOC = 'urlRuleDoc',
  POSTPROCESS = 'postprocess',
}

/** The type for the config file and internal generate() function. */
export type GenerateOptions = {
  check?: boolean;
  configEmoji?: string[];
  ignoreConfig?: string[];
  ignoreDeprecatedRules?: boolean;
  initRuleDocs?: boolean;
  pathRuleDoc?: string;
  pathRuleList?: string | string[];
  postprocess?: (
    content: string,
    pathToFile: string
  ) => string | Promise<string>;
  ruleDocNotices?: string;
  ruleDocSectionExclude?: string[];
  ruleDocSectionInclude?: string[];
  ruleDocSectionOptions?: boolean;
  ruleDocTitleFormat?: RuleDocTitleFormat;
  ruleListColumns?: string;
  splitBy?: string;
  urlConfigs?: string;
  urlRuleDoc?: string;
};
