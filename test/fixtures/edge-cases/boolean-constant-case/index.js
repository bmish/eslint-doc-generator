export default {
  rules: {
    'no-foo': { meta: { HELLO_WORLD: true }, create(context) {} },
    'no-bar': { meta: {  }, create(context) {} },
    'no-baz': { meta: { HELLO_WORLD: false }, create(context) {} },
  },
};