# monkey-interpreter-ts
A(nother) TypeScript implementation of the [Monkey](https://monkeylang.org/) interpreter. 

## Install

    npm install

## Build

    npm run build

This runs the tests, the linter, and the TypeScript compiler.

## Run

First install and build, the run:

    npm start

As an example, you can use this input: `let add = fn(x, y) { x + y; };`

## TODOs

* Refactor the following modules to use classes, with helper functions on class:
  * lexer
    * Consider creating a Char type: https://stackoverflow.com/questions/42678891/typescript-character-type
  * token - fix naming conventions (e.g. TokenTypes -> TokenType)
  * repl - figure out how to test this
* Refactor 'Let statements' test in parser.test.ts to match parser_test.go.