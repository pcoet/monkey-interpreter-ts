import { Identifier, LetStatement, Program } from './ast';
import { Token, TokenType } from '../token';

describe('AST', () => {
  test('Program string', () => {
    const token: Token = {
      Type: TokenType.LET,
      Literal: 'let',
    };
    const name = new Identifier({
      Type: TokenType.IDENT,
      Literal: 'myVar',
    }, 'myVar');
    const value = new Identifier({
      Type: TokenType.IDENT,
      Literal: 'anotherVar',
    }, 'anotherVar');
    const letStmt = new LetStatement(token, name, value);
    const program = new Program([letStmt]);
    expect(program.String()).toEqual('let myVar = anotherVar;');
  });
});
