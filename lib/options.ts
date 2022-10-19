import { COLUMN_TYPE_DEFAULT_PRESENCE_AND_ORDERING } from './rule-list-columns.js';
import { NOTICE_TYPE_DEFAULT_PRESENCE_AND_ORDERING } from './rule-notices.js';
import { COLUMN_TYPE, NOTICE_TYPE } from './types.js';

/**
 * Parse the option, check for errors, and set defaults.
 */
export function parseRuleListColumnsOption(
  ruleListColumns: string | undefined
): COLUMN_TYPE[] {
  const values = ruleListColumns ? ruleListColumns.split(',') : [];
  const VALUES_OF_TYPE = new Set(Object.values(COLUMN_TYPE).map(String));

  // Check for invalid.
  const invalid = values.find((val) => !VALUES_OF_TYPE.has(val));
  if (invalid) {
    throw new Error(`Invalid ruleListColumns option: ${invalid}`);
  }
  if (values.length !== new Set(values).size) {
    throw new Error('Duplicate value detected in ruleListColumns option.');
  }

  if (values.length === 0) {
    // Use default presence and ordering.
    values.push(
      ...Object.entries(COLUMN_TYPE_DEFAULT_PRESENCE_AND_ORDERING)
        .filter(([_type, enabled]) => enabled)
        .map(([type]) => type)
    );
  }

  return values as COLUMN_TYPE[];
}

/**
 * Parse the option, check for errors, and set defaults.
 */
export function parseRuleDocNoticesOption(
  ruleDocNotices: string | undefined
): NOTICE_TYPE[] {
  const values = ruleDocNotices ? ruleDocNotices.split(',') : [];
  const VALUES_OF_TYPE = new Set(Object.values(NOTICE_TYPE).map(String));

  // Check for invalid.
  const invalid = values.find((val) => !VALUES_OF_TYPE.has(val));
  if (invalid) {
    throw new Error(`Invalid ruleDocNotices option: ${invalid}`);
  }
  if (values.length !== new Set(values).size) {
    throw new Error('Duplicate value detected in ruleDocNotices option.');
  }

  if (values.length === 0) {
    // Use default presence and ordering.
    values.push(
      ...Object.entries(NOTICE_TYPE_DEFAULT_PRESENCE_AND_ORDERING)
        .filter(([_type, enabled]) => enabled)
        .map(([type]) => type)
    );
  }

  return values as NOTICE_TYPE[];
}
