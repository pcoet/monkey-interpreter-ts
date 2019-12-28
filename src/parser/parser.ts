import { Lexer } from '../lexer';
import { Identifier, LetStatement, Program, Statement } from '../ast';
import { Token, TokenType } from '../token';

export class Parser {
  l: Lexer;
  curToken: Token | undefined;
  peekToken: Token | undefined;

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

  parseStatement(): Statement | null {
    if (!this.curToken) {
      return null;
    }
    switch (this.curToken.Type) {
      case TokenType.LET:
        return this.parseLetStatement()
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
      return false;
    }
  }
}