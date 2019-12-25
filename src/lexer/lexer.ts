import { Token, TokenType, TokenTypes, lookUpIdent } from '../token/token'

export class Lexer {
  input: string;
  position: number;
  readPosition: number;
  ch: null | string;

  constructor(input: string) {
    this.input = input;
    this.position = 0;
    this.readPosition = 0;
    this.ch = null;
    this.readChar();
  }

  private newToken(tokenType: TokenType, ch: string): Token {
    return {
      Type: tokenType,
      Literal: ch,
    }
  };

  private readChar() {
    if (this.readPosition >= this.input.length) {
      this.ch = null;
    } else {
      this.ch = this.input[this.readPosition]
    }
    this.position = this.readPosition
    this.readPosition += 1;
  }

  private isLetter(ch: string | null): boolean {
    if (!ch) { return false };
    return 'a' <= ch && ch <= 'z' || 'A' <= ch && ch <= 'Z' || ch === '_'; // defines allowed letters in identifiers
  };

  private isDigit(ch: string | null): boolean {
    if (!ch) { return false };
    return '0' <= ch && ch <= '9'; //TODO: confirm that we only support integers, not floats, etc.
  };

  private readIdentifier(): string {
    const position = this.position;
    while (this.isLetter(this.ch)) {
      this.readChar();
    }
    return this.input.slice(position, this.position);
  }

  private skipWhitespace() {
    while (this.ch === ' ' || this.ch === '\t' || this.ch === '\n' || this.ch === '\r') {
      this.readChar();
    }
  };

  private readNumber(): string {
    const position = this.position;
    while (this.isDigit(this.ch)) {
      this.readChar();
    }
    return this.input.slice(position, this.position);
  };

  public nextToken(): Token {
    let tok: Token;
  
    this.skipWhitespace();
    
    switch (this.ch) {
      case '=':
        tok = this.newToken(TokenTypes.ASSIGN, this.ch);
        break;
      case ';':
        tok = this.newToken(TokenTypes.SEMICOLON, this.ch);
        break;
      case '(':
        tok = this.newToken(TokenTypes.LPAREN, this.ch);
        break;
      case ')':
        tok = this.newToken(TokenTypes.RPAREN, this.ch);
        break;
      case ',':
        tok = this.newToken(TokenTypes.COMMA, this.ch);
        break;
      case '+':
        tok = this.newToken(TokenTypes.PLUS, this.ch);
        break;
      case '{':
        tok = this.newToken(TokenTypes.LBRACE, this.ch);
        break;
      case '}':
        tok = this.newToken(TokenTypes.RBRACE, this.ch);
        break;
      case null:
        tok = {
          Type: TokenTypes.EOF,
          Literal: ''
        };
        break;
      default: {
        if (this.isLetter(this.ch)) {
          const literal = this.readIdentifier();
          tok = {
            Literal: literal,
            Type: lookUpIdent(literal),
          }
          return tok;
        } else if (this.isDigit(this.ch)) {
          tok = {
            Literal: this.readNumber(),
            Type: TokenTypes.INT,
          }
          return tok;
        } else {
          tok = this.newToken(TokenTypes.ILLEGAL, this.ch);
        }
      }
    }
    this.readChar();
    return tok;
  };
}
