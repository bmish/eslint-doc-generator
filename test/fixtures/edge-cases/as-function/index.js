export default {
  rules: {
    'no-foo': { meta: { deprecated: true, }, create(context) {} },
    'no-bar': { meta: { deprecated: false, }, create(context) {} },
    'no-baz': { meta: { deprecated: false, }, create(context) {} },
    'no-biz': { meta: { type: 'suggestion' }, create(context) {} },
  },
};