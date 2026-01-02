export default {
  rules: {
    'no-foo': { meta: { HelloWorld: true }, create(context) {} },
    'no-bar': { meta: {  }, create(context) {} },
    'no-baz': { meta: { HelloWorld: false }, create(context) {} },
  },
};