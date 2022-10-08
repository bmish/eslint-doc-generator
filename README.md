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

Run the script from `package.json`:

```sh
npm run update:eslint-docs
```

## Example

Generated content in a rule doc (everything above the marker comment):

```md
# Disallow use of `foo` (`test/no-foo`)

💼 This rule is enabled in the following configs: `all`, `recommended`.

🔧 This rule is automatically fixable using the `--fix` [option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix) on the command line.

💡 This rule provides [suggestions](https://eslint.org/docs/developer-guide/working-with-rules#providing-suggestions) that can be applied manually.

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
🔧 Fixable with [`eslint --fix`](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems).\
💡 Provides editor [suggestions](https://eslint.org/docs/developer-guide/working-with-rules#providing-suggestions).\
💭 Requires type information.\
❌ Deprecated.

| Rule                                                           | Description                                       | ✅  | 🔧  | 💡  | 💭  |
| -------------------------------------------------------------- | ------------------------------------------------- | --- | --- | --- | --- |
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

[npm-image]: https://badge.fury.io/js/eslint-doc-generator.svg
[npm-url]: https://www.npmjs.com/package/eslint-doc-generator

## Upcoming features

- Custom config emojis ([#34](https://github.com/bmish/eslint-doc-generator/issues/34))
- Configurable rule doc section consistency checks ([#36](https://github.com/bmish/eslint-doc-generator/issues/36))

## Related

- [eslint-plugin-eslint-plugin](https://github.com/eslint-community/eslint-plugin-eslint-plugin) - Linter for ESLint plugins ([related list](https://eslint.org/docs/latest/developer-guide/working-with-plugins#linting))
- [generator-eslint](https://github.com/eslint/generator-eslint) - Generates initial ESLint plugin and rule files but without the sophisticated documentation provided by eslint-doc-generator
