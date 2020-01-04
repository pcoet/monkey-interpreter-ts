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

Input examples:

    let x = 1 * 2 * 3 * 4 * 5;
    x * y / 2 + 3 * 8 - 123
    true == false

And this should produce an error:

    let x 12 * 3;

## TODOs

* Finish implementing. Start with Evaluation.
* Consider creating a Char type: https://stackoverflow.com/questions/42678891/typescript-character-type
