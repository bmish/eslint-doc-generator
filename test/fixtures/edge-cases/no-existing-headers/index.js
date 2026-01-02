export default {
  rules: {
    'no-foo': { meta: { docs: { category: 'fruits' } }, create(context) {} },
    'no-bar': { meta: { docs: { category: 'candy' } }, create(context) {} },
    'no-baz': { meta: { /* no nested object */ }, create(context) {} },
  },
};