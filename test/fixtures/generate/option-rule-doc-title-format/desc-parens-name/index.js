export default {
  rules: {
    'no-foo': { meta: { docs: { description: 'Description for no-foo.'} }, create(context) {} },
    'no-bar': { meta: { docs: { /* one rule without description */ } }, create(context) {} },
  },
};