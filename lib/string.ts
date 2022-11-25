import camelCase from 'camelcase';

export function countOccurrencesInString(str: string, substring: string) {
  return str.split(substring).length - 1;
}

export function toSentenceCase(str: string) {
  return str.replace(/^\w/u, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase();
  });
}

export function removeTrailingPeriod(str: string) {
  return str.replace(/\.$/u, '');
}

/**
 * Example: theWeatherIsNice => The Weather Is Nice
 */
export function camelCaseStringToTitle(str: string) {
  const text = str.replace(/([A-Z])/gu, ' $1');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function isCamelCase(str: string) {
  return camelCase(str) === str;
}
