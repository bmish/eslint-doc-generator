import { EOL as NodeEOL } from 'node:os';
import editorconfig from 'editorconfig';

/**
 * The cached result of the `getEndOfLine` function. Unfortunately, this cannot
 * be used everywhere in the codebase since in tests, the file system can
 * change after this constant is initialized.
 */
export const EOL = getEndOfLine();

export function toSentenceCase(str: string) {
  return str.replace(/^\w/u, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase();
  });
}

export function removeTrailingPeriod(str: string) {
  return str.replace(/\.$/u, '');
}

export function addTrailingPeriod(str: string) {
  return str.replace(/\.?$/u, '.');
}

/**
 * Example: FOO => Foo, foo => Foo
 */
export function capitalizeOnlyFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function sanitizeMarkdownTableCell(text: string): string {
  return text
    .replaceAll('|', String.raw`\|`)
    .replaceAll(new RegExp(EOL, 'gu'), '<br/>');
}

export function sanitizeMarkdownTable(
  text: readonly (readonly string[])[],
): readonly (readonly string[])[] {
  return text.map((row) => row.map((col) => sanitizeMarkdownTableCell(col)));
}

/**
 * Gets the end of line string while respecting the `.editorconfig` and falling
 * back to `EOL` from `node:os`.
 */
export function getEndOfLine() {
  // The passed `markdown.md` argument is used as an example of a markdown file
  // in the plugin root folder in order to check for any specific markdown
  // configurations.
  const editorconfigProps = editorconfig.parseSync('markdown.md');

  if (editorconfigProps.end_of_line === 'lf') {
    return '\n';
  }

  if (editorconfigProps.end_of_line === 'crlf') {
    return '\r\n';
  }

  return NodeEOL;
}
