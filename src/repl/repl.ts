import * as readline from 'readline';
import * as util from 'util';

import { Lexer } from '../lexer';
import { Token, TokenType } from '../token/';

export class Repl {
  static start(username: string) {
    console.log(util.format('Hello %s! This is the Monkey programming language!\n', username));
    console.log(util.format('Feel free to type in commands.\n'));
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true,
      prompt: '>> ',
    });

    rl.prompt();
    rl.on('line', function(line) {
      const l = new Lexer(line);
      let tok = l.nextToken();

      while (tok.Type !== TokenType.EOF) {
        console.log(tok);
        tok = l.nextToken();
      }
      rl.prompt();
    }).on('close', () => {
      console.log('Exiting...');
      process.exit(0);
    });
  }
}