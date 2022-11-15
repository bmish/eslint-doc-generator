#!/usr/bin/env node
/* eslint node/shebang:"off" -- shebang needed so compiled code gets interpreted as JS */

import { run } from '../lib/cli.js';
import { generate } from '../lib/generator.js';

try {
  run(process.argv, (path, options) => generate(path, options));
} catch (error) {
  if (error instanceof Error) {
    console.error(error.message);
  }
  process.exitCode = 1;
}
