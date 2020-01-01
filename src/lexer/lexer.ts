import { Token, TokenType, lookUpIdent } from '../token';

export type Char = string;

export class Lexer {
  input: string;
  position: number;
  readPosition: number;
  ch: Char | null;

  constructor(input: string) {
    this.input = input;
    this.position = 0;
    this.readPosition = 0;
    this.ch = null;
    this.readChar();
  }

  static newToken(tokenType: TokenType, ch: Char): Token {
    return {
      Type: tokenType,
      Literal: ch,
    };
  }

  private readChar(): void {
    if (this.readPosition >= this.input.length) {
      this.ch = null;
    } else {
      this.ch = this.input[this.readPosition];
    }
    this.position = this.readPosition;
    this.readPosition += 1;
  }

  static isLetter(ch: Char | null): boolean {
    if (!ch) { return false; }
    return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch === '_'; // defines allowed letters in identifiers
  }

  static isDigit(ch: Char | null): boolean {
    if (!ch) { return false; }
    return ch >= '0' && ch <= '9'; // TODO: confirm that we only support integers, not floats, etc.
  }

  private readIdentifier(): string {
    const { position } = this;
    while (Lexer.isLetter(this.ch)) {
      this.readChar();
    }
    return this.input.slice(position, this.position);
  }

  private skipWhitespace(): void {
    while (this.ch === ' ' || this.ch === '\t' || this.ch === '\n' || this.ch === '\r') {
      this.readChar();
    }
  }

  private readNumber(): string {
    const { position } = this;
    while (Lexer.isDigit(this.ch)) {
      this.readChar();
    }
    return this.input.slice(position, this.position);
  }

  private peekChar(): Char | null {
    if (this.readPosition >= this.input.length) {
      return null;
    }
    return this.input[this.readPosition];
  }

  public nextToken(): Token {
    let tok: Token;

    this.skipWhitespace();

    switch (this.ch) {
      case '=':
        if (this.peekChar() === '=') {
          const { ch } = this;
          this.readChar();
          const literal = `${ch}${this.ch}`;
          tok = {
            Literal: literal,
            Type: TokenType.EQ,
          };
          break;
        } else {
          tok = Lexer.newToken(TokenType.ASSIGN, this.ch);
          break;
        }
      case '+':
        tok = Lexer.newToken(TokenType.PLUS, this.ch);
        break;
      case '-':
        tok = Lexer.newToken(TokenType.MINUS, this.ch);
        break;
      case '!':
        if (this.peekChar() === '=') {
          const { ch } = this;
          this.readChar();
          const literal = `${ch}${this.ch}`;
          tok = {
            Literal: literal,
            Type: TokenType.NOT_EQ,
          };
          break;
        } else {
          tok = Lexer.newToken(TokenType.BANG, this.ch);
          break;
        }
      case '/':
        tok = Lexer.newToken(TokenType.SLASH, this.ch);
        break;
      case '*':
        tok = Lexer.newToken(TokenType.ASTERISK, this.ch);
        break;
      case '<':
        tok = Lexer.newToken(TokenType.LT, this.ch);
        break;
      case '>':
        tok = Lexer.newToken(TokenType.GT, this.ch);
        break;
      case ';':
        tok = Lexer.newToken(TokenType.SEMICOLON, this.ch);
        break;
      case ',':
        tok = Lexer.newToken(TokenType.COMMA, this.ch);
        break;
      case '(':
        tok = Lexer.newToken(TokenType.LPAREN, this.ch);
        break;
      case ')':
        tok = Lexer.newToken(TokenType.RPAREN, this.ch);
        break;
      case '{':
        tok = Lexer.newToken(TokenType.LBRACE, this.ch);
        break;
      case '}':
        tok = Lexer.newToken(TokenType.RBRACE, this.ch);
        break;
      case null:
        tok = {
          Type: TokenType.EOF,
          Literal: '',
        };
        break;
      default: {
        if (Lexer.isLetter(this.ch)) {
          const literal = this.readIdentifier();
          tok = {
            Type: lookUpIdent(literal),
            Literal: literal,
          };
          return tok;
        }
        if (Lexer.isDigit(this.ch)) {
          tok = {
            Type: TokenType.INT,
            Literal: this.readNumber(),
          };
          return tok;
        }
        tok = Lexer.newToken(TokenType.ILLEGAL, this.ch);
      }
    }
    this.readChar();
    return tok;
  }
}
