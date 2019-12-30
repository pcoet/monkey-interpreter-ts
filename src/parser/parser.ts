import { Lexer } from '../lexer';
import { Identifier, LetStatement, Program, Statement, ReturnStatement, Expression, ExpressionStatement } from '../ast';
import { Token, TokenType } from '../token';

type prefixParseFn = () => Expression | null;
type infixParseFn = (expression: Expression) => Expression | null;

enum Precedence {
  LOWEST = 1,
  EQUALS, // ==
  LESSGREATER, // > or <
  SUM, // +
  PRODUCT, // *
  PREFIX, // -X or !X
  CALL, // myFunction(X)
}

export class Parser {
  l: Lexer;
  curToken: Token | undefined;
  peekToken: Token | undefined;
  errors: Error[] = [];

  prefixParseFns: Map<TokenType, prefixParseFn>;
  infixParseFns: Map<TokenType, infixParseFn>;

  constructor(lexer: Lexer) {
    this.parseIdentifier = this.parseIdentifier.bind(this);
    
    this.l = lexer;

    this.nextToken();
    this.nextToken();

    this.prefixParseFns = new Map();
    this.registerPrefix(TokenType.IDENT, this.parseIdentifier);
    this.infixParseFns = new Map();
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
        return this.parseExpressionStatement();
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

  parseExpressionStatement(): ExpressionStatement | null {
    if (!this.curToken) {
      return null;
    }
    const stmt = new ExpressionStatement(this.curToken);

    stmt.Expression = this.parseExpression(Precedence.LOWEST) || undefined;
    
    if (this.peekTokenIs(TokenType.SEMICOLON)) {
      this.nextToken();
    }
    return stmt;
  }

  parseExpression(precedence: Precedence): Expression | null {
    if (!this.curToken) {
      return null;
    }
    const prefix = this.prefixParseFns.get(this.curToken.Type);

    if (!prefix) { 
      return null;
    }
    const leftExp = prefix();
    return leftExp;
  }

  parseIdentifier(): Expression | null {
    if (!this.curToken) {
      return null;
    }

    return new Identifier(this.curToken, this.curToken.Literal);
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

  registerPrefix(tokenType: TokenType, fn: prefixParseFn) {
    this.prefixParseFns.set(tokenType, fn);
  }

  registerInfix(tokenType: TokenType, fn: infixParseFn) {
    this.infixParseFns.set(tokenType, fn);
  }
}