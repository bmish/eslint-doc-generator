import {
  parseConfigEmojiOptions,
  parseRuleListColumnsOption,
  parseRuleDocNoticesOption,
} from '../../lib/option-parsers.js';
import type { Plugin } from '../../lib/types.js';

describe('option-parsers', function () {
  describe('parseConfigEmojiOptions', function () {
    it('handles undefined configEmoji and returns default emojis', function () {
      const plugin: Plugin = {
        rules: {},
        configs: {
          recommended: { rules: {} },
          all: { rules: {} },
        },
      };

      const result = parseConfigEmojiOptions(plugin, undefined);

      // Should return default emojis for recognized configs.
      expect(result).toContainEqual({ config: 'recommended', emoji: '✅' });
      expect(result).toContainEqual({ config: 'all', emoji: '🌐' });
    });
  });

  describe('parseRuleListColumnsOption', function () {
    it('handles undefined input', function () {
      const result = parseRuleListColumnsOption(undefined);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('parseRuleDocNoticesOption', function () {
    it('handles undefined input', function () {
      const result = parseRuleDocNoticesOption(undefined);
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
