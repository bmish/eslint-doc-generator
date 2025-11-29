import { getEndOfLine } from './eol.js';

/**
 * Context about the current invocation of the program, like what end-of-line
 * character to use.
 */
export interface Context {
  endOfLine: string;
  path: string;
}

export async function getContext(path: string): Promise<Context> {
  return {
    endOfLine: await getEndOfLine(),
    path,
  };
}
