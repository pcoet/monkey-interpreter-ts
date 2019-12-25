export type TokType = string;

export interface Token {
  Type: TokType;
  Literal: string;
}

export enum TokenType {
  ILLEGAL = 'ILLEGAL',
  EOF = 'EOF',
  
  // Identifiers + literals
  IDENT = 'IDENT',  // add, foobar, x, y, ...
  INT = 'INT',      // 1343456

  // Operators
  ASSIGN = '=',
  PLUS = '+',
  MINUS = '-',
  BANG = '!',
  ASTERISK = '*',
  SLASH    = '/',
  LT = '<',
  GT = '>',

  // Delimiters
  COMMA = ',',
  SEMICOLON = ';',
  LPAREN = '(',
  RPAREN = ')',
  LBRACE = '{',
  RBRACE = '}',

  // Keywords
  FUNCTION = 'FUNCTION',
  LET = 'LET',
}

const keywords = new Map([
  ['fn', TokenType.FUNCTION],
  ['let', TokenType.LET],
]);

export const lookUpIdent = (ident: string): TokenType => {
  const kw = keywords.get(ident);
  return kw || TokenType.IDENT;
};
