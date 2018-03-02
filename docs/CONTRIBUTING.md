# Contributing guidelines

#### General guidelines 

* Include unit tests when you contribute new features, as they help to a) prove that your code works correctly, and b) guard against future breaking changes to lower the maintenance cost.
* Bug fixes also generally require unit tests, because the presence of bugs usually indicates insufficient test coverage.
* Do not break userspace.
* When you contribute a new feature, the maintenance burden is transferred to me. This means that benefit of the contribution must be compared against the cost of maintaining the feature.

### Utility functions

#### Compiling

```shell
npm run compile
```

Runs the TypeScript compileer, same as tsc, or tsc -w back in the old days.

#### Linting

```shell
npm run lint
```

#### Tests

```shell
npm run test
```

Running the tests also generates html files with coverage information (`coverage/`) about which lines that are covered by code and which lines that are not. There shouldn't be any statements/functions/branches that are not covered by code.

#### Format


```shell
npm run format
```

Runs the formatter (prettier).

## Interactive debugging in VSCode

Copy [launch.json](https://github.com/graphtheory/ez-xml/blob/master/docs/files/launch.json) to your local `.vscode/launch.json` and run whatever part you need to debug from the `Debug panel`.

## Future

* Literals should be refactored in the XPath AST to become instances of `Literal` (integers are currently strings, strings are quoted strings, and decimals aren't supported)