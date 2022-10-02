import { outdent } from 'outdent';
import { findSectionHeader } from '../../lib/markdown.js';

describe('markdown', function () {
  describe('#findSectionHeader', function () {
    it('handles standard section title', function () {
      expect(findSectionHeader('## Rules\n', 'rules')).toBe('## Rules\n');
    });

    it('handles section title with leading emoji', function () {
      expect(findSectionHeader('## 🍟 Rules\n', 'rules')).toBe('## 🍟 Rules\n');
    });

    it('handles sentential section title', function () {
      expect(findSectionHeader('## List of supported rules\n', 'rules')).toBe(
        '## List of supported rules\n'
      );
    });

    it('handles doc with multiple sections', function () {
      expect(
        findSectionHeader(
          outdent`
            # eslint-plugin-test
            Description.
            ## Rules
            Rules.
            ## Other section
            Foo.
          `,
          'rules'
        )
      ).toBe('## Rules\n');
    });

    it('handles doc with multiple rules-related sections', function () {
      expect(
        findSectionHeader(
          outdent`
            # eslint-plugin-test
            Description.
            ## Rules with foo
            Rules with foo.
            ## Rules
            Rules.
            ## More specific section about rules
            Foo.
          `,
          'rules'
        )
      ).toBe('## Rules\n');
    });
  });
});
