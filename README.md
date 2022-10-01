# eslint-doc-generator

[![npm version][npm-image]][npm-url]

Generates the following documentation:

- README rules table
- Rule doc titles and notices

Also performs some basic section consistency checks on rule docs (will eventually be configurable):

- Contains an `## Options` section and mentions each named option (for rules with options)

## Setup

Install it:

```sh
npm run --save-dev eslint-doc-generator
```

Add it as as script in `package.json` (included as a lint script to demonstrate how we can ensure it passes and is up-to-date on CI):

```json
{
  "scripts": {
    "lint": "npm-run-all \"lint:*\"",
    "lint:docs": "markdownlint \"**/*.md\"",
    "lint:eslint-docs": "npm-run-all update:docs && git diff --exit-code",
    "lint:js": "eslint .",
    "update:eslint-docs": "eslint-doc-generator"
  }
}
```

Add the rule list marker comments in your `README.md` rules section:

```md
<!-- begin rules list -->
<!-- end rules list -->
```

A new title and notices will be automatically added to the top of each rule doc (along with a marker comment if it doesn't exist yet). You may need to manually remove old notices.

## Usage

```sh
npm run update:eslint-docs
```

## Example

Generated content in a rule doc:

```md
# Disallow use of `foo` (`no-foo`)

💼 This rule is enabled in the following configs: `all`, `recommended`.

🔧 This rule is automatically fixable using the `--fix` [option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix) on the command line.

💡 This rule provides [suggestions](https://eslint.org/docs/developer-guide/working-with-rules#providing-suggestions) that can be applied manually.

❌ This rule is deprecated. It was replaced by [some-new-rule](some-new-rule.md).

<!-- end rule header -->

...
```

Generated rules table in `README.md`:

```md
# eslint-plugin-test

## Rules

✅: Enabled in the `recommended` configuration.\
🔧: Fixable with [`eslint --fix`](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems).\
💡: Provides editor [suggestions](https://eslint.org/docs/developer-guide/working-with-rules#providing-suggestions).\
💭: Requires type information.\
❌: This rule is deprecated.

<!-- begin rules list -->

| Rule                                                           | Description                                       | 💼            | 🔧  | 💡  | 💭  |
| -------------------------------------------------------------- | ------------------------------------------------- | ------------- | --- | --- | --- |
| [max-nested-describe](docs/rules/max-nested-describe.md)       | Enforces a maximum depth to nested describe calls |               |     |     |     |
| [no-alias-methods](docs/rules/no-alias-methods.md)             | Disallow alias methods                            | ✅ ![style][] | 🔧  |     |     |
| [no-commented-out-tests](docs/rules/no-commented-out-tests.md) | Disallow commented out tests                      | ✅            |     |     |     |

<!-- end rules list -->

...

<!-- define the badge for any custom configs (besides `recommended`, `all`) here -->

[style]: https://img.shields.io/badge/-style-blue.svg
```

[npm-image]: https://badge.fury.io/js/eslint-doc-generator.svg
[npm-url]: https://www.npmjs.com/package/eslint-doc-generator
