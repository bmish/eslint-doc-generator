// General helpers for dealing with markdown files / content.

import prettier from 'prettier'; // eslint-disable-line node/no-extraneous-import -- prettier is included by eslint-plugin-square

export async function format(str: string, filePath: string): Promise<string> {
  const options = await prettier.resolveConfig(filePath);
  return prettier.format(str, {
    ...options,
    parser: 'markdown',
  });
}

/**
 * Replace the header of a doc up to and including the specified marker.
 * Insert at beginning if header doesn't exist.
 * @param markdown - doc content
 * @param newHeader - new header including marker
 * @param marker - marker to indicate end of header
 */
export async function replaceOrCreateHeader(
  markdown: string,
  newHeader: string,
  marker: string,
  pathToDoc: string
) {
  const lines = markdown.split('\n');

  const markerLineIndex = lines.indexOf(marker);

  if (markerLineIndex === -1 && lines.length > 0 && lines[0].startsWith('# ')) {
    // No marker present so delete any existing title before we add the new one.
    lines.splice(0, 1);
  }

  return (
    (await format(newHeader, pathToDoc)) +
    lines.slice(markerLineIndex + 1).join('\n')
  );
}

/**
 * Find the section most likely to be the top-level section for a given string.
 */
export function findSectionHeader(
  markdown: string,
  str: string
): string | undefined {
  // Get all the matching strings.
  const regexp = new RegExp(`## .*${str}.*\n`, 'gi');
  const sectionPotentialMatches = [...markdown.matchAll(regexp)].map(
    (match) => match[0]
  );

  if (sectionPotentialMatches.length === 0) {
    // No section found.
    return undefined;
  }

  if (sectionPotentialMatches.length === 1) {
    // If there's only one match, we can assume it's the section.
    return sectionPotentialMatches[0];
  }

  // Otherwise assume the shortest match is the correct one.
  return sectionPotentialMatches.sort(
    (a: string, b: string) => a.length - b.length
  )[0];
}
