# eslint-doc-generator

[![npm version][npm-image]][npm-url]

Automatic documentation generator for [ESLint](https://eslint.org/) plugins and rules.

Generates the following documentation based on ESLint and top [ESLint plugin](https://eslint.org/docs/latest/developer-guide/working-with-plugins) conventions:

- `README.md` rules table
- Rule doc titles and notices

Also performs some basic section consistency checks on rule docs:

- Contains an `## Options` / `## Config` section and mentions each named option (for rules with options)

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

Add scripts to `package.json` (both a lint script to ensure everything is up-to-date in CI and an update script) (add any config options in the `update:eslint-docs` script):

```json
{
  "scripts": {
    "lint": "npm-run-all \"lint:*\"",
    "lint:docs": "markdownlint \"**/*.md\"",
    "lint:eslint-docs": "npm-run-all \"update:eslint-docs --check\"",
    "lint:js": "eslint .",
    "update:eslint-docs": "eslint-doc-generator"
  }
}
```

Delete any old rules list from your `README.md`. A new one will be automatically added to your `## Rules` section (along with the following marker comments if they don't already exist):

```md
<!-- begin rules list -->
<!-- end rules list -->
```

Delete any old recommended/fixable/etc. notices from your rule docs. A new title and notices will be automatically added to the top of each rule doc (along with a marker comment if it doesn't exist yet).

## Usage

Run the script from `package.json` to start out or any time you add a rule or update rule metadata in your plugin:

```sh
npm run update:eslint-docs
```

## Example

Generated content in a rule doc (everything above the marker comment) (intentionally showing all possible notices):

```md
# Disallow using foo (`test/no-foo`)

✅ This rule is enabled in the `recommended` config.

💼 This rule is enabled in the following configs: ✅ `recommended`, 🎨 `stylistic`.

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/user-guide/command-line-interface#--fix).

💡 This rule is manually fixable by [editor suggestions](https://eslint.org/docs/developer-guide/working-with-rules#providing-suggestions).

💭 This rule requires type information.

❌ This rule is deprecated. It was replaced by [prefer-bar](prefer-bar.md).

<!-- end rule header -->

Description.

## Examples

Examples.

...
```

Generated rules table in `README.md` (everything between the marker comments):

```md
# eslint-plugin-test

## Rules

<!-- begin rules list -->

💼 Configurations enabled in.\
✅ Enabled in the `recommended` configuration.\
🎨 Enabled in the `stylistic` configuration.\
🔧 Automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/user-guide/command-line-interface#--fix).\
💡 Manually fixable by [editor suggestions](https://eslint.org/docs/developer-guide/working-with-rules#providing-suggestions).\
💭 Requires type information.\
❌ Deprecated.

| Name                                     | Description        | 💼    | 🔧  | 💡  | 💭  | ❌  |
| :--------------------------------------- | :----------------- | :---- | :-- | :-- | :-- | :-- |
| [no-foo](docs/rules/no-foo.md)           | disallow using foo | ✅    | 🔧  |     |     |
| [prefer-bar](docs/rules/prefer-bar.md)   | enforce using bar  | ✅ 🎨 |     | 💡  | 💭  |
| [require-baz](docs/rules/require-baz.md) | require using baz  |       | 🔧  |     |     | ❌  |

<!-- end rules list -->

...
```

The table will hide columns that don't apply to any rules, and the legend will include only the symbols that are used in the table.

## Badge

If you have any custom configs (besides `recommended`), you'll need to either define emojis for them with `--config-emoji`, or define badges for them at the bottom of your `README.md`.

Here's a badge for a custom `style` config that displays in blue:

```md
[style]: https://img.shields.io/badge/-style-blue.svg
```

And how it looks:

![style][]

[style]: https://img.shields.io/badge/-style-blue.svg

## Configuration options

| Name | Description |
| :-- | :-- |
| `--check` | Whether to check for and fail if there is a diff. No output will be written. Typically used during CI. |
| `--config-emoji` | Custom emoji to use for a config. Format is `config-name,emoji`. Defaults to `recommended,✅`. Configs for which no emoji is specified will expect a corresponding [badge](#badge) to be specified in `README.md` instead. Option can be repeated. |
| `--ignore-config` | Config to ignore from being displayed. Often used for an `all` config. Option can be repeated. |
| `--ignore-deprecated-rules` | Whether to ignore deprecated rules from being checked, displayed, or updated (default: `false`). |
| `--rule-doc-section-exclude` | Disallowed section in each rule doc. Exit with failure if present. Option can be repeated. |
| `--rule-doc-section-include` | Required section in each rule doc. Exit with failure if missing. Option can be repeated. |
| `--rule-doc-title-format` | The format to use for rule doc titles. Defaults to `desc-parens-prefix-name`. See choices in below [table](#--rule-doc-title-format). |
| `--rule-list-columns` | Ordered, comma-separated list of columns to display in rule list. Empty columns will be hidden. Choices: `configs`, `deprecated`, `description`, `fixable`, `hasSuggestions`, `name`, `requiresTypeChecking`. Default: `name,description,configs,fixable,hasSuggestions,requiresTypeChecking,deprecated`. |
| `--url-configs` | Link to documentation about the ESLint configurations exported by the plugin. |

All options are optional.

### `--rule-doc-title-format`

Where `no-foo` is the rule name, `Do not use foo` is the rule description, and `eslint-plugin-test` is the plugin name.

| Value | Example |
| :-- | :-- |
| `desc` | `# Do not use foo` |
| `desc-parens-name` | `# Do not use foo (no-foo)` |
| `desc-parens-prefix-name` (default) | `# Do not use foo (test/no-foo)` |
| `name` | `# no-foo` |
`prefix-name` | `# test/no-foo` |

## Related

- [eslint-plugin-eslint-plugin](https://github.com/eslint-community/eslint-plugin-eslint-plugin) - Linter for ESLint plugins ([related list](https://eslint.org/docs/latest/developer-guide/working-with-plugins#linting))
- [generator-eslint](https://github.com/eslint/generator-eslint) - Generates initial ESLint plugin and rule files but without the sophisticated documentation provided by eslint-doc-generator

[npm-image]: https://badge.fury.io/js/eslint-doc-generator.svg
[npm-url]: https://www.npmjs.com/package/eslint-doc-generator
