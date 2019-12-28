import { Token } from '../token';

export interface Node {
  TokenLiteral: () => string;
}

export interface Statement extends Node {
  statementNode: () => void;
}

export interface Expression extends Node {
  expressionNode: () => void;
}

export class Program {
  Statements: Statement[];

  constructor(statements: Statement[]) {
    this.Statements = statements;
  }

  TokenLiteral(): string {
    if (this.Statements.length > 0) {
      return this.Statements[0].TokenLiteral()
    } else {
      return "" }
  }
}

export class Identifier implements Expression {
  Token: Token; // the token.IDENT token
  Value: string;

  constructor(token: Token, value: string) {
    this.Token = token;
    this.Value = value;
  }

  expressionNode() {}
  TokenLiteral(): string { 
    return this.Token.Literal;
  }
}

export class LetStatement implements Statement {
  public Token: Token;
  public Name: Identifier | undefined;
  public Value: Expression | undefined;

  constructor(token: Token, name?: Identifier, value?: Expression) {
    this.Token = token;
    this.Name = name;
    this.Value = value;
  }

  statementNode() {}

  public TokenLiteral(): string {
    return this.Token.Literal;
  }
}
