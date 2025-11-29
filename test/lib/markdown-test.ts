import { outdent } from 'outdent';
import { findSectionHeader } from '../../lib/markdown.js';
import { getContext } from '../../lib/context.js';

const cwd = process.cwd();

describe('markdown', function () {
  describe('#findSectionHeader', function () {
    it('handles standard section title', async function () {
      const context = await getContext(cwd);
      const title = '## Rules\n';
      expect(findSectionHeader(context, title, 'rules')).toBe(title);
    });

    it('handles section title with leading emoji', async function () {
      const context = await getContext(cwd);
      const title = '## 🍟 Rules\n';
      expect(findSectionHeader(context, title, 'rules')).toBe(title);
    });

    it('handles section title with html', async function () {
      const context = await getContext(cwd);
      const title = "## <a name='Rules'></a>Rules\n";
      expect(findSectionHeader(context, title, 'rules')).toBe(title);
    });

    it('handles sentential section title', async function () {
      const context = await getContext(cwd);
      const title = '## List of supported rules\n';
      expect(findSectionHeader(context, title, 'rules')).toBe(title);
    });

    it('handles doc with multiple sections', async function () {
      const context = await getContext(cwd);
      expect(
        findSectionHeader(
          context,
          outdent`
            # eslint-plugin-test
            Description.
            ## Rules
            Rules.
            ## Other section
            Foo.
          `,
          'rules',
        ),
      ).toBe('## Rules\n');
    });

    it('handles doc with multiple rules-related sections', async function () {
      const context = await getContext(cwd);
      expect(
        findSectionHeader(
          context,
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
          'rules',
        ),
      ).toBe('## Rules\n');
    });
  });
});
