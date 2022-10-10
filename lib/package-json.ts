import { join, resolve } from 'node:path';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { importAbs } from './import.js';
import type { Plugin } from './types.js';
import type { PackageJson } from 'type-fest';

export function getPluginRoot(path: string) {
  return join(process.cwd(), path);
}

function loadPackageJson(path: string): PackageJson {
  const pluginRoot = getPluginRoot(path);
  const pluginPackageJsonPath = join(pluginRoot, 'package.json');
  if (!existsSync(pluginPackageJsonPath)) {
    throw new Error('Could not find package.json of ESLint plugin.');
  }
  const pluginPackageJson: PackageJson = JSON.parse(
    readFileSync(join(pluginRoot, 'package.json'), 'utf8')
  );

  return pluginPackageJson;
}

export async function loadPlugin(path: string): Promise<Plugin> {
  const pluginRoot = getPluginRoot(path);
  const pluginPackageJson = loadPackageJson(path);
  const pluginEntryPoint = join(
    pluginRoot,
    pluginPackageJson.main ?? 'index.js', // This is NPM's default value for this field.
    pluginPackageJson.main?.endsWith('/') ? 'index.js' : ''
  );
  const { default: plugin } = await importAbs(pluginEntryPoint);
  return plugin;
}

export function getPluginPrefix(path: string): string {
  const pluginPackageJson = loadPackageJson(path);
  if (!pluginPackageJson.name) {
    throw new Error(
      "Could not find `name` field in ESLint plugin's package.json."
    );
  }
  return pluginPackageJson.name.endsWith('/eslint-plugin')
    ? pluginPackageJson.name.split('/')[0] // Scoped plugin name like @my-scope/eslint-plugin.
    : pluginPackageJson.name.replace('eslint-plugin-', ''); // Unscoped name like eslint-plugin-foo.
}

/**
 * Resolve the path to a file but with the exact filename-casing present on disk.
 */
export function getPathWithExactFileNameCasing(
  dir: string,
  fileNameToSearch: string
) {
  const filenames = readdirSync(dir, { withFileTypes: true });
  for (const dirent of filenames) {
    if (
      dirent.isFile() &&
      dirent.name.toLowerCase() === fileNameToSearch.toLowerCase()
    ) {
      return resolve(dir, dirent.name);
    }
  }
  return undefined; // eslint-disable-line unicorn/no-useless-undefined
}
