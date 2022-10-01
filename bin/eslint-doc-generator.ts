#!/usr/bin/env node
/* eslint node/shebang:"off" -- shebang needed so compiled code gets interpreted as JS */

import { run } from '../lib/cli.js';

try {
  run();
} catch (error) {
  if (error instanceof Error) {
    console.error(error.message);
  }
  process.exitCode = 1;
}
