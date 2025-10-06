import { getEndOfLine } from '../../../lib/eol.js';
import { EOL } from 'node:os';

describe('getEndOfLine', function () {
  it('handles when .editorconfig is not available and fallbacks to `EOL` from `node:os`', function () {
    expect(getEndOfLine()).toStrictEqual(EOL);
  });
});
