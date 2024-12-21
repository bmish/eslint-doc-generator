import { boolean, isBooleanable } from '../../lib/boolean.js';

describe('boolean', function () {
  describe('#boolean', function () {
    it.each(['true', 't', 'yes', 'y', 'on', '1'])(
      'returns true when string is %s',
      function (value) {
        expect(boolean(value)).toBe(true);
      },
    );

    it('returns true when number is 1', function () {
      expect(boolean(1)).toBe(true);
    });

    it('returns true when boolean is true', function () {
      expect(boolean(true)).toBe(true);
    });

    it.each(['foo', 2, undefined])(
      'returns false when value is %p',
      function (value) {
        expect(boolean(value)).toBe(false);
      },
    );
  });

  describe('#isBooleanable', function () {
    it.each([
      'true',
      't',
      'yes',
      'y',
      'on',
      '1',
      'false',
      'f',
      'no',
      'n',
      'off',
      '0',
    ])('returns true when string is %s', function (value) {
      expect(isBooleanable(value)).toBe(true);
    });

    it.each([0, 1])('returns true when number is %i', function (value) {
      expect(isBooleanable(value)).toBe(true);
    });

    it.each([true, false])('returns when boolean is %s', function (value) {
      expect(isBooleanable(value)).toBe(true);
    });

    it.each(['foo', 2, undefined])(
      'returns false when value is %p',
      function (value) {
        expect(isBooleanable(value)).toBe(false);
      },
    );
  });
});
