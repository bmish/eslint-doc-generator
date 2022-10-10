















## v0.9.0 (2022-10-10)

#### :rocket: Enhancement
* [#116](https://github.com/bmish/eslint-doc-generator/pull/116) Add `--config-emoji` option ([@bmish](https://github.com/bmish))
* [#109](https://github.com/bmish/eslint-doc-generator/pull/109) Add `--check` option ([@bmish](https://github.com/bmish))

#### :memo: Documentation
* [#108](https://github.com/bmish/eslint-doc-generator/pull/108) Improve README especially about config options ([@bmish](https://github.com/bmish))

#### Committers: 1
- Bryan Mishkin ([@bmish](https://github.com/bmish))


## v0.8.1 (2022-10-10)

#### :bug: Bug Fix
* [#106](https://github.com/bmish/eslint-doc-generator/pull/106) Handle lowercase `readme.md` ([@bmish](https://github.com/bmish))

#### Committers: 1
- Bryan Mishkin ([@bmish](https://github.com/bmish))


## v0.8.0 (2022-10-09)

#### :rocket: Enhancement
* [#104](https://github.com/bmish/eslint-doc-generator/pull/104) Add `desc` format to `--rule-doc-title-format` option ([@bmish](https://github.com/bmish))

#### :bug: Bug Fix
* [#103](https://github.com/bmish/eslint-doc-generator/pull/103) Left-align rule list column headers ([@bmish](https://github.com/bmish))
* [#102](https://github.com/bmish/eslint-doc-generator/pull/102) Use `Name` instead of `Rule` for rule list column header ([@bmish](https://github.com/bmish))
* [#101](https://github.com/bmish/eslint-doc-generator/pull/101) Improve notice/legend wording consistency and conciseness ([@bmish](https://github.com/bmish))

#### Committers: 1
- Bryan Mishkin ([@bmish](https://github.com/bmish))


## v0.7.0 (2022-10-09)

#### :rocket: Enhancement
* [#93](https://github.com/bmish/eslint-doc-generator/pull/93) Add `--ignore-config` option ([@bmish](https://github.com/bmish))
* [#92](https://github.com/bmish/eslint-doc-generator/pull/92) Add `--ignore-deprecated-rules` option ([@bmish](https://github.com/bmish))

#### Committers: 1
- Bryan Mishkin ([@bmish](https://github.com/bmish))


## v0.6.0 (2022-10-09)

#### :rocket: Enhancement
* [#84](https://github.com/bmish/eslint-doc-generator/pull/84) Add `--rule-doc-section-include` and `--rule-doc-section-exclude` options ([@bmish](https://github.com/bmish))
* [#83](https://github.com/bmish/eslint-doc-generator/pull/83) Add `--rule-doc-title-format` option ([@bmish](https://github.com/bmish))
* [#82](https://github.com/bmish/eslint-doc-generator/pull/82) Add `--url-configs` option ([@bmish](https://github.com/bmish))

#### :bug: Bug Fix
* [#87](https://github.com/bmish/eslint-doc-generator/pull/87) Handle when prettier is not installed ([@bmish](https://github.com/bmish))
* [#81](https://github.com/bmish/eslint-doc-generator/pull/81) Throw error when missing README.md ([@bmish](https://github.com/bmish))
* [#80](https://github.com/bmish/eslint-doc-generator/pull/80) Throw error when missing rule doc ([@bmish](https://github.com/bmish))

#### Committers: 1
- Bryan Mishkin ([@bmish](https://github.com/bmish))


## v0.5.0 (2022-10-08)

#### :rocket: Enhancement
* [#75](https://github.com/bmish/eslint-doc-generator/pull/75) Automatically generate legend for rules list ([@bmish](https://github.com/bmish))
* [#76](https://github.com/bmish/eslint-doc-generator/pull/76) Hide empty columns from rules list ([@bmish](https://github.com/bmish))
* [#73](https://github.com/bmish/eslint-doc-generator/pull/73) Hide config column from rules list when no configs present and move deprecations to a separate column ([@bmish](https://github.com/bmish))

#### :bug: Bug Fix
* [#72](https://github.com/bmish/eslint-doc-generator/pull/72) Improve section header detection ([@bmish](https://github.com/bmish))

#### :memo: Documentation
* [#74](https://github.com/bmish/eslint-doc-generator/pull/74) Tweak README ([@ddzz](https://github.com/ddzz))

#### Committers: 2
- Bryan Mishkin ([@bmish](https://github.com/bmish))
- Darius Dzien ([@ddzz](https://github.com/ddzz))


## v0.4.0 (2022-10-07)

#### :bug: Bug Fix
* [#70](https://github.com/bmish/eslint-doc-generator/pull/70) Handle string `extends` from ESLint config, deprecated/function-style rules, missing rule descriptions (and use actual ESLint types to detect issues like these) ([@bmish](https://github.com/bmish))

#### Committers: 1
- Bryan Mishkin ([@bmish](https://github.com/bmish))


## v0.3.5 (2022-10-06)

#### :bug: Bug Fix
* [#67](https://github.com/bmish/eslint-doc-generator/pull/67) Handle rules enabled with options ([@bmish](https://github.com/bmish))
* [#65](https://github.com/bmish/eslint-doc-generator/pull/65) Handle config overrides ([@bmish](https://github.com/bmish))

#### Committers: 1
- Bryan Mishkin ([@bmish](https://github.com/bmish))


## v0.3.4 (2022-10-05)

#### :bug: Bug Fix
* [#62](https://github.com/bmish/eslint-doc-generator/pull/62) Fix plugin importing on Windows ([@bmish](https://github.com/bmish))

#### Committers: 1
- Bryan Mishkin ([@bmish](https://github.com/bmish))


## v0.3.3 (2022-10-04)

#### :bug: Bug Fix
* [#60](https://github.com/bmish/eslint-doc-generator/pull/60) Ignore external configs during ESLint config resolution ([@bmish](https://github.com/bmish))

#### Committers: 1
- Bryan Mishkin ([@bmish](https://github.com/bmish))


## v0.3.2 (2022-10-04)

#### :bug: Bug Fix
* [#59](https://github.com/bmish/eslint-doc-generator/pull/59) Resolve `extends` in ESLint configs ([@bmish](https://github.com/bmish))

#### :house: Internal
* [#50](https://github.com/bmish/eslint-doc-generator/pull/50) Add test for CJS plugin file ([@bmish](https://github.com/bmish))

#### Committers: 1
- Bryan Mishkin ([@bmish](https://github.com/bmish))


## v0.3.1 (2022-10-03)

#### :bug: Bug Fix
* [#48](https://github.com/bmish/eslint-doc-generator/pull/48) Only apply prettier formatting to managed doc content ([@bmish](https://github.com/bmish))

#### Committers: 1
- Bryan Mishkin ([@bmish](https://github.com/bmish))


## v0.3.0 (2022-10-02)

#### :bug: Bug Fix
* [#47](https://github.com/bmish/eslint-doc-generator/pull/47) Throw exception when plugin does not export a `rules` object ([@bmish](https://github.com/bmish))
* [#45](https://github.com/bmish/eslint-doc-generator/pull/45) Handle various possible names for options section when checking for its presence in rule doc ([@bmish](https://github.com/bmish))
* [#43](https://github.com/bmish/eslint-doc-generator/pull/43) Improved detection for README rules section when marker comments are missing ([@bmish](https://github.com/bmish))
* [#42](https://github.com/bmish/eslint-doc-generator/pull/42) Allow plugin to omit configs ([@bmish](https://github.com/bmish))
* [#41](https://github.com/bmish/eslint-doc-generator/pull/41) Handle scoped plugin names ([@bmish](https://github.com/bmish))
* [#40](https://github.com/bmish/eslint-doc-generator/pull/40) Description in rule doc title should begin with a capital letter and omit a trailing period ([@bmish](https://github.com/bmish))
* [#39](https://github.com/bmish/eslint-doc-generator/pull/39) Add plugin prefix to rule name in rule doc title ([@bmish](https://github.com/bmish))
* [#28](https://github.com/bmish/eslint-doc-generator/pull/28) Use prettier's own config resolution when formatting docs ([@bmish](https://github.com/bmish))

#### Committers: 1
- Bryan Mishkin ([@bmish](https://github.com/bmish))


## v0.2.0 (2022-10-01)

#### :rocket: Enhancement
* [#17](https://github.com/bmish/eslint-doc-generator/pull/17) Automatically insert missing rule list markers in README rules section ([@bmish](https://github.com/bmish))

#### :bug: Bug Fix
* [#18](https://github.com/bmish/eslint-doc-generator/pull/18) Allow deprecated rules to forgo a doc file or description ([@bmish](https://github.com/bmish))
* [#12](https://github.com/bmish/eslint-doc-generator/pull/12) Avoid creating a duplicate title when rule doc is missing marker comment ([@bmish](https://github.com/bmish))
* [#8](https://github.com/bmish/eslint-doc-generator/pull/8) Use `recommended` config emoji in rule doc when rule is only in that config ([@bmish](https://github.com/bmish))
* [#7](https://github.com/bmish/eslint-doc-generator/pull/7) Use `recommended` config emoji in rules list header when no custom configs present ([@bmish](https://github.com/bmish))

#### :memo: Documentation
* [#19](https://github.com/bmish/eslint-doc-generator/pull/19) Tweak README ([@bmish](https://github.com/bmish))
* [#11](https://github.com/bmish/eslint-doc-generator/pull/11) Provide rule list marker comments in error message when missing from README ([@bmish](https://github.com/bmish))

#### :house: Internal
* [#6](https://github.com/bmish/eslint-doc-generator/pull/6) Move emojis into centralized file ([@bmish](https://github.com/bmish))

#### Committers: 1
- Bryan Mishkin ([@bmish](https://github.com/bmish))


## v0.1.1 (2022-10-01)

#### :bug: Bug Fix
* [#5](https://github.com/bmish/eslint-doc-generator/pull/5) Add missing Node shebang to binary ([@bmish](https://github.com/bmish))

#### Committers: 1
- Bryan Mishkin ([@bmish](https://github.com/bmish))


## v0.1.0 (2022-10-01)

#### :rocket: Enhancement
* [#2](https://github.com/bmish/eslint-doc-generator/pull/2) Initial implementation ([@bmish](https://github.com/bmish))

#### :house: Internal
* [#1](https://github.com/bmish/eslint-doc-generator/pull/1) Add Dependabot config ([@ddzz](https://github.com/ddzz))

#### Committers: 2
- Bryan Mishkin ([@bmish](https://github.com/bmish))
- Darius Dzien ([@ddzz](https://github.com/ddzz))

