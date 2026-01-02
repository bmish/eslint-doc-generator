export default {
  rules: {
    'no-foo': { meta: { deprecated: true, docs: { category: 'Apples' } }, create(context) {} },
    'no-bar': { meta: { deprecated: true, docs: { category: 'Bananas' } }, create(context) {} },
  },
};