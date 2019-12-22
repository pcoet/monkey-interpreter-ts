import { Token } from '../token/token'

export interface Lexer {
  input: string;
  nextToken: () => Token;
}

export const newLexer = (input: string): Lexer => {
  return {
    input,
    nextToken: (): Token => {
      return {
        Type: 'foo',
        Literal: 'bar',
      }
    },
  }
};