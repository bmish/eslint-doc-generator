import type { TSESLint, JSONSchema } from '@typescript-eslint/utils';

export type RuleModule = TSESLint.RuleModule<string, unknown[]> & {
  meta: Required<Pick<TSESLint.RuleMetaData<string>, 'docs'>>;
};

export type Plugin = {
  rules: Record<string, RuleModule>;
  configs: Record<string, { rules: Record<string, string | number> }>;
};

export interface RuleDetails {
  name: string;
  description: string;
  fixable: boolean;
  hasSuggestions: boolean;
  requiresTypeChecking: boolean;
  deprecated: boolean;
  schema: JSONSchema.JSONSchema4;
}
