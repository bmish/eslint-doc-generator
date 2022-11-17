import { SEVERITY_TYPE } from './types.js';
import { EMOJIS_TYPE } from './rule-type.js';

// Default emojis for common configs.
const EMOJI_A11Y = '♿';
const EMOJI_ERROR = '❗';
const EMOJI_STYLE = '🎨';
const EMOJI_TYPESCRIPT = '⌨️';
const EMOJI_WARNING = '🚸';
export const EMOJI_CONFIGS = {
  a11y: EMOJI_A11Y,
  accessibility: EMOJI_A11Y,
  all: '🌐',
  error: EMOJI_ERROR,
  errors: EMOJI_ERROR,
  recommended: '✅',
  strict: '🔒',
  style: EMOJI_STYLE,
  stylistic: EMOJI_STYLE,
  ts: EMOJI_TYPESCRIPT,
  type: EMOJI_TYPESCRIPT,
  typed: EMOJI_TYPESCRIPT,
  types: EMOJI_TYPESCRIPT,
  typescript: EMOJI_TYPESCRIPT,
  warning: EMOJI_WARNING,
  warnings: EMOJI_WARNING,
};

//  General configs.
export const EMOJI_CONFIG_ERROR = '💼';
export const EMOJI_CONFIG_WARN = '⚠️';
export const EMOJI_CONFIG_OFF = '🚫';
export const EMOJI_CONFIG_FROM_SEVERITY: {
  [key in SEVERITY_TYPE]: string;
} = {
  [SEVERITY_TYPE.error]: EMOJI_CONFIG_ERROR,
  [SEVERITY_TYPE.warn]: EMOJI_CONFIG_WARN,
  [SEVERITY_TYPE.off]: EMOJI_CONFIG_OFF,
};

// Fixers.
export const EMOJI_FIXABLE = '🔧';
export const EMOJI_HAS_SUGGESTIONS = '💡';

// Options.
export const EMOJI_OPTIONS = '⚙️';

// TypeScript.
export const EMOJI_REQUIRES_TYPE_CHECKING = '💭';

// Type.
export const EMOJI_TYPE = '🗂️';
// Also see EMOJIS_TYPE defined in rule-type.ts.

// Deprecated.
export const EMOJI_DEPRECATED = '❌';

export const RESERVED_EMOJIS = [
  ...Object.values(EMOJI_CONFIG_FROM_SEVERITY),
  ...Object.values(EMOJIS_TYPE),

  EMOJI_FIXABLE,
  EMOJI_HAS_SUGGESTIONS,
  EMOJI_OPTIONS,
  EMOJI_REQUIRES_TYPE_CHECKING,
  EMOJI_TYPE,
  EMOJI_DEPRECATED,
];
