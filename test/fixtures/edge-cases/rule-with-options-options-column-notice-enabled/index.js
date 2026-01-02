export default {
  rules: {
    'no-foo': { meta: { schema: [{foo:true}] }, create(context) {} },
    'no-bar': { meta: { schema: {foo:true} }, create(context) {} },
    'no-biz': { meta: { schema: [] }, create(context) {} },
    'no-baz': { meta: {  }, create(context) {} },
  },
};