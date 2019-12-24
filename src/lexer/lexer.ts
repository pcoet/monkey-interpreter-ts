import { Token, TokenType, TokenTypes, lookUpIdent } from '../token/token'

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

const isLetter = (ch: string | null): boolean => {
  if (!ch) { return false };
  return 'a' <= ch && ch <= 'z' || 'A' <= ch && ch <= 'Z' || ch === '_'; // defines allowed letters in identifiers
  
};

const isDigit = (ch: string | null): boolean => {
  if (!ch) { return false };
  return '0' <= ch && ch <= '9'; //TODO: confirm that we only support integers, not floats, etc.
};

const readIdentifier = (l: Lexer): string => {
  const position = l.position;
  while (isLetter(l.ch)) {
    readChar(l);
  }
  return l.input.slice(position, l.position);
}

const skipWhitespace = (l: Lexer) => {
  while (l.ch === ' ' || l.ch === '\t' || l.ch === '\n' || l.ch === '\r') {
    readChar(l);
  }
};

const readNumber = (l: Lexer): string => {
  const position = l.position;
  while (isDigit(l.ch)) {
    readChar(l);
  }
  return l.input.slice(position, l.position);
};

export const nextToken = (l: Lexer): Token => {
  let tok: Token;

  skipWhitespace(l);
  
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
      if (isLetter(l.ch)) {
        const literal = readIdentifier(l);
        tok = {
          Literal: literal,
          Type: lookUpIdent(literal),
        }
        return tok;
      } else if (isDigit(l.ch)) {
        tok = {
          Literal: readNumber(l),
          Type: TokenTypes.INT,
        }
        return tok;
      } else {
        tok = newToken(TokenTypes.ILLEGAL, l.ch);
      }
    }
  }
  readChar(l);
  return tok;
};