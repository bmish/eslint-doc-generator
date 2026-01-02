export default {
  rules: {
    'no-foo': { meta: { docs: { description: 'Description for no-foo.'} }, create(context) {} },
    'no-bar': { meta: { docs: {} }, create(context) {} }, // No description.
  },
};