import { Token, TokenType, TokenTypes } from '../token/token'

export interface Lexer {
  input: string;
  position: number;
  readPosition: number;
  ch: string | null;
}

const readChar = (l: Lexer) => {
  if (l.readPosition >= l.input.length) {
    l.ch = null;
  } else {
    l.ch = l.input[l.readPosition]
  }
  l.position = l.readPosition
  l.readPosition += 1;
}

const newToken = (tokenType: TokenType, ch: string): Token => {
  return {
    Type: tokenType,
    Literal: ch,
  }
};

export const newLexer = (input: string): Lexer => {
  const l: Lexer = {
    input,
    position: 0,
    readPosition: 0,
    ch: null,
  };
  readChar(l);
  return l;
};

export const nextToken = (l: Lexer): Token => {
  let tok: Token;
  
  switch (l.ch) {
    case '=':
      tok = newToken(TokenTypes.ASSIGN, l.ch);
      break;
    case ';':
      tok = newToken(TokenTypes.SEMICOLON, l.ch);
      break;
    case '(':
      tok = newToken(TokenTypes.LPAREN, l.ch);
      break;
    case ')':
      tok = newToken(TokenTypes.RPAREN, l.ch);
      break;
    case ',':
      tok = newToken(TokenTypes.COMMA, l.ch);
      break;
    case '+':
      tok = newToken(TokenTypes.PLUS, l.ch);
      break;
    case '{':
      tok = newToken(TokenTypes.LBRACE, l.ch);
      break;
    case '}':
      tok = newToken(TokenTypes.RBRACE, l.ch);
      break;
    case null:
      tok = {
        Type: TokenTypes.EOF,
        Literal: ''
      };
      break;
    default: {
      tok = {
        Type: TokenTypes.EOF,
        Literal: ''
      };
    }
  }
  readChar(l);
  return tok;
};