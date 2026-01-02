export default {
  rules: {
    'no-foo': { 'type': 'foo', meta: { }, create(context) {} },
    'no-bar': { 'type': 'bar', meta: { }, create(context) {} },
  },
  configs: {
    recommended: { rules: { 'test/no-foo': 'error' } },
  }
};