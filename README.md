# eslint-doc-generator

[![npm version][npm-image]][npm-url]

Automatic documentation generator for [ESLint](https://eslint.org/) plugins and rules.

Generates the following documentation based on ESLint and top [ESLint plugin](https://eslint.org/docs/latest/developer-guide/working-with-plugins) conventions:

- `README.md` rules table
- Rule doc titles and notices

Also performs some basic section consistency checks on rule docs:

- Contains an `## Options` / `## Config` section and mentions each named option (for rules with options)

## Setup

Install it:

```sh
npm i --save-dev eslint-doc-generator
```

Add it as as script in `package.json` (included as a lint script to demonstrate how we can ensure it passes and is up-to-date in CI):

```json
{
  "scripts": {
    "lint": "npm-run-all \"lint:*\"",
    "lint:docs": "markdownlint \"**/*.md\"",
    "lint:eslint-docs": "npm-run-all update:eslint-docs && git diff --exit-code",
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

Generated content in a rule doc (everything above the marker comment):

```md
# Disallow use of `foo` (`test/no-foo`)

💼 This rule is enabled in the following configs: `all`, `recommended`.

🔧 This rule is automatically fixable by the `--fix` [CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

💡 This rule is manually fixable by editor [suggestions](https://eslint.org/docs/developer-guide/working-with-rules#providing-suggestions).

❌ This rule is deprecated. It was replaced by [some-new-rule](some-new-rule.md).

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

✅ Enabled in the `recommended` configuration.\
💼 Configurations enabled in.\
🔧 Automatically fixable by the `--fix` [CLI option](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems).\
💡 Manually fixable by editor [suggestions](https://eslint.org/docs/developer-guide/working-with-rules#providing-suggestions).\
💭 Requires type information.\
❌ Deprecated.

| Name                                                           | Description                                       | ✅  | 🔧  | 💡  | 💭  |
| :------------------------------------------------------------- | :------------------------------------------------ | :-- | :-- | :-- | :-- |
| [max-nested-describe](docs/rules/max-nested-describe.md)       | Enforces a maximum depth to nested describe calls |     |     |     |     |
| [no-alias-methods](docs/rules/no-alias-methods.md)             | Disallow alias methods                            | ✅  | 🔧  |     |     |
| [no-commented-out-tests](docs/rules/no-commented-out-tests.md) | Disallow commented out tests                      | ✅  |     |     |     |

<!-- end rules list -->

...
```

The table will hide columns that don't apply to any rules, and the legend will include only the symbols that are used in the table.

If you have any custom configs (besides `all`, `recommended`), you'll need to define a badge for them at the bottom of your `README.md`. Here's a badge for a custom `style` config that displays in blue:

```md
[style]: https://img.shields.io/badge/-style-blue.svg
```

Custom config emojis will also be an option soon ([#34](https://github.com/bmish/eslint-doc-generator/issues/34)).

## Configuration options

| Name | Description |
| :-- | :-- |
| `--ignore-config` | (optional) Config to ignore from being displayed. Often used for an `all` config. Option can be repeated. |
| `--ignore-deprecated-rules` | (optional) Whether to ignore deprecated rules from being checked, displayed, or updated (default: `false`). |
| `--rule-doc-section-exclude` | (optional) Disallowed section in each rule doc. Exit with failure if present. Option can be repeated. |
| `--rule-doc-section-include` | (optional) Required section in each rule doc. Exit with failure if missing. Option can be repeated. |
| `--rule-doc-title-format` | (optional) The format to use for rule doc titles. Defaults to `desc-parens-prefix-name`. See choices in below table. |
| `--url-configs` | (optional) Link to documentation about the ESLint configurations exported by the plugin. |

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
