export default {
  rules: {
    'no-foo': { meta: { docs: { description: 'Description of no-foo.' }, }, create(context) {} },
    'no-bar': { meta: { docs: { description: 'Description of no-bar.' }, }, create(context) {} },
    'no-baz': { meta: { docs: { description: 'Description of no-baz.' }, }, create(context) {} },
    'no-biz': { meta: { docs: { description: 'Description of no-biz.' }, }, create(context) {} },
    'no-boz': { meta: { docs: { description: 'Description of no-boz.' }, }, create(context) {} },
    'no-buz': { meta: { docs: { description: 'Description of no-buz.' }, }, create(context) {} },
    'no-bez': { meta: { docs: { description: 'Description of no-bez.' }, }, create(context) {} },
  },
  configs: {
    recommended: {
      rules: {
        'test/no-foo': 'off',
        'test/no-bar': 0,
        'test/no-baz': 'error',
        'test/no-boz': 'warn',
        'test/no-buz': 1,
      }
    },
    other: {
      rules: {
        'test/no-bar': 0,
        'test/no-baz': 'off',
        'test/no-biz': 'off',
        'test/no-buz': 'warn',
        'test/no-bez': 'warn',
      }
    },
  }
};