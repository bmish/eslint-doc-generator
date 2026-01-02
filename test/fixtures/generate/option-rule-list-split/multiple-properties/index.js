export default {
  rules: {
    'no-foo': { meta: { deprecated: false, docs: { category: 'Hello' } }, create(context) {} },
    'no-bar': { meta: { deprecated: true, docs: { category: 'Should Not Show Since Deprecated' } }, create(context) {} },
    'no-baz': { meta: { deprecated: true, docs: { category: 'Should Not Show Since Deprecated' } }, create(context) {} },
    'no-biz': { meta: { deprecated: false, docs: { category: 'World' } }, create(context) {} },
  },
};