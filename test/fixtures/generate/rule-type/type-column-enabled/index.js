export default {
  rules: {
    'no-foo': { meta: { type: 'problem' }, create(context) {} },
    'no-bar': { meta: { type: 'suggestion' }, create(context) {} },
    'no-biz': { meta: { type: 'layout' }, create(context) {} },
    'no-boz': { meta: { type: 'unknown' }, create(context) {} },
    'no-buz': { meta: { /* no type*/ }, create(context) {} },
  },
};

