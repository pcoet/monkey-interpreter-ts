import * as readline from 'readline';

import { Lexer } from '../lexer';
import { TokenType } from '../token/';

export class Repl {
  static start(stdin: NodeJS.ReadStream, stdout: NodeJS.WriteStream) {
    const rl = readline.createInterface({
      input: stdin,
      output: stdout,
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