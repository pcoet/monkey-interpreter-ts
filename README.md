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

## TODOs

* Refactor the following modules to use classes, with helper functions on class:
  * lexer
    * Consider creating a Char type: https://stackoverflow.com/questions/42678891/typescript-character-type
  * token - fix naming conventions (e.g. TokenTypes -> TokenType)
  * main - figure out the best, most idiomatic way to run the compiled app.