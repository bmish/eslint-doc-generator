import {
  EMOJI_DEPRECATED,
  EMOJI_FIXABLE,
  EMOJI_HAS_SUGGESTIONS,
  EMOJI_CONFIGS,
  EMOJI_CONFIG_RECOMMENDED,
  EMOJI_REQUIRES_TYPE_CHECKING,
} from './emojis.js';
import { COLUMN_TYPE } from './rule-list-columns.js';

const MESSAGES = {
  [COLUMN_TYPE.CONFIGS]: `${EMOJI_CONFIGS} Configurations enabled in.`, // TODO: include link to configs in the plugin's README.
  [COLUMN_TYPE.CONFIG_RECOMMENDED]: `${EMOJI_CONFIG_RECOMMENDED} Enabled in the \`recommended\` configuration.`, // TODO: include link to configs in the plugin's README.
  [COLUMN_TYPE.DEPRECATED]: `${EMOJI_DEPRECATED} Deprecated.`,
  [COLUMN_TYPE.FIXABLE]: `${EMOJI_FIXABLE} Fixable with [\`eslint --fix\`](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems).`,
  [COLUMN_TYPE.HAS_SUGGESTIONS]: `${EMOJI_HAS_SUGGESTIONS} Provides editor [suggestions](https://eslint.org/docs/developer-guide/working-with-rules#providing-suggestions).`,
  [COLUMN_TYPE.REQUIRES_TYPE_CHECKING]: `${EMOJI_REQUIRES_TYPE_CHECKING} Requires type information.`,
};

export function generateLegend(columns: Record<COLUMN_TYPE, boolean>) {
  return (Object.entries(columns) as [COLUMN_TYPE, boolean][])
    .flatMap(([columnType, enabled]) => {
      if (!enabled) {
        // This column is turned off.
        return [];
      }
      if (
        columnType === COLUMN_TYPE.NAME ||
        columnType === COLUMN_TYPE.DESCRIPTION
      ) {
        // No need for a legend for these columns.
        return [];
      }
      return [MESSAGES[columnType]];
    })
    .join('\\\n'); // Back slash ensures these end up displayed on separate lines.
}
