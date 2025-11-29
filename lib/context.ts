import { getEndOfLine } from './eol.js';
import { ResolvedGenerateOptions } from './types.js';

/**
 * Context about the current invocation of the program, like what end-of-line
 * character to use.
 */
export interface Context {
  endOfLine: string;
  path: string;
  options: ResolvedGenerateOptions;
}

export async function getContext(
  path: string,
  options: ResolvedGenerateOptions,
): Promise<Context> {
  return {
    endOfLine: await getEndOfLine(),
    path,
    options,
  };
}
