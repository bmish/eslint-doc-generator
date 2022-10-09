export const RULE_DOC_TITLE_FORMATS = [
  'desc-parens-prefix-name',
  'desc-parens-name',
  'prefix-name',
  'name',
] as const;

export type RuleDocTitleFormat = typeof RULE_DOC_TITLE_FORMATS[number];

export const RULE_DOC_TITLE_FORMAT_DEFAULT: RuleDocTitleFormat =
  'desc-parens-prefix-name';
