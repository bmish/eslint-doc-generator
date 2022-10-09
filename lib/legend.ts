import {
  EMOJI_DEPRECATED,
  EMOJI_FIXABLE,
  EMOJI_HAS_SUGGESTIONS,
  EMOJI_CONFIGS,
  EMOJI_CONFIG_RECOMMENDED,
  EMOJI_REQUIRES_TYPE_CHECKING,
} from './emojis.js';
import { COLUMN_TYPE } from './rule-list-columns.js';

function getMessages(urlConfigs?: string) {
  const configsLinkOrWord = urlConfigs
    ? `[Configurations](${urlConfigs})`
    : 'Configurations';
  const configLinkOrWord = urlConfigs
    ? `[configuration](${urlConfigs})`
    : 'configuration';
  const MESSAGES: {
    [key in COLUMN_TYPE]: string | undefined;
  } = {
    [COLUMN_TYPE.NAME]: undefined, // No legend for this column.
    [COLUMN_TYPE.DESCRIPTION]: undefined, // No legend for this column.
    [COLUMN_TYPE.CONFIGS]: `${EMOJI_CONFIGS} ${configsLinkOrWord} enabled in.`,
    [COLUMN_TYPE.CONFIG_RECOMMENDED]: `${EMOJI_CONFIG_RECOMMENDED} Enabled in the \`recommended\` ${configLinkOrWord}.`,
    [COLUMN_TYPE.DEPRECATED]: `${EMOJI_DEPRECATED} Deprecated.`,
    [COLUMN_TYPE.FIXABLE]: `${EMOJI_FIXABLE} Automatically fixable by the \`--fix\` [CLI option](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems).`,
    [COLUMN_TYPE.HAS_SUGGESTIONS]: `${EMOJI_HAS_SUGGESTIONS} Manually fixable by editor [suggestions](https://eslint.org/docs/developer-guide/working-with-rules#providing-suggestions).`,
    [COLUMN_TYPE.REQUIRES_TYPE_CHECKING]: `${EMOJI_REQUIRES_TYPE_CHECKING} Requires type information.`,
  };
  return MESSAGES;
}

export function generateLegend(
  columns: Record<COLUMN_TYPE, boolean>,
  urlConfigs?: string
) {
  const MESSAGES = getMessages(urlConfigs);
  return (Object.entries(columns) as [COLUMN_TYPE, boolean][])
    .flatMap(([columnType, enabled]) => {
      if (!enabled) {
        // This column is turned off.
        return [];
      }
      if (!MESSAGES[columnType]) {
        // No legend specified for this column.
        return [];
      }
      return [MESSAGES[columnType]];
    })
    .join('\\\n'); // Back slash ensures these end up displayed on separate lines.
}
