#!/usr/bin/env node
/* eslint n/hashbang:"off" -- shebang needed so compiled code gets interpreted as JS */
//
// rule was renamed in https://github.com/eslint-community/eslint-plugin-n/releases/tag/v17.0.0
// from n/shebang to n/hashbang

import { run } from '../lib/cli.js';
import { generate } from '../lib/generator.js';

// eslint-disable-next-line unicorn/prefer-top-level-await -- TODO: use top-level await once updating TypeScript target to ES2022 (when dropping Node 14 support).
run(process.argv, (path, options) => generate(path, options)).catch((error) => {
  if (error instanceof Error) {
    console.error(error.message);
  }
  process.exitCode = 1;
});
