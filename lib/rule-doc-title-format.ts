export const RULE_DOC_TITLE_FORMATS = [
  'desc',
  'desc-parens-name',
  'desc-parens-prefix-name',
  'name',
  'prefix-name',
] as const;

export type RuleDocTitleFormat = typeof RULE_DOC_TITLE_FORMATS[number];

export const RULE_DOC_TITLE_FORMAT_DEFAULT: RuleDocTitleFormat =
  'desc-parens-prefix-name';
