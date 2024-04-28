const os = require('node:os');
const sinon = require('sinon');

module.exports = function () {
  sinon.stub(os, 'EOL').value('\n'); // Stub os.EOL to always be '\n' for testing/snapshot purposes.
};
