import { Token } from '../token';

interface Node {
  TokenLiteral: () => string;
}

interface Statement extends Node {
  statementNode: () => void;
}

interface Expression extends Node {
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

class Identifier implements Expression {
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

class LetStatement implements Statement {
  Token: Token;
  Name: Identifier;
  Value: Expression;

  constructor(token: Token, name: Identifier, value: Expression) {
    this.Token = token;
    this.Name = name;
    this.Value = value;
  }

  statementNode() {}
  TokenLiteral(): string {
    return this.Token.Literal;
  }
}
