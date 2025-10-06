import { getEndOfLine } from '../../../lib/eol.js';
import { EOL } from 'node:os';

describe('getEndOfLine', function () {
  it('handles when .editorconfig is not available and fallbacks to `EOL` from `node:os`', async function () {
    expect(await getEndOfLine()).toStrictEqual(EOL);
  });
});
