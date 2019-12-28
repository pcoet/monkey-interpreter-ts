import { Lexer } from '../lexer';
import { Identifier, LetStatement, Program, Statement, ReturnStatement } from '../ast';
import { Token, TokenType } from '../token';

export class Parser {
  l: Lexer;
  curToken: Token | undefined;
  peekToken: Token | undefined;
  errors: Error[] = [];

  constructor(lexer: Lexer) {
    this.l = lexer;

    this.nextToken();
    this.nextToken();
  }

  public nextToken() {
    this.curToken = this.peekToken;
    this.peekToken = this.l.nextToken();
  }

  public ParseProgram(): Program {
    const program = new Program([]);

    while(this.curToken && this.curToken.Type !== TokenType.EOF) {
      const stmt = this.parseStatement();
      if (stmt !== null) {
        program.Statements.push(stmt);
      }
      this.nextToken()
    } 

    return program;
  }

  public Errors(): Error[] {
    return this.errors;
  }

  parseStatement(): Statement | null {
    if (!this.curToken) {
      return null;
    }
    switch (this.curToken.Type) {
      case TokenType.LET:
        return this.parseLetStatement();
      case TokenType.RETURN:
        return this.parseReturnStatement();
      default:
        return null;
    }
  }

  parseLetStatement(): LetStatement | null {
    if (!this.curToken) {
      return null;
    }
    
    const stmt = new LetStatement(this.curToken);
    
    if (!this.expectPeek(TokenType.IDENT)) {
      return null;
    }
    
    stmt.Name = new Identifier(this.curToken, this.curToken.Literal);

    if (!this.expectPeek(TokenType.ASSIGN)) {
      return null;
    }

    // TODO: We're skipping the expressions until we encounter a semicolon
    while (!this.curTokenIs(TokenType.SEMICOLON)) {
      this.nextToken();
    }
    
    return stmt;
  }

  parseReturnStatement(): ReturnStatement | null {
    if (!this.curToken) {
      return null;
    }
    
    const stmt = new ReturnStatement(this.curToken);
    this.nextToken();

    // TODO: We're skipping the expressions until we // encounter a semicolon
    while (!this.curTokenIs(TokenType.SEMICOLON)) {
      this.nextToken();
    }
    return stmt;
  }

  curTokenIs(t: TokenType): boolean { 
    return !!this.curToken && this.curToken.Type === t;
  }

  peekTokenIs(t: TokenType): boolean {
    return !!this.peekToken && this.peekToken.Type === t;
  }
    
  expectPeek(t: TokenType): boolean {
    if (this.peekTokenIs(t)) {
      this.nextToken();
      return true; 
    } else {
      this.peekError(t);
      return false;
    }
  }

  peekError(t: TokenType): void {
    const msg = `Expected next token to be ${t} but got ${this.peekToken?.Type}`;
    this.errors.push(new Error(msg));
  }
}