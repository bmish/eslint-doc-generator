import { RelevantRuleMetaData, RuleModule } from './types.js';
import { JSONSchema } from '@typescript-eslint/utils';

function parseDeprecated(meta: object) {
  return (
    'deprecated' in meta &&
    typeof meta.deprecated === 'boolean' &&
    meta.deprecated
  );
}

type Docs = Pick<RelevantRuleMetaData, 'description' | 'requiresTypeChecking'>;

function parseDocs(meta: object): Docs {
  let description = undefined;
  let requiresTypeChecking = false;
  if ('docs' in meta && typeof meta.docs === 'object' && meta.docs !== null) {
    const docs = meta.docs;
    if ('description' in docs && typeof docs.description === 'string') {
      description = docs.description;
    }
    requiresTypeChecking =
      'requiresTypeChecking' in docs &&
      typeof docs.requiresTypeChecking === 'boolean' &&
      docs.requiresTypeChecking;
  }

  return { description, requiresTypeChecking };
}

function parseFixable(meta: object) {
  if ('fixable' in meta && typeof meta.fixable === 'string') {
    return meta.fixable;
  }
  return undefined;
}

function parseHasSuggestions(meta: object) {
  return (
    'hasSuggestions' in meta &&
    typeof meta.hasSuggestions === 'boolean' &&
    meta.hasSuggestions
  );
}

function parseReplacedBy(meta: object) {
  if (
    'replacedBy' in meta &&
    Array.isArray(meta.replacedBy) &&
    meta.replacedBy.every((item) => typeof item === 'string')
  ) {
    return meta.replacedBy;
  }
  return undefined;
}

function parseType(meta: object) {
  if (
    'type' in meta &&
    (meta.type === 'layout' ||
      meta.type === 'problem' ||
      meta.type === 'suggestion')
  ) {
    return meta.type;
  }
  return undefined;
}

export function parseRuleMetaData(rule: RuleModule) {
  const meta: RelevantRuleMetaData = {};
  if ('meta' in rule && typeof rule.meta === 'object' && rule.meta !== null) {
    meta['deprecated'] = parseDeprecated(rule.meta);

    const { description, requiresTypeChecking } = parseDocs(rule.meta);
    meta['description'] = description;
    meta['requiresTypeChecking'] = requiresTypeChecking;
    meta['fixable'] = parseFixable(rule.meta);
    meta['hasSuggestions'] = parseHasSuggestions(rule.meta);
    meta['replacedBy'] = parseReplacedBy(rule.meta);
    if ('schema' in rule.meta) {
      meta['schema'] = rule.meta.schema as JSONSchema.JSONSchema4;
    }
    meta['type'] = parseType(rule.meta);
  }
  return meta;
}
