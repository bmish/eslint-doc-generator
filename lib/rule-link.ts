import { countOccurrencesInString } from './string.js';
import { join, sep, relative } from 'node:path';
import { Plugin, RULE_SOURCE } from './types.js';

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
  ruleSource: RULE_SOURCE,
  pluginPrefix: string,
  pathPlugin: string,
  pathRuleDoc: string,
  urlCurrentPage: string,
  urlRuleDoc?: string
) {
  switch (ruleSource) {
    case RULE_SOURCE.eslintCore:
      return `https://eslint.org/docs/latest/rules/${ruleName}`;
    case RULE_SOURCE.thirdPartyPlugin:
      // We don't know the documentation URL to third-party plugins.
      return undefined; // eslint-disable-line unicorn/no-useless-undefined
    default:
      // Fallthrough to remaining logic in function.
      break;
  }

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
  plugin: Plugin,
  pluginPrefix: string,
  pathPlugin: string,
  pathRuleDoc: string,
  urlCurrentPage: string,
  includeBackticks: boolean,
  includePrefix: boolean,
  urlRuleDoc?: string
) {
  const ruleNameWithoutPluginPrefix = ruleName.startsWith(`${pluginPrefix}/`)
    ? ruleName.slice(pluginPrefix.length + 1)
    : ruleName;

  // Determine what plugin this rule comes from.
  let ruleSource: RULE_SOURCE;
  if (plugin.rules?.[ruleNameWithoutPluginPrefix]) {
    ruleSource = RULE_SOURCE.self;
  } else if (ruleName.includes('/')) {
    // Assume a slash is for the plugin prefix (ESLint core doesn't have any nested rules).
    ruleSource = RULE_SOURCE.thirdPartyPlugin;
  } else {
    ruleSource = RULE_SOURCE.eslintCore;
  }

  const ruleNameWithPluginPrefix = ruleName.startsWith(`${pluginPrefix}/`)
    ? ruleName
    : ruleSource === RULE_SOURCE.self
    ? `${pluginPrefix}/${ruleName}`
    : undefined;

  const urlToRule = getUrlToRule(
    ruleName,
    ruleSource,
    pluginPrefix,
    pathPlugin,
    pathRuleDoc,
    urlCurrentPage,
    urlRuleDoc
  );

  const ruleNameToDisplay = `${includeBackticks ? '`' : ''}${
    includePrefix && ruleNameWithPluginPrefix
      ? ruleNameWithPluginPrefix
      : ruleNameWithoutPluginPrefix
  }${includeBackticks ? '`' : ''}`;

  return urlToRule ? `[${ruleNameToDisplay}](${urlToRule})` : ruleNameToDisplay;
}
