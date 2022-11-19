import { join, resolve, basename, dirname, isAbsolute } from 'node:path';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { importAbs } from './import.js';
import { createRequire } from 'node:module';
import type { Plugin } from './types.js';
import type { PackageJson } from 'type-fest';

const require = createRequire(import.meta.url);

export function getPluginRoot(path: string) {
  return isAbsolute(path) ? path : join(process.cwd(), path);
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
  try {
    // Try require first which should work for CJS plugins.
    return require(pluginRoot); // eslint-disable-line import/no-dynamic-require
  } catch {
    // Otherwise, for ESM plugins, we'll have to try to resolve the exact plugin entry point and import it.
    const pluginPackageJson = loadPackageJson(path);
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
    }

    if (!pluginEntryPoint) {
      throw new Error('Unable to determine plugin entry point.');
    }

    const pluginEntryPointAbs = join(pluginRoot, pluginEntryPoint);
    if (!existsSync(pluginEntryPointAbs)) {
      throw new Error(
        `ESLint plugin entry point does not exist. Tried: ${pluginEntryPoint}`
      );
    }

    const { default: plugin } = await importAbs(pluginEntryPointAbs);
    return plugin;
  }
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
    : pluginPackageJson.name.replace('eslint-plugin-', ''); // Unscoped name like eslint-plugin-foo or scoped name like @my-scope/eslint-plugin-foo.
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
