import {
  BEGIN_RULE_OPTIONS_LIST_MARKER,
  END_RULE_OPTIONS_LIST_MARKER,
} from './comment-markers.js';
import { markdownTable } from 'markdown-table';
import type { RuleModule } from './types.js';
import { RuleOption, getAllNamedOptions } from './rule-options.js';
import { capitalizeOnlyFirstLetter } from './string.js';

export enum COLUMN_TYPE {
  // Alphabetical order.
  DEFAULT = 'default',
  DEPRECATED = 'deprecated',
  DESCRIPTION = 'description',
  ENUM = 'enum',
  NAME = 'name',
  REQUIRED = 'required',
  TYPE = 'type',
}

const HEADERS: {
  [key in COLUMN_TYPE]: string;
} = {
  // Alphabetical order.
  [COLUMN_TYPE.DEFAULT]: 'Default',
  [COLUMN_TYPE.DEPRECATED]: 'Deprecated',
  [COLUMN_TYPE.DESCRIPTION]: 'Description',
  [COLUMN_TYPE.ENUM]: 'Choices',
  [COLUMN_TYPE.NAME]: 'Name',
  [COLUMN_TYPE.REQUIRED]: 'Required',
  [COLUMN_TYPE.TYPE]: 'Type',
};

const COLUMN_TYPE_DEFAULT_PRESENCE_AND_ORDERING: {
  [key in COLUMN_TYPE]: boolean;
} = {
  // Object keys ordered in display order.
  // Object values indicate whether the column is displayed by default.
  [COLUMN_TYPE.NAME]: true,
  [COLUMN_TYPE.DESCRIPTION]: true,
  [COLUMN_TYPE.TYPE]: true,
  [COLUMN_TYPE.ENUM]: true,
  [COLUMN_TYPE.DEFAULT]: true,
  [COLUMN_TYPE.REQUIRED]: true,
  [COLUMN_TYPE.DEPRECATED]: true,
};

function ruleOptionToColumnValues(ruleOption: RuleOption): {
  [key in COLUMN_TYPE]: string | undefined;
} {
  const columns: {
    [key in COLUMN_TYPE]: string | undefined;
  } = {
    // Alphabetical order.
    [COLUMN_TYPE.DEFAULT]:
      ruleOption.default === undefined
        ? undefined
        : `\`${String(ruleOption.default)}\``,
    [COLUMN_TYPE.DEPRECATED]: ruleOption.deprecated ? 'Yes' : undefined,
    [COLUMN_TYPE.DESCRIPTION]: ruleOption.description,
    [COLUMN_TYPE.ENUM]:
      ruleOption.enum && ruleOption.enum.length > 0
        ? `\`${ruleOption.enum.join('`, `')}\``
        : undefined,
    [COLUMN_TYPE.NAME]: `\`${ruleOption.name}\``,
    [COLUMN_TYPE.REQUIRED]: ruleOption.required ? 'Yes' : undefined,
    [COLUMN_TYPE.TYPE]: ruleOption.type
      ? capitalizeOnlyFirstLetter(ruleOption.type)
      : undefined,
  };

  return columns;
}

function ruleOptionsToColumnsToDisplay(ruleOptions: readonly RuleOption[]): {
  [key in COLUMN_TYPE]: boolean;
} {
  const columnsToDisplay: {
    [key in COLUMN_TYPE]: boolean;
  } = {
    // Alphabetical order.
    [COLUMN_TYPE.DEFAULT]: ruleOptions.some((ruleOption) => ruleOption.default),
    [COLUMN_TYPE.DEPRECATED]: ruleOptions.some(
      (ruleOption) => ruleOption.deprecated
    ),
    [COLUMN_TYPE.DESCRIPTION]: ruleOptions.some(
      (ruleOption) => ruleOption.description
    ),
    [COLUMN_TYPE.ENUM]: ruleOptions.some((ruleOption) => ruleOption.enum),
    [COLUMN_TYPE.NAME]: true,
    [COLUMN_TYPE.REQUIRED]: ruleOptions.some(
      (ruleOption) => ruleOption.required
    ),
    [COLUMN_TYPE.TYPE]: ruleOptions.some((ruleOption) => ruleOption.type),
  };
  return columnsToDisplay;
}

function generateRuleOptionsListMarkdown(rule: RuleModule): string {
  const ruleOptions = getAllNamedOptions(rule.meta.schema);

  if (ruleOptions.length === 0) {
    return '';
  }

  const columnsToDisplay = ruleOptionsToColumnsToDisplay(ruleOptions);
  const listHeaderRow = Object.keys(COLUMN_TYPE_DEFAULT_PRESENCE_AND_ORDERING)
    .filter((type) => columnsToDisplay[type as COLUMN_TYPE])
    .map((type) => HEADERS[type as COLUMN_TYPE]);

  const rows = [...ruleOptions]
    .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
    .map((ruleOption) => {
      const ruleOptionColumnValues = ruleOptionToColumnValues(ruleOption);

      // Recreate object using correct ordering and presence of columns.
      return Object.keys(COLUMN_TYPE_DEFAULT_PRESENCE_AND_ORDERING)
        .filter((type) => columnsToDisplay[type as COLUMN_TYPE])
        .map((type) => ruleOptionColumnValues[type as COLUMN_TYPE]);
    });

  return markdownTable(
    [listHeaderRow, ...rows],
    { align: 'l' } // Left-align headers.
  );
}

export function updateRuleOptionsList(
  markdown: string,
  rule: RuleModule
): string {
  const listStartIndex = markdown.indexOf(BEGIN_RULE_OPTIONS_LIST_MARKER);
  let listEndIndex = markdown.indexOf(END_RULE_OPTIONS_LIST_MARKER);

  if (listStartIndex === -1 || listEndIndex === -1) {
    // No rule options list found.
    return markdown;
  }

  // Account for length of pre-existing marker.
  listEndIndex += END_RULE_OPTIONS_LIST_MARKER.length;

  const preList = markdown.slice(0, Math.max(0, listStartIndex));
  const postList = markdown.slice(Math.max(0, listEndIndex));

  // New rule options list.
  const list = generateRuleOptionsListMarkdown(rule);

  return `${preList}${BEGIN_RULE_OPTIONS_LIST_MARKER}\n\n${list}\n\n${END_RULE_OPTIONS_LIST_MARKER}${postList}`;
}
