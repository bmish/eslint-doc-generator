import { vi } from 'vitest';

// Stub os.EOL to always be '\n' for testing/snapshot purposes.
vi.mock('node:os', async (importOriginal) => {
  const original = await importOriginal<typeof import('node:os')>();
  return {
    ...original,
    EOL: '\n',
  };
});
