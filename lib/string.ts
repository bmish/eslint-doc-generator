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

export function addTrailingPeriod(str: string) {
  return str.replace(/\.?$/u, '.');
}

/**
 * Example: FOO => Foo, foo => Foo
 */
export function capitalizeOnlyFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
