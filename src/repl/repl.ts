/* eslint-disable no-useless-escape */
import * as readline from 'readline';

import { Lexer } from '../lexer';
import { Parser } from '../parser';

function printParseErrors(errors: Error[]): void {
  console.log('Parser errors:\n');
  errors.forEach((err) => {
    console.log(`\t${err.message}\n`);
  });
}

export class Repl {
  static start(stdin: NodeJS.ReadStream, stdout: NodeJS.WriteStream): void {
    const rl = readline.createInterface({
      input: stdin,
      output: stdout,
      terminal: true,
      prompt: '>> ',
    });

    rl.prompt();
    rl.on('line', (line) => {
      const l = new Lexer(line);
      const p = new Parser(l);
      const program = p.ParseProgram();

      if (p.Errors().length !== 0) {
        printParseErrors(p.Errors());
      } else {
        console.log(`${program.String()}\n`);
      }

      rl.prompt();
    }).on('close', () => {
      console.log('Exiting...');
      process.exit(0);
    });
  }
}
