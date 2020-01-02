import { Lexer } from '../lexer';
import {
  BooleanLiteral,
  Expression,
  ExpressionStatement,
  Identifier,
  InfixExpression,
  IntegerLiteral,
  LetStatement,
  PrefixExpression,
  Program,
  ReturnStatement,
  Statement,
  IfExpression,
  BlockStatement,
} from '../ast';
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

const precedences = new Map<TokenType, Precedence>([
  [TokenType.EQ, Precedence.EQUALS],
  [TokenType.NOT_EQ, Precedence.EQUALS],
  [TokenType.LT, Precedence.LESSGREATER],
  [TokenType.GT, Precedence.LESSGREATER],
  [TokenType.PLUS, Precedence.SUM],
  [TokenType.MINUS, Precedence.SUM],
  [TokenType.SLASH, Precedence.PRODUCT],
  [TokenType.ASTERISK, Precedence.PRODUCT],
]);

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
    this.parseInfixExpression = this.parseInfixExpression.bind(this);
    this.parseExpression = this.parseExpression.bind(this);
    this.parseBoolean = this.parseBoolean.bind(this);
    this.parseGroupedExpression = this.parseGroupedExpression.bind(this);
    this.parseIfExpression = this.parseIfExpression.bind(this);
    this.parseBlockStatement = this.parseBlockStatement.bind(this);
    this.l = lexer;
    this.curToken = this.l.nextToken(); // replaces first call to this.nextToken();
    this.peekToken = this.l.nextToken(); // replaces second call to this.nextToken();
    this.prefixParseFns = new Map();
    this.registerPrefix(TokenType.IDENT, this.parseIdentifier);
    this.registerPrefix(TokenType.INT, this.parseIntegerLiteral);
    this.registerPrefix(TokenType.BANG, this.parsePrefixExpression);
    this.registerPrefix(TokenType.MINUS, this.parsePrefixExpression);
    this.registerPrefix(TokenType.TRUE, this.parseBoolean);
    this.registerPrefix(TokenType.FALSE, this.parseBoolean);
    this.registerPrefix(TokenType.LPAREN, this.parseGroupedExpression);
    this.registerPrefix(TokenType.IF, this.parseIfExpression);
    this.infixParseFns = new Map();
    this.registerInfix(TokenType.PLUS, this.parseInfixExpression);
    this.registerInfix(TokenType.MINUS, this.parseInfixExpression);
    this.registerInfix(TokenType.SLASH, this.parseInfixExpression);
    this.registerInfix(TokenType.ASTERISK, this.parseInfixExpression);
    this.registerInfix(TokenType.EQ, this.parseInfixExpression);
    this.registerInfix(TokenType.NOT_EQ, this.parseInfixExpression);
    this.registerInfix(TokenType.LT, this.parseInfixExpression);
    this.registerInfix(TokenType.GT, this.parseInfixExpression);
  }

  public nextToken(): void {
    this.curToken = this.peekToken;
    this.peekToken = this.l.nextToken();
  }

  public ParseProgram(): Program {
    const program = new Program([]);

    while (this.curToken.Type !== TokenType.EOF) {
      const stmt = this.parseStatement();
      if (stmt !== null) {
        program.Statements.push(stmt);
      }
      this.nextToken();
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

    // TODO: We're skipping the expressions until we encounter a semicolon
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

  noPrefixParseFnError(t: TokenType): void {
    const msg = `No prefix parse function for ${t} found`;
    this.errors.push(new Error(msg));
  }

  parseExpression(precedence: Precedence): Expression | null {
    const prefix = this.prefixParseFns.get(this.curToken.Type);

    if (!prefix) {
      this.noPrefixParseFnError(this.curToken.Type);
      return null;
    }
    let leftExp = prefix();

    while (!this.peekTokenIs(TokenType.SEMICOLON) && precedence < this.peekPrecedence()) {
      const infix = this.infixParseFns.get(this.peekToken.Type);
      if (!infix) {
        return leftExp;
      }

      this.nextToken();

      leftExp = leftExp ? infix(leftExp) : null;
    }

    return leftExp;
  }

  parseIdentifier(): Expression {
    return new Identifier(this.curToken, this.curToken.Literal);
  }

  parseIntegerLiteral(): Expression | null {
    const lit = new IntegerLiteral(this.curToken);
    const value = parseInt(this.curToken.Literal, 10);
    if (Number.isNaN(value)) {
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

  parseBoolean(): Expression {
    return new BooleanLiteral(this.curToken, this.curTokenIs(TokenType.TRUE));
  }

  parseGroupedExpression(): Expression | null {
    this.nextToken();
    const exp = this.parseExpression(Precedence.LOWEST);
    if (!this.expectPeek(TokenType.RPAREN)) {
      return null;
    }
    return exp;
  }

  parseBlockStatement(): BlockStatement {
    const block = new BlockStatement(this.curToken);

    this.nextToken();

    while (!this.curTokenIs(TokenType.RBRACE) && !this.curTokenIs(TokenType.EOF)) {
      const stmt = this.parseStatement();
      if (stmt) {
        block.Statements.push(stmt);
        this.nextToken();
      }
    }

    return block;
  }

  parseIfExpression(): Expression | null {
    const expression = new IfExpression(this.curToken);

    if (!this.expectPeek(TokenType.LPAREN)) {
      return null;
    }

    this.nextToken();

    expression.Condition = this.parseExpression(Precedence.LOWEST) || undefined;

    if (!this.expectPeek(TokenType.RPAREN)) {
      return null;
    }

    if (!this.expectPeek(TokenType.LBRACE)) {
      return null;
    }

    expression.Consequence = this.parseBlockStatement();

    if (this.peekTokenIs(TokenType.ELSE)) {
      this.nextToken();

      if (!this.expectPeek(TokenType.LBRACE)) {
        return null;
      }

      expression.Alternative = this.parseBlockStatement() || undefined;
    }

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
    }
    this.peekError(t);
    return false;
  }

  parseInfixExpression(left: Expression): Expression {
    const expression = new InfixExpression(this.curToken, left, this.curToken.Literal);
    const precedence = this.curPrecedence();

    this.nextToken();

    expression.Right = this.parseExpression(precedence);
    return expression;
  }

  peekError(t: TokenType): void {
    const msg = `Expected next token to be ${t} but got ${this.peekToken?.Type}`;
    this.errors.push(new Error(msg));
  }

  registerPrefix(tokenType: TokenType, fn: prefixParseFn): void {
    this.prefixParseFns.set(tokenType, fn);
  }

  registerInfix(tokenType: TokenType, fn: infixParseFn): void {
    this.infixParseFns.set(tokenType, fn);
  }

  peekPrecedence(): number {
    const p = precedences.get(this.peekToken.Type);
    if (p) {
      return p;
    }
    return Precedence.LOWEST;
  }

  curPrecedence(): number {
    const p = precedences.get(this.curToken.Type);
    if (p) {
      return p;
    }
    return Precedence.LOWEST;
  }
}
