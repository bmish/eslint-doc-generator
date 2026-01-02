export default {
  rules: {
    'no-foo': { meta: { foo: 'c' }, create(context) {} },
    'no-bar': { meta: { foo: 'a' }, create(context) {} },
    'no-baz': { meta: { foo: 'B' }, create(context) {} },
  },
};