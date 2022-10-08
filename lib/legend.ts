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

export function generateLegend(columns: COLUMN_TYPE[]) {
  return columns
    .flatMap((column) => {
      if (column === COLUMN_TYPE.RULE || column === COLUMN_TYPE.DESCRIPTION) {
        return []; // No need for a legend for these columns.
      }
      return [MESSAGES[column]];
    })
    .join('\\\n'); // Back slash ensures these end up displayed on separate lines.
}
