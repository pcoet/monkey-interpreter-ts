export type TokenType = string;

export interface Token {
  Type: TokenType;
  Literal: string;
}

export enum TokenTypes {
  ILLEGAL = 'ILLEGAL',
  EOF = 'EOF',
  
  // Identifiers + literals
  IDENT = 'IDENT',  // add, foobar, x, y, ...
  INT = 'INT',      // 1343456

  // Operators
  ASSIGN = '=',
  PLUS = '+',

  // Delimiters
  COMMA = ',',
  SEMICOLON = ';',
  LPAREN = '(',
  RPAREN = ')',
  LBRACE = '{',
  RBRACE = '}',

  // Keywords
  FUNCTION = 'FUNCTION',
  LET = 'LET'
}

const keywords = new Map([
  ['fn', TokenTypes.FUNCTION],
  ['let', TokenTypes.LET],
]);

export const lookUpIdent = (ident: string): TokenTypes => {
  const kw = keywords.get(ident);
  return kw || TokenTypes.IDENT;
};
