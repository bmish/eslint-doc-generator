import { outdent } from 'outdent';
import { findRulesSectionHeader } from '../../lib/rule-list.js';

describe('rules list', function () {
  describe('#findRulesSectionHeader', function () {
    it('handles standard section title', function () {
      expect(findRulesSectionHeader('## Rules\n')).toBe('## Rules\n');
    });

    it('handles section title with leading emoji', function () {
      expect(findRulesSectionHeader('## 🍟 Rules\n')).toBe('## 🍟 Rules\n');
    });

    it('handles sentential section title', function () {
      expect(findRulesSectionHeader('## List of supported rules\n')).toBe(
        '## List of supported rules\n'
      );
    });

    it('handles doc with multiple sections', function () {
      expect(
        findRulesSectionHeader(outdent`
          # eslint-plugin-test
          Description.
          ## Rules
          Rules.
          ## Other section
          Foo.
        `)
      ).toBe('## Rules\n');
    });

    it('handles doc with multiple rules-related sections', function () {
      expect(
        findRulesSectionHeader(outdent`
          # eslint-plugin-test
          Description.
          ## Rules with foo
          Rules with foo.
          ## Rules
          Rules.
          ## More specific section about rules
          Foo.
        `)
      ).toBe('## Rules\n');
    });
  });
});
