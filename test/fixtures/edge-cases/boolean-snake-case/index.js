export default {
  rules: {
    'no-foo': { meta: { hello_world: true }, create(context) {} },
    'no-bar': { meta: {  }, create(context) {} },
    'no-baz': { meta: { hello_world: false }, create(context) {} },
  },
};