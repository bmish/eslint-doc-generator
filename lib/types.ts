import type { TSESLint, JSONSchema } from '@typescript-eslint/utils';

export type RuleModule = TSESLint.RuleModule<string, unknown[]> & {
  meta: Required<Pick<TSESLint.RuleMetaData<string>, 'docs'>>;
};

export type Rules = Record<string, string | number>;

export type Config = {
  extends: string[];
  rules: Rules;
};

export type ConfigsToRules = Record<string, Rules>;

export type Plugin = {
  rules: Record<string, RuleModule>;
  configs: Record<string, Config>;
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
