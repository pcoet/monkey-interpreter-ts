export interface Token {
  Type: TokenType;
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

  // Two-character operators
  EQ = '==',
  NOT_EQ = '!=',

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
  TRUE = 'TRUE',
  FALSE = 'FALSE',
  IF = 'IF',
  ELSE = 'ELSE',
  RETURN = 'RETURN',
}

const keywords = new Map([
  ['fn', TokenType.FUNCTION],
  ['let', TokenType.LET],
  ['true', TokenType.TRUE],
  ['false', TokenType.FALSE],
  ['if', TokenType.IF],
  ['else', TokenType.ELSE],
  ['return', TokenType.RETURN],
]);

export const lookUpIdent = (ident: string): TokenType => {
  const kw = keywords.get(ident);
  return kw || TokenType.IDENT;
};
