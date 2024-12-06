import os from 'node:os';
import sinon from 'sinon';

export default function () {
  sinon.stub(os, 'EOL').value('\n'); // Stub os.EOL to always be '\n' for testing/snapshot purposes.
}
