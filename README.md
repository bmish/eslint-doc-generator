# eslint-doc-generator

[![npm version][npm-image]][npm-url]

Automatic documentation generator for [ESLint](https://eslint.org/) plugins and rules.

Generates the following documentation based on ESLint and top [ESLint plugin](https://eslint.org/docs/latest/developer-guide/working-with-plugins) conventions:

- `README.md` rules table
- Rule doc titles and config/fixable/etc. notices

Also performs some basic section consistency checks on rule docs:

- Contains an `## Options` / `## Config` section and mentions each named option (for rules with options)

## Users

This tool is used by popular ESLint plugins like:

- [eslint-plugin-ava](https://github.com/avajs/eslint-plugin-ava#rules)
- [eslint-plugin-ember](https://github.com/ember-cli/eslint-plugin-ember#-rules)
- [eslint-plugin-eslint-plugin](https://github.com/eslint-community/eslint-plugin-eslint-plugin#rules)
- [eslint-plugin-import](https://github.com/import-js/eslint-plugin-import#rules)
- [eslint-plugin-jsx-a11y](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y#supported-rules)
- [eslint-plugin-promise](https://github.com/eslint-community/eslint-plugin-promise#rules)
- [eslint-plugin-qunit](https://github.com/platinumazure/eslint-plugin-qunit#rules)
- [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react#list-of-supported-rules)
- [eslint-plugin-unicorn](https://github.com/sindresorhus/eslint-plugin-unicorn#rules)

## Motivation

- Standardize documentation across thousands of ESLint plugins and rules
- Improve the discoverability of key rule information and thus rule usability
- Streamline the process of adding new rules by automating part of the documentation
- Eliminate the custom documentation scripts and tests previously built and maintained by many ESLint plugins

## Setup

Install it:

```sh
npm i --save-dev eslint-doc-generator
```

Add scripts to `package.json`:

- Both a lint script to ensure everything is up-to-date in CI and an update script for contributors to run locally
- Add any [config options](#configuration-options) in the `update:eslint-docs` script only
- Alternative scripts may be needed with [build tools](#build-tools) or [prettier](#prettier)

```json
{
  "scripts": {
    "lint": "npm-run-all \"lint:*\"",
    "lint:docs": "markdownlint \"**/*.md\"",
    "lint:eslint-docs": "npm-run-all \"update:eslint-docs -- --check\"",
    "lint:js": "eslint .",
    "update:eslint-docs": "eslint-doc-generator"
  }
}
```

Delete any old rules list from your `README.md`. A new one will be automatically added to your `## Rules` section (along with the following marker comments if they don't already exist):

```md
<!-- begin auto-generated rules list -->
<!-- end auto-generated rules list -->
```

Delete any old recommended/fixable/etc. notices from your rule docs. A new title and notices will be automatically added to the top of each rule doc (along with a marker comment if it doesn't exist yet).

```md
<!-- end auto-generated rule header -->
```

And be sure to enable the `recommended` rules from [eslint-plugin-eslint-plugin](https://github.com/eslint-community/eslint-plugin-eslint-plugin) as well as [eslint-plugin/require-meta-docs-description](https://github.com/eslint-community/eslint-plugin-eslint-plugin/blob/main/docs/rules/require-meta-docs-description.md) to ensure your rules have consistent descriptions for use in the generated docs.

## Usage

Run the script from `package.json` to start out or any time you add a rule or update rule metadata in your plugin:

```sh
npm run update:eslint-docs
```

## Example

For examples, see our [users](#users) or the in-house examples below. Note that the in-house examples intentionally show all possible columns and notices.

### Rules list table

See the generated rules table and legend in our example [`README.md`](./docs/examples/eslint-plugin-test/README.md#rules).

### Rule doc notices

See the generated rule doc title and notices in our example rule docs [`no-foo.md`](./docs/examples/eslint-plugin-test/docs/rules/no-foo.md), [`prefer-bar.md`](./docs/examples/eslint-plugin-test/docs/rules/prefer-bar.md), [`require-baz.md`](./docs/examples/eslint-plugin-test/docs/rules/require-baz.md).

## Badge

While config emojis are the recommended representations of configs that a rule belongs to (see [`--config-emoji`](#configuration-options)), you can alternatively define badges for configs at the bottom of your `README.md`.

Here's a badge for a custom `fun` config that displays in blue:

```md
[fun]: https://img.shields.io/badge/-fun-blue.svg
```

And how it looks:

![fun][]

[fun]: https://img.shields.io/badge/-fun-blue.svg

## Configuration options

These can be provided as CLI options or as [config file](#configuration-file) options.

| Name | Description |
| :-- | :-- |
| `--check` | Whether to check for and fail if there is a diff. No output will be written. Typically used during CI. |
| `--config-emoji` | Custom emoji to use for a config. Format is `config-name,emoji`. Default emojis are provided for [common configs](./lib/emojis.ts). To remove a default emoji and rely on a [badge](#badge) instead, provide the config name without an emoji. Option can be repeated. |
| `--ignore-config` | Config to ignore from being displayed. Often used for an `all` config. Option can be repeated. |
| `--ignore-deprecated-rules` | Whether to ignore deprecated rules from being checked, displayed, or updated (default: `false`). |
| `--path-rule-doc` | Path to markdown file for each rule doc. Use `{name}` placeholder for the rule name (default: `docs/rules/{name}.md`). |
| `--path-rule-list` | Path to markdown file with a rules section where the rules table list should live (default: `README.md`). |
| `--rule-doc-notices` | Ordered, comma-separated list of notices to display in rule doc. Non-applicable notices will be hidden. Choices: `configs`, `deprecated`, `fixable`, `fixableAndHasSuggestions`, `hasSuggestions`, `requiresTypeChecking`, `type` (off by default). A consolidated notice called `fixableAndHasSuggestions` automatically replaces `fixable` and `hasSuggestions` when applicable. Default: `deprecated,configs,fixable,fixableAndHasSuggestions,hasSuggestions,requiresTypeChecking`. |
| `--rule-doc-section-exclude` | Disallowed section in each rule doc. Exit with failure if present. Option can be repeated. |
| `--rule-doc-section-include` | Required section in each rule doc. Exit with failure if missing. Option can be repeated. |
| `--rule-doc-section-options` | Whether to require an "Options" or "Config" rule doc section and mention of any named options for rules with options (default: `true`). |
| `--rule-doc-title-format` | The format to use for rule doc titles. Defaults to `desc-parens-prefix-name`. See choices in below [table](#--rule-doc-title-format). |
| `--rule-list-columns` | Ordered, comma-separated list of columns to display in rule list. Empty columns will be hidden. Choices: `configsError`, `configsOff`, `configsWarn`, `deprecated`, `description`, `fixable`, `fixableAndHasSuggestions` (off by default), `hasSuggestions`, `name`, `requiresTypeChecking`, `type` (off by default). Default: `name,description,configsError,configsWarn,configsOff,fixable,hasSuggestions,requiresTypeChecking,deprecated`. |
| `--split-by` | Rule property to split the rules list by. A separate list and header will be created for each value. Example: `meta.type`. |
| `--url-configs` | Link to documentation about the ESLint configurations exported by the plugin. |

All options are optional.

### `--rule-doc-title-format`

Where `no-foo` is the rule name, `Disallow use of foo` is the rule description, and `eslint-plugin-test` is the plugin name.

| Value | Example |
| :-- | :-- |
| `desc` | `# Disallow use of foo` |
| `desc-parens-name` | `# Disallow use of foo (no-foo)` |
| `desc-parens-prefix-name` (default) | `# Disallow use of foo (test/no-foo)` |
| `name` | `# no-foo` |
`prefix-name` | `# test/no-foo` |

### Configuration file

There are a few ways to create a config file:

- An object exported by `.eslint-doc-generatorrc.js`, `.eslint-doc-generatorrc.json`, or any other config file format/name supported by [cosmiconfig](https://github.com/davidtheclark/cosmiconfig#searchplaces)
- An object under the `eslint-doc-generator` key in `package.json`

Config files support all the [CLI options](#configuration-options) but in camelCase. CLI options take precedence over config file options.

Example:

```js
// .eslint-doc-generatorrc.js
module.exports = {
  ignoreConfig: ['all'],
};
```

## Compatibility

### Build tools

If you have a build step for your code like [Babel](https://babeljs.io/) or [TypeScript](https://www.typescriptlang.org/), you may need to adjust your scripts to run your build before this tool:

```json
{
  "build": "tsc",
  "update:eslint-docs": "npm run build && eslint-doc-generator"
}
```

### prettier

If you use [prettier](https://prettier.io/) to format your markdown, you may need to adjust your scripts to run prettier formatting after running this tool:

```json
{
  "format": "prettier --write .",
  "lint:eslint-docs": "npm run update:eslint-docs && git diff --exit-code",
  "update:eslint-docs": "eslint-doc-generator && npm run format"
}
```

## Related

- [eslint-plugin-eslint-plugin](https://github.com/eslint-community/eslint-plugin-eslint-plugin) - Linter for ESLint plugins ([related list](https://eslint.org/docs/latest/developer-guide/working-with-plugins#linting))
- [generator-eslint](https://github.com/eslint/generator-eslint) - Generates initial ESLint plugin and rule files but without the sophisticated documentation provided by eslint-doc-generator

[npm-image]: https://badge.fury.io/js/eslint-doc-generator.svg
[npm-url]: https://www.npmjs.com/package/eslint-doc-generator
