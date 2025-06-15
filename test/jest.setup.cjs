const os = require('node:os'); // eslint-disable-line @typescript-eslint/no-require-imports, no-undef
const sinon = require('sinon'); // eslint-disable-line @typescript-eslint/no-require-imports, no-undef

// eslint-disable-next-line no-undef
module.exports = function () {
  jest.spyOn(console, 'warn').mockImplementation(() => {}); // Disabled to hide warnings related to `DeprecatedInfo`
  sinon.stub(os, 'EOL').value('\n'); // Stub os.EOL to always be '\n' for testing/snapshot purposes.
};
