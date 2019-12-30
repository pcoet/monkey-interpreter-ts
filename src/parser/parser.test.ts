import { Parser } from './parser';
import {
  Expression,
  ExpressionStatement,
  Identifier,
  IntegerLiteral,
  LetStatement,
  PrefixExpression,
  ReturnStatement,
  Statement,
} from '../ast';
import { Lexer } from '../lexer';

describe('Parser', () => {
  describe('Test LetStatement', () => {
    const tests = [
      { input: 'let x = 5;', expectedIdentifier: 'x', expectedValue: 5 },
      { input: 'let y = 10;', expectedIdentifier: 'y', expectedValue: 10 },
      { input: 'let foobar = 838383;', expectedIdentifier: 'foobar', expectedValue: 838383 },
    ];

    tests.forEach((tt) => {
      const t = test;
      const l = new Lexer(tt.input);
      const p = new Parser(l);
      const program = p.ParseProgram();
      checkParserErrors(p);

      if (program.Statements.length !== 1) {
        throw new Error(`program.Statements does not contain 1 statement. Got ${program.Statements.length}`);
      }

      const stmt = program.Statements[0];
      testLetStatement(t, stmt, tt.expectedIdentifier);

      if (!(stmt instanceof LetStatement)) {
        throw new Error('Expected instance of LetStatement');
      }
    });
  });

  describe('Test ReturnStatement', () => {
    const tests = [
      { input: 'return 5;', expectedValue: 5 },
      { input: 'return 10;', expectedValue: 10 },
      { input: 'return 993322;', expectedValue: 993322 },
    ];

    tests.forEach((tt) => {
      const l = new Lexer(tt.input);
      const p = new Parser(l);
      const program = p.ParseProgram();
      checkParserErrors(p);

      if (program.Statements.length !== 1) {
        throw new Error(`program.Statements does not contain 1 statement. Got ${program.Statements.length}`);
      }

      const stmt = program.Statements[0];
      expect(stmt instanceof ReturnStatement).toEqual(true);
      expect(stmt.TokenLiteral()).toEqual('return');
    });
  });

  describe('Test identifier expression', () => {
    const input = 'foobar;';

    const l = new Lexer(input);
    const p = new Parser(l);
    const program = p.ParseProgram();
    checkParserErrors(p);

    if (program.Statements.length !== 1) {
      throw new Error(`program.Statements does not contain 1 statement. Got ${program.Statements.length}`);
    }

    const stmt = program.Statements[0];
    expect(stmt instanceof ExpressionStatement).toEqual(true);
    
    if (stmt instanceof ExpressionStatement) {
      expect(stmt.Expression instanceof Identifier);
      if (stmt.Expression instanceof Identifier) {
        const ident = stmt.Expression;
        expect(ident.Value).toEqual('foobar');
        expect(ident.TokenLiteral()).toEqual('foobar');
      }
    }
  });

  describe('Test integer literal expression', () => {
    const input = "5;";
  
    const l = new Lexer(input);
    const p = new Parser(l);
    const program = p.ParseProgram();
    checkParserErrors(p);
  
    if (program.Statements.length !== 1) {
      throw new Error(`program.Statements does not contain 1 statement. Got ${program.Statements.length}`);
    }
  
    const stmt = program.Statements[0];
    expect(stmt instanceof ExpressionStatement).toEqual(true);
  
    if (stmt instanceof ExpressionStatement) {
      expect(stmt.Expression instanceof IntegerLiteral);
      if (stmt.Expression instanceof IntegerLiteral) {
        const literal = stmt.Expression;
        expect(literal.Value).toEqual(5);
        expect(literal.TokenLiteral()).toEqual('5');
      }
    }
  });

  describe('Test parsing prefix expressions', () => {
    const t = test;
    const prefixTests = [
      { input: '!5;', operator: '!', integerValue: 5 },
      { input: '-15;', operator: '-', integerValue: 15 },
    ];

    prefixTests.forEach((tt) => {
      const l = new Lexer(tt.input);
      const p = new Parser(l);
      const program = p.ParseProgram();
      checkParserErrors(p);

      if (program.Statements.length !== 1) {
        throw new Error(`program.Statements does not contain 1 statement. Got ${program.Statements.length}`);
      }

      const stmt = program.Statements[0];
      expect(stmt instanceof ExpressionStatement).toEqual(true);
      if (stmt instanceof ExpressionStatement) {
        const exp = stmt.Expression;
        expect(exp instanceof PrefixExpression).toEqual(true);
        if (exp instanceof PrefixExpression) {
          expect(exp.Operator).toEqual(tt.operator);
          testIntegerLiteral(t, exp.Right, tt.integerValue);
        }
      }
    });
  });
});

function checkParserErrors(p: Parser): void {  
  const errors = p.Errors();
  if (errors.length === 0) {
    return;
  }

  let errMsg = '';
  errors.forEach((err, i) => {
    errMsg += `Parser error ${i}: ${err.message}`;
  });
  throw new Error(errMsg);
};

function testLetStatement(t: jest.It, s: Statement, name: string): void {
  t('test let statement', () => {
    expect(s.TokenLiteral()).toEqual('let');
    expect(s instanceof LetStatement && !!s.Name).toEqual(true);
    if (s instanceof LetStatement && !!s.Name) {
      expect(s.Name.Value).toEqual(name);
      expect(s.Name.TokenLiteral()).toEqual(name);
    } 
  });
}

// TODO: implement
function testLiteralExpression(t: jest.It, exp: Expression, expected: any) {
  console.log(`test: ${test}; exp: ${exp}; expected: ${expected}`);
};

function testIntegerLiteral(t: jest.It, il: Expression | undefined | null, value: number): void {
  expect(il instanceof IntegerLiteral).toBe(true);
  if (il instanceof IntegerLiteral) {
    const integ = il;
    expect(integ.Value).toEqual(value);
    expect(integ.TokenLiteral()).toEqual(value.toString());
  }
}