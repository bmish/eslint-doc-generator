import { countOccurrencesInString } from './string.js';
import { join, sep, relative } from 'node:path';

export function replaceRulePlaceholder(pathOrUrl: string, ruleName: string) {
  return pathOrUrl.replace(/\{name\}/gu, ruleName);
}

/**
 * 0 => "", 1 => "../", 2 => "../../", etc
 * @param level
 * @returns the relative path to go up the given number of directories
 */
function goUpLevel(level: number): string {
  if (level === 0) {
    return '';
  }
  return `${join(...Array.from<string>({ length: level }).fill('..'))}/`;
}

/**
 * Account for how Windows paths use backslashes instead of the forward slashes that URLs require.
 */
function pathToUrl(path: string): string {
  return path.split(sep).join('/');
}

/**
 * Get the link to a rule's documentation page.
 * Will be relative to the current page.
 */
export function getUrlToRule(
  ruleName: string,
  pluginPrefix: string,
  pathPlugin: string,
  pathRuleDoc: string,
  urlCurrentPage: string,
  urlRuleDoc?: string
) {
  const nestingDepthOfCurrentPage = countOccurrencesInString(
    relative(pathPlugin, urlCurrentPage),
    sep
  );
  const relativePathPluginRoot = goUpLevel(nestingDepthOfCurrentPage);

  // Ignore plugin prefix if it's included in rule name.
  // While we could display the prefix if we wanted, it definitely cannot be part of the link.
  const ruleNameWithoutPluginPrefix = ruleName.startsWith(`${pluginPrefix}/`)
    ? ruleName.slice(pluginPrefix.length + 1)
    : ruleName;

  return urlRuleDoc
    ? replaceRulePlaceholder(urlRuleDoc, ruleNameWithoutPluginPrefix)
    : pathToUrl(
        join(
          relativePathPluginRoot,
          replaceRulePlaceholder(pathRuleDoc, ruleNameWithoutPluginPrefix)
        )
      );
}

/**
 * Get the markdown link (title and URL) to the rule's documentation.
 */
export function getLinkToRule(
  ruleName: string,
  pluginPrefix: string,
  pathPlugin: string,
  pathRuleDoc: string,
  urlCurrentPage: string,
  includeBackticks: boolean,
  includePrefix: boolean,
  urlRuleDoc?: string
) {
  const ruleNameWithPluginPrefix = ruleName.startsWith(`${pluginPrefix}/`)
    ? ruleName
    : `${pluginPrefix}/${ruleName}`;
  const ruleNameWithoutPluginPrefix = ruleName.startsWith(`${pluginPrefix}/`)
    ? ruleName.slice(pluginPrefix.length + 1)
    : ruleName;
  const urlToRule = getUrlToRule(
    ruleName,
    pluginPrefix,
    pathPlugin,
    pathRuleDoc,
    urlCurrentPage,
    urlRuleDoc
  );
  return `[${includeBackticks ? '`' : ''}${
    includePrefix ? ruleNameWithPluginPrefix : ruleNameWithoutPluginPrefix
  }${includeBackticks ? '`' : ''}](${urlToRule})`;
}
