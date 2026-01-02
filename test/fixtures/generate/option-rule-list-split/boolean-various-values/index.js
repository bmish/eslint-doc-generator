export default {
  rules: {
    'noOn': { meta: { foo: 'on' }, create(context) {} },
    'noYes': { meta: { foo: 'yes' }, create(context) {} },
    'noTrueString': { meta: { foo: 'true' }, create(context) {} },
    'noTrue': { meta: { foo: true }, create(context) {} },
    'no': { meta: {  }, create(context) {} },
    'noUndefined': { meta: { foo: undefined }, create(context) {} },
    'noOff': { meta: { foo: 'off' }, create(context) {} },
    'noNo': { meta: { foo: 'no' }, create(context) {} },
    'noFalseString': { meta: { foo: 'false' }, create(context) {} },
    'noFalse': { meta: { foo: false }, create(context) {} },
    'noNull': { meta: { foo: null }, create(context) {} },
    'noEmptyString': { meta: { foo: '' }, create(context) {} },
  },
};