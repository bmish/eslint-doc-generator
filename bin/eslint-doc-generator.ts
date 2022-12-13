#!/usr/bin/env node
/* eslint node/shebang:"off" -- shebang needed so compiled code gets interpreted as JS */

import { run } from '../lib/cli.js';
import { generate } from '../lib/generator.js';

// eslint-disable-next-line unicorn/prefer-top-level-await -- TODO: use top-level await once updating TypeScript target to ES2022 (when dropping Node 14 support).
run(process.argv, (path, options) => generate(path, options)).catch((error) => {
  if (error instanceof Error) {
    console.error(error.message);
  }
  process.exitCode = 1;
});
