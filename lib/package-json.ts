import {
  join,
  resolve,
  basename,
  dirname,
  isAbsolute,
  extname,
} from 'node:path';
import { existsSync } from 'node:fs';
import { importAbs } from './import.js';
import { createRequire } from 'node:module';
import type { Plugin } from './types.js';
import type { PackageJson } from 'type-fest';
import { readdir, readFile } from 'node:fs/promises';

const require = createRequire(import.meta.url);

export function getPluginRoot(path: string) {
  return isAbsolute(path) ? path : join(process.cwd(), path);
}

async function loadPackageJson(path: string): Promise<PackageJson> {
  const pluginRoot = getPluginRoot(path);
  const pluginPackageJsonPath = join(pluginRoot, 'package.json');
  if (!existsSync(pluginPackageJsonPath)) {
    throw new Error('Could not find package.json of ESLint plugin.');
  }
  const pluginPackageJson = JSON.parse(
    await readFile(join(pluginRoot, 'package.json'), 'utf8')
  ) as PackageJson;

  return pluginPackageJson;
}

export async function loadPlugin(path: string): Promise<Plugin> {
  const pluginRoot = getPluginRoot(path);
  try {
    // Try require first which should work for CJS plugins.
    return require(pluginRoot) as Plugin; // eslint-disable-line import/no-dynamic-require
  } catch (error) {
    // Otherwise, for ESM plugins, we'll have to try to resolve the exact plugin entry point and import it.
    const pluginPackageJson = await loadPackageJson(path);
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
      const propertiesToCheck: readonly (keyof PackageJson.ExportConditions)[] =
        ['.', 'node', 'import', 'require', 'default'];
      for (const prop of propertiesToCheck) {
        const value = exports[prop];
        if (typeof value === 'string') {
          pluginEntryPoint = value;
          break;
        }
      }
    }

    // If the ESM export doesn't exist, fall back to throwing the CJS error
    // (if the ESM export does exist, we'll validate it next)
    if (!pluginEntryPoint) {
      throw error;
    }

    const pluginEntryPointAbs = join(pluginRoot, pluginEntryPoint);
    if (!existsSync(pluginEntryPointAbs)) {
      throw new Error(
        `ESLint plugin entry point does not exist. Tried: ${pluginEntryPoint}`
      );
    }

    if (extname(pluginEntryPointAbs) === '.json') {
      // For JSON files, have to require() instead of import(..., { assert: { type: 'json' } }) because of this error:
      // Dynamic imports only support a second argument when the '--module' option is set to 'esnext', 'node16', or 'nodenext'. ts(1324)
      // TODO: Switch to import() when we drop support for Node 14.
      return require(pluginEntryPointAbs) as Plugin; // eslint-disable-line import/no-dynamic-require
    }

    const { default: plugin } = (await importAbs(pluginEntryPointAbs)) as {
      default: Plugin;
    };
    return plugin;
  }
}

export async function getPluginPrefix(path: string): Promise<string> {
  const pluginPackageJson = await loadPackageJson(path);
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
export async function getPathWithExactFileNameCasing(path: string) {
  const dir = dirname(path);
  const fileNameToSearch = basename(path);
  const filenames = await readdir(dir, { withFileTypes: true });
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

export async function getCurrentPackageVersion(): Promise<string> {
  // When running as compiled code, use path relative to compiled version of this file in the dist folder.
  // When running as TypeScript (in a test), use path relative to this file.
  const pathToPackageJson = import.meta.url.endsWith('.ts')
    ? '../package.json'
    : /* istanbul ignore next -- can't test the compiled version in test */
      '../../package.json';
  const packageJson = JSON.parse(
    await readFile(new URL(pathToPackageJson, import.meta.url), 'utf8')
  ) as PackageJson;
  if (!packageJson.version) {
    throw new Error('Could not find package.json `version`.');
  }
  return packageJson.version;
}
