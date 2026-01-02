export default {
  rules: {
    'c': { meta: { docs: {} }, create(context) {} },
    'a': { meta: { docs: {} }, create(context) {} },
    'B': { meta: { docs: {} }, create(context) {} },
  },
  configs: {
    'c': { rules: { 'test/a': 'error', } },
    'a': { rules: { 'test/a': 'error', } },
    'B': { rules: { 'test/a': 'error', } },
  }
};

