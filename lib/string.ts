export function countOccurrencesInString(str: string, substring: string) {
  return str.split(substring).length - 1;
}
