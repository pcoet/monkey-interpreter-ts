import { Lexer } from '../lexer';
import { Identifier, LetStatement, Program, Statement, ReturnStatement, Expression, ExpressionStatement, IntegerLiteral, PrefixExpression } from '../ast';
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
  curToken: Token;
  peekToken: Token;
  errors: Error[] = [];

  prefixParseFns: Map<TokenType, prefixParseFn>;
  infixParseFns: Map<TokenType, infixParseFn>;

  constructor(lexer: Lexer) {
    this.parseIdentifier = this.parseIdentifier.bind(this);
    this.parseIntegerLiteral = this.parseIntegerLiteral.bind(this);
    this.parsePrefixExpression = this.parsePrefixExpression.bind(this);
    this.l = lexer;
    this.curToken = this.l.nextToken(); // replaces first call to this.nextToken();
    this.peekToken = this.l.nextToken(); // replaces second call to this.nextToken();
    this.prefixParseFns = new Map();
    this.registerPrefix(TokenType.IDENT, this.parseIdentifier);
    this.registerPrefix(TokenType.INT, this.parseIntegerLiteral);
    this.registerPrefix(TokenType.BANG, this.parsePrefixExpression);
    this.registerPrefix(TokenType.MINUS, this.parsePrefixExpression);
    this.infixParseFns = new Map();
  }

  public nextToken() {
    this.curToken = this.peekToken;
    this.peekToken = this.l.nextToken();
  }

  public ParseProgram(): Program {
    const program = new Program([]);

    while(this.curToken.Type !== TokenType.EOF) {
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

  parseReturnStatement(): ReturnStatement {    
    const stmt = new ReturnStatement(this.curToken);
    this.nextToken();

    // TODO: We're skipping the expressions until we // encounter a semicolon
    while (!this.curTokenIs(TokenType.SEMICOLON)) {
      this.nextToken();
    }
    return stmt;
  }

  parseExpressionStatement(): ExpressionStatement {
    const stmt = new ExpressionStatement(this.curToken);

    stmt.Expression = this.parseExpression(Precedence.LOWEST) || undefined;
    
    if (this.peekTokenIs(TokenType.SEMICOLON)) {
      this.nextToken();
    }
    return stmt;
  }

  noPrefixParseFnError(t: TokenType) {
    const msg = `No prefix parse function for ${t} found`;
    this.errors.push(new Error(msg));
  }

  parseExpression(precedence: Precedence): Expression | null {
    const prefix = this.prefixParseFns.get(this.curToken.Type);

    if (!prefix) {
      this.noPrefixParseFnError(this.curToken.Type);
      return null;
    }
    const leftExp = prefix();
    return leftExp;
  }

  parseIdentifier(): Expression {
    return new Identifier(this.curToken, this.curToken.Literal);
  }

  parseIntegerLiteral(): Expression | null {
    const lit = new IntegerLiteral(this.curToken);
    const value = parseInt(this.curToken.Literal);
    if(value === NaN) {
      this.errors.push(Error(`Could not parse ${this.curToken.Literal} as an integer`));
      return null;
    }
    lit.Value = value;
    return lit;
  }

  parsePrefixExpression(): Expression {
    const expression = new PrefixExpression(this.curToken, this.curToken.Literal);
    this.nextToken();

    expression.Right = this.parseExpression(Precedence.PREFIX);
    return expression;
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