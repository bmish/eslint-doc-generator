import { EOL } from 'node:os';
import editorconfig from 'editorconfig';

export async function getEndOfLine(): Promise<'\n' | '\r\n'> {
  return (
    (await getEndOfLineFromEditorConfig()) ??
    (await getEndOfLineFromPrettierConfig()) ??
    getNodeEOL()
  );
}

async function getEndOfLineFromEditorConfig(): Promise<
  '\n' | '\r\n' | undefined
> {
  // The passed `markdown.md` argument is used as an example of a Markdown file
  // in the plugin root folder in order to check for any specific Markdown
  // configurations.
  const editorConfigProps = await editorconfig.parse('markdown.md');

  if (editorConfigProps.end_of_line === 'lf') {
    return '\n';
  }

  if (editorConfigProps.end_of_line === 'crlf') {
    return '\r\n';
  }

  return undefined;
}

async function getEndOfLineFromPrettierConfig(): Promise<
  '\n' | '\r\n' | undefined
> {
  let prettier: typeof import('prettier') | undefined;
  try {
    prettier = await import('prettier');
  } catch {
    return undefined;
  }

  // The passed `markdown.md` argument is used as an example of a Markdown file
  // in the plugin root folder in order to check for any specific Markdown
  // configurations.
  const prettierOptions = await prettier.resolveConfig('markdown.md');

  if (prettierOptions === null) {
    return undefined;
  }

  if (prettierOptions.endOfLine === 'lf') {
    return '\n';
  }

  if (prettierOptions.endOfLine === 'crlf') {
    return '\r\n';
  }

  // Prettier defaults to "lf" if it is not explicitly specified in the config file:
  // https://prettier.io/docs/options#end-of-line
  return '\n';
}

/** `EOL` is typed as `string`, so we perform run-time validation to be safe. */
function getNodeEOL(): '\n' | '\r\n' {
  if (EOL === '\n' || EOL === '\r\n') {
    return EOL;
  }

  throw new Error(
    `Failed to detect the end-of-line constant from the JavaScript runtime: ${EOL}`,
  );
}
