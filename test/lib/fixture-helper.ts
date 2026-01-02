import { mkdtempSync, cpSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const FIXTURE_ROOT = join('test', 'fixtures');

/**
 * Get the path to a fixture directory.
 * @param segments - Path segments relative to test/fixtures
 * @returns Absolute path to the fixture directory
 */
export function getFixturePath(...segments: string[]): string {
  return join(FIXTURE_ROOT, ...segments);
}

/**
 * Copy a fixture directory to a temporary directory and return the temp path.
 * This ensures tests run in isolation and can modify files safely.
 * @param fixturePath - Path to the fixture directory to copy
 * @returns Path to the temporary directory containing the copied fixture
 */
export function setupFixture(fixturePath: string): string {
  const tempDir = mkdtempSync(join(tmpdir(), 'eslint-doc-gen-'));
  cpSync(fixturePath, tempDir, { recursive: true });
  return tempDir;
}

/**
 * Clean up a temporary fixture directory.
 * @param tempDir - Path to the temporary directory to remove
 */
export function cleanupFixture(tempDir: string): void {
  rmSync(tempDir, { recursive: true, force: true });
}
