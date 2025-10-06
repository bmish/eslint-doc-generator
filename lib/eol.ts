import * as prettier from 'prettier';
import { EOL } from 'node:os';
import editorconfig from 'editorconfig';

/**
 * Gets the end of line string while respecting the `.editorconfig` and
 * Prettier config and falling back to `EOL` from `node:os`.
 */
export async function getEndOfLine(): Promise<string> {
  return (
    getEndOfLineFromEditorConfig() ??
    (await getEndOfLineFromPrettierConfig()) ??
    EOL
  );
}

function getEndOfLineFromEditorConfig(): 'lf' | 'crlf' | undefined {
  // The passed `markdown.md` argument is used as an example of a Markdown file
  // in the plugin root folder in order to check for any specific Markdown
  // configurations.
  const editorConfigProps = editorconfig.parseSync('markdown.md');

  if (editorConfigProps.end_of_line === 'lf') {
    return 'lf';
  }

  if (editorConfigProps.end_of_line === 'crlf') {
    return 'crlf';
  }

  return undefined;
}

async function getEndOfLineFromPrettierConfig(): Promise<
  'lf' | 'crlf' | undefined
> {
  // The passed `markdown.md` argument is used as an example of a Markdown file
  // in the plugin root folder in order to check for any specific Markdown
  // configurations.
  const prettierOptions = await prettier.resolveConfig('markdown.md');

  if (prettierOptions === null) {
    return undefined;
  }

  if (prettierOptions.endOfLine === 'lf') {
    return 'lf';
  }

  if (prettierOptions.endOfLine === 'crlf') {
    return 'crlf';
  }

  return undefined;
}
