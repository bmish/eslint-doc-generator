export default {
  rules: {
    'no-foo': { meta: { hasSuggestions: true }, create(context) {} },
    'no-bar': { meta: {  }, create(context) {} },
    'no-baz': { meta: { hasSuggestions: false }, create(context) {} },
  },
};