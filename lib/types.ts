import type { TSESLint, JSONSchema } from '@typescript-eslint/utils';

// Standard ESLint types.

export type RuleModule = TSESLint.RuleModule<string, unknown[]>;

export type Rules = TSESLint.Linter.RulesRecord;

export type RuleSeverity = TSESLint.Linter.RuleLevel;

export type Config = TSESLint.Linter.Config;

export type Plugin = TSESLint.Linter.Plugin;

// Custom types.

export const SEVERITY_ERROR = new Set<RuleSeverity>([2, 'error']);
export const SEVERITY_OFF = new Set<RuleSeverity>([0, 'off']);

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
 * Same as COLUMN_TYPE but without NAME, DESCRIPTION (which are in the rule doc title).
 */
export enum NOTICE_TYPE {
  CONFIGS = 'configs',
  DEPRECATED = 'deprecated',
  FIXABLE = 'fixable',
  FIXABLE_AND_HAS_SUGGESTIONS = 'fixableAndHasSuggestions', // Consolidated notice for space-saving.
  HAS_SUGGESTIONS = 'hasSuggestions',
  REQUIRES_TYPE_CHECKING = 'requiresTypeChecking',
  TYPE = 'type',
}

/**
 * Rule list columns.
 */
export enum COLUMN_TYPE {
  CONFIGS = 'configs',
  DEPRECATED = 'deprecated',
  DESCRIPTION = 'description',
  FIXABLE = 'fixable',
  HAS_SUGGESTIONS = 'hasSuggestions',
  NAME = 'name',
  REQUIRES_TYPE_CHECKING = 'requiresTypeChecking',
  TYPE = 'type',
}
