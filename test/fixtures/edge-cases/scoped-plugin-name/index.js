export default {
  rules: {
    'no-foo': {
      meta: { docs: { description: 'disallow foo.' }, },
      create(context) {}
    },
  },
  configs: {
    'recommended': { rules: { '@my-scope/no-foo': 'error', } }
  }
};