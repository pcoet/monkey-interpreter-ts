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

// TODO: move keyword literals to a map
export const lookUpIdent = (ident: string): TokenTypes => {
  switch (ident) {
    case 'fn': // map 'fn' to 'FUNCTION'
      return TokenTypes.FUNCTION;
    case 'let': // map 'let' to 'LET'
      return TokenTypes.LET;
    default:
      return TokenTypes.IDENT;
  }
};
