export default {
  rules: {
    'no-foo': {
      meta: {
        docs: { description: 'Description.' },
        deprecated: true,
        replacedBy: ['no-bar'],
      },
      create(context) {}
    },
    'no-bar': {
      meta: {
        docs: { description: 'Description.' },
        deprecated: true,
      },
      create(context) {}
    },
    'no-baz': {
      meta: {
        docs: { description: 'Description.' },
        deprecated: true,
        replacedBy: [],
      },
      create(context) {}
    },
    'no-biz': {
      meta: {
        docs: { description: 'Description.' },
      },
      create(context) {}
    },
    'no-boz': {
      meta: {
        docs: { description: 'Description.' },
        deprecated: true,
        replacedBy: ['no-baz', 'no-biz'],
      },
      create(context) {}
    },
  },
  configs: {}
};