import { EOL } from 'node:os';
import editorconfig from 'editorconfig';

/**
 * Context about the current invocation of the program, like what end-of-line
 * character to use.
 */
export interface Context {
  endOfLine: string;
}

export function getContext(): Context {
  return {
    endOfLine: getEndOfLine(),
  };
}

/**
 * Gets the end of line string while respecting the `.editorconfig` and falling
 * back to `EOL` from `node:os`.
 */
export function getEndOfLine() {
  // The passed `markdown.md` argument is used as an example of a markdown file
  // in the plugin root folder in order to check for any specific markdown
  // configurations.
  const config = editorconfig.parseSync('markdown.md');

  if (config.end_of_line === 'lf') {
    return '\n';
  }

  if (config.end_of_line === 'crlf') {
    return '\r\n';
  }

  return EOL;
}
