import {
  addTrailingPeriod,
  removeTrailingPeriod,
  toSentenceCase,
  getEndOfLine,
} from '../../lib/string.js';
import { EOL } from 'node:os';

describe('strings', function () {
  describe('#addTrailingPeriod', function () {
    it('handles when already has period', function () {
      expect(addTrailingPeriod('foo.')).toStrictEqual('foo.');
    });

    it('handles when does not have period', function () {
      expect(addTrailingPeriod('foo')).toStrictEqual('foo.');
    });
  });

  describe('#removeTrailingPeriod', function () {
    it('handles when already has period', function () {
      expect(removeTrailingPeriod('foo.')).toStrictEqual('foo');
    });

    it('handles when does not have period', function () {
      expect(removeTrailingPeriod('foo')).toStrictEqual('foo');
    });
  });

  describe('#toSentenceCase', function () {
    it('handles when lowercase first letter', function () {
      expect(toSentenceCase('hello world')).toStrictEqual('Hello world');
    });

    it('handles when uppercase first letter', function () {
      expect(toSentenceCase('Hello World')).toStrictEqual('Hello World');
    });
  });

  describe('#getEndOfLine', function () {
    it('handles when .editorconfig is not available and fallbacks to `EOL` from `node:os`', function () {
      expect(getEndOfLine()).toStrictEqual(EOL);
    });
  });
});
