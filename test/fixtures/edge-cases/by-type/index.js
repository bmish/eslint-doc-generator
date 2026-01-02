export default {
  rules: {
    'no-foo': { meta: { type: 'problem' }, create(context) {} },
    'no-bar': { meta: { type: 'suggestion' }, create(context) {} },
    'no-baz': { meta: { type: 'suggestion' }, create(context) {} },
    'no-biz': { meta: { /* no type */ }, create(context) {} },
  },
};