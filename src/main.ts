import * as os from 'os';

import { Repl } from './repl';

function main(): void {
  try {
    const { username } = os.userInfo();
    const { stdin, stdout } = process;
    console.log(`Hello ${username}! This is the Monkey programming language!\n`);
    console.log('Feel free to type in commands.\n');
    Repl.start(stdin, stdout);
  } catch (err) {
    console.error(err);
  }
}

main();
