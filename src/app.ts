import * as os from 'os';

import { Repl } from './repl';

function main(): void {
  let username: string;
  try {
    username = os.userInfo().username;
    Repl.start(username);
  } catch(err) {
    console.error(err);
  }
}

main();