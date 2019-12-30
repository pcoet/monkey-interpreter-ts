import { Token } from '../token';

export interface Node {
  TokenLiteral: () => string;
  String: () => string;
}

export interface Statement extends Node {
  statementNode: () => void;
}

export interface Expression extends Node {
  expressionNode: () => void;
}

export class Program implements Node {
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

  String(): string {
    let out = '';
    this.Statements.forEach((s) => {
      out += s.String();
    });
    return out;
  }
}

export class Identifier implements Expression {
  public Token: Token; // the token.IDENT token
  public Value: string;

  constructor(token: Token, value: string) {
    this.Token = token;
    this.Value = value;
  }

  expressionNode() {}
  TokenLiteral(): string { 
    return this.Token.Literal;
  }

  String(): string {
    return this.Value;
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

  String(): string {
    let out = '';
    const Name = this.Name ? this.Name.String() : '';
    out += `${this.TokenLiteral()} `;
    out += `${Name} = `;

    if (this.Value) {
      out += this.Value.String();
    }

    out += ';';
    return out;
  }
}

export class ReturnStatement implements Statement {
  public Token: Token;
  public ReturnValue: Expression | undefined;

  constructor(token: Token, returnValue?: Expression) {
    this.Token = token;
    this.ReturnValue = returnValue;
  }

  statementNode() {}

  public TokenLiteral(): string {
    return this.Token.Literal;
  }

  String(): string {
    let out = '';
    out += `${this.TokenLiteral() }`;

    if (this.ReturnValue) {
      out += this.ReturnValue.String();
    }

    out += ';';
    return out;
  }
}

export class ExpressionStatement implements Statement {
  public Token: Token;
  public Expression: Expression | undefined;

  constructor(token: Token, expression?: Expression) {
    this.Token = token;
    this.Expression = expression;
  }

  statementNode() {}

  public TokenLiteral(): string {
    return this.Token.Literal;
  }

  String(): string {
    if (this.Expression) {
      return this.Expression.String();
    }
    return '';
  }
}