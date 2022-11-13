import { join, resolve, extname, basename, dirname } from 'node:path';
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

  // Check for the entry point on the `exports` or `main` field in package.json.
  let pluginEntryPoint;
  const exports = pluginPackageJson.exports;
  if (typeof exports === 'string') {
    pluginEntryPoint = exports;
  } else if (
    typeof exports === 'object' &&
    exports !== null &&
    !Array.isArray(exports)
  ) {
    // Check various properties on the `exports` object.
    // https://nodejs.org/api/packages.html#conditional-exports
    const propertiesToCheck: (keyof PackageJson.ExportConditions)[] = [
      '.',
      'node',
      'import',
      'require',
      'default',
    ];
    for (const prop of propertiesToCheck) {
      // @ts-expect-error -- The union type for the object is causing trouble.
      const value = exports[prop];
      if (typeof value === 'string') {
        pluginEntryPoint = value;
        break;
      }
    }
  } else if (typeof pluginPackageJson.main === 'string') {
    pluginEntryPoint = pluginPackageJson.main;
  }

  if (!pluginEntryPoint) {
    pluginEntryPoint = 'index.js'; // This is the default value for the `main` field: https://docs.npmjs.com/cli/v8/configuring-npm/package-json#main
  }

  if (pluginEntryPoint.endsWith('/')) {
    // The `main` field is allowed to specify a directory.
    pluginEntryPoint = `${pluginEntryPoint}/index.js`;
  }

  const SUPPORTED_FILE_TYPES = ['.js', '.cjs', '.mjs'];
  if (!SUPPORTED_FILE_TYPES.includes(extname(pluginEntryPoint))) {
    throw new Error(
      `Unsupported file type for plugin entry point. Current types supported: ${SUPPORTED_FILE_TYPES.join(
        ', '
      )}. Entry point detected: ${pluginEntryPoint}`
    );
  }

  const pluginEntryPointAbs = join(pluginRoot, pluginEntryPoint);
  if (!existsSync(pluginEntryPointAbs)) {
    throw new Error(
      `Could not find entry point for ESLint plugin. Tried: ${pluginEntryPoint}`
    );
  }

  const { default: plugin } = await importAbs(pluginEntryPointAbs);
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
export function getPathWithExactFileNameCasing(path: string) {
  const dir = dirname(path);
  const fileNameToSearch = basename(path);
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
