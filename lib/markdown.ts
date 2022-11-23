// General helpers for dealing with markdown files / content.

/**
 * Replace the header of a doc up to and including the specified marker.
 * Insert at beginning if header doesn't exist.
 * @param markdown - doc content
 * @param newHeader - new header including marker
 * @param marker - marker to indicate end of header
 */
export function replaceOrCreateHeader(
  markdown: string,
  newHeader: string,
  marker: string
) {
  const lines = markdown.split('\n');

  const titleLineIndex = lines.findIndex((line) => line.startsWith('# '));
  const markerLineIndex = lines.indexOf(marker);
  const dashesLineIndex1 = lines.indexOf('---');
  const dashesLineIndex2 = lines.indexOf('---', dashesLineIndex1 + 1);

  // Any YAML front matter or anything else above the title should be kept as-is ahead of the new header.
  const preHeader = lines
    .slice(0, Math.max(titleLineIndex, dashesLineIndex2 + 1))
    .join('\n');

  // Anything after the marker comment, title, or YAML front matter should be kept as-is after the new header.
  const postHeader = lines
    .slice(
      Math.max(markerLineIndex + 1, titleLineIndex + 1, dashesLineIndex2 + 1)
    )
    .join('\n');

  return `${preHeader ? `${preHeader}\n` : ''}${newHeader}\n${postHeader}`;
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

export function findFinalHeaderLevel(str: string) {
  const lines = str.split('\n');
  const finalHeader = lines.reverse().find((line) => line.match('^(#+) .+$'));
  return finalHeader ? finalHeader.indexOf(' ') : undefined;
}
