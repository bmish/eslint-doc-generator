import { run } from '../lib/cli.js';

try {
  run();
} catch (error) {
  if (error instanceof Error) {
    console.error(error.message);
  }
  process.exitCode = 1;
}
