import { getEndOfLine } from '../../../lib/string.js';
import mockFs from 'mock-fs';
import { jest } from '@jest/globals';

describe('string (getEndOfLine)', function () {
  describe('returns the correct end of line when .editorconfig exists', function () {
    afterEach(function () {
      mockFs.restore();
      jest.resetModules();
    });

    it('returns lf end of line when .editorconfig is configured with lf', function () {
      mockFs({
        '.editorconfig': `
                  root = true
      
                  [*]
                  end_of_line = lf`,
      });

      expect(getEndOfLine()).toStrictEqual('\n');
    });

    it('returns crlf end of line when .editorconfig is configured with crlf', function () {
      mockFs({
        '.editorconfig': `
                root = true
    
                [*]
                end_of_line = crlf`,
      });

      expect(getEndOfLine()).toStrictEqual('\r\n');
    });

    it('respects the .md specific end of line settings when .editorconfig is configured', function () {
      mockFs({
        '.editorconfig': `
                  root = true
      
                  [*]
                  end_of_line = lf
                  
                  [*.md]
                  end_of_line = crlf`,
      });

      expect(getEndOfLine()).toStrictEqual('\r\n');
    });
  });
});
