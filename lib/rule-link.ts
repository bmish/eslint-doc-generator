import { join, sep } from 'node:path';

export function replaceRulePlaceholder(pathOrUrl: string, ruleName: string) {
  return pathOrUrl.replace(/{name}/g, ruleName);
}

/**
 * 0 => "", 1 => "../", 2 => "../../", etc
 * @param level
 * @returns the relative path to go up the given number of directories
 */
export function goUpLevel(level: number): string {
  if (level === 0) {
    return '';
  }
  return `${join(...Array.from<string>({ length: level }).fill('..'))}/`;
}

/**
 * Account for how Windows paths use backslashes instead of the forward slashes that URLs require.
 */
export function pathToUrl(path: string): string {
  return path.split(sep).join('/');
}
