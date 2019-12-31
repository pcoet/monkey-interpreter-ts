import { Parser } from './parser';
import {
  Expression,
  ExpressionStatement,
  Identifier,
  InfixExpression,
  IntegerLiteral,
  LetStatement,
  PrefixExpression,
  ReturnStatement,
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
      const l = new Lexer(tt.input);
      const p = new Parser(l);
      const program = p.ParseProgram();
      checkParserErrors(p);

      if (program.Statements.length !== 1) {
        throw new Error(`program.Statements does not contain 1 statement. Got ${program.Statements.length}`);
      }

      const stmt = program.Statements[0];
      test('test let statement', () => {
        const name = tt.expectedIdentifier;
        expect(stmt.TokenLiteral()).toEqual('let');
        expect(stmt instanceof LetStatement && !!stmt.Name).toEqual(true);
        if (stmt instanceof LetStatement && !!stmt.Name) {
          expect(stmt.Name.Value).toEqual(name);
          expect(stmt.Name.TokenLiteral()).toEqual(name);
        } 
      });
    });
  });

  describe('Test ReturnStatement', () => {
    const tests = [
      { input: 'return 5;', expectedValue: 5 },
      { input: 'return 10;', expectedValue: 10 },
      { input: 'return 993322;', expectedValue: 993322 },
    ];

    tests.forEach((tt) => {
      test('', () => {
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
        /*
        if (stmt instanceof ReturnStatement) {
          expect(stmt.ReturnValue).toEqual(tt.expectedValue);
        }
        */
      });
    });
  });

  describe('Test Identifier expression', () => {
    test('Identifier expression has the expected Value', () => {
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
  });

  describe('Test integer literal expression', () => {
    test('IntegerLiteral expression has the expected value', () => {
      const input = '5;';
  
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
  });

  describe('Test parsing prefix expressions', () => {
    const t = test;
    const prefixTests = [
      { input: '!5;', operator: '!', integerValue: 5 },
      { input: '-15;', operator: '-', integerValue: 15 },
    ];

    prefixTests.forEach((tt) => {
      test('PrefixExpression has the expected operator and value', () => {
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

  describe('Test parsing infix expressions', () => {
    const t = test;
    const infixTests = [
      { input: '5 + 5;', leftValue: 5, operator: '+', rightValue: 5 },
      { input: '5 - 5;', leftValue: 5, operator: '-', rightValue: 5 },
      { input: '5 * 5;', leftValue: 5, operator: '*', rightValue: 5 },
      { input: '5 / 5;', leftValue: 5, operator: '/', rightValue: 5 },
      { input: '5 > 5;', leftValue: 5, operator: '>', rightValue: 5 },
      { input: '5 < 5;', leftValue: 5, operator: '<', rightValue: 5 },
      { input: '5 == 5;', leftValue: 5, operator: '==', rightValue: 5 },
      { input: '5 != 5;', leftValue: 5, operator: '!=', rightValue: 5 },
    ];
  
    infixTests.forEach((tt) => {
      test('InfixExpression has the expected values and operator', () => {
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
          expect(exp instanceof InfixExpression).toEqual(true);
          if (exp instanceof InfixExpression) {
            testIntegerLiteral(t, exp.Left, tt.leftValue);
            expect(exp.Operator).toEqual(tt.operator);
            testIntegerLiteral(t, exp.Right, tt.rightValue);
          }
        }
      });
    });
  });

  describe('Test operator precedence parsing', () => {
    const tests = [
      {
        input: '-a * b',
        expected: '((-a) * b)',
      },
      {
        input: '!-a',
        expected: '(!(-a))',
      },
      {
        input: 'a + b + c',
        expected: '((a + b) + c)',
      },
      {
        input: 'a + b - c',
        expected: '((a + b) - c)',
      },
      {
        input: 'a * b * c',
        expected: '((a * b) * c)',
      },
      {
        input: 'a * b / c',
        expected: '((a * b) / c)',
      },
      {
        input: 'a + b / c',
        expected: '(a + (b / c))',
      },
      {
        input: 'a + b * c + d / e - f',
        expected: '(((a + (b * c)) + (d / e)) - f)',
      },
      {
        input: '3 + 4; -5 * 5',
        expected: '(3 + 4)((-5) * 5)',
      },
      {
        input: '5 > 4 == 3 < 4',
        expected: '((5 > 4) == (3 < 4))',
      },
      {
        input: '5 < 4 != 3 > 4',
        expected: '((5 < 4) != (3 > 4))',
      },
      {
        input: '3 + 4 * 5 == 3 * 1 + 4 * 5',
        expected: '((3 + (4 * 5)) == ((3 * 1) + (4 * 5)))',
      },
    ];
  
    tests.forEach((tt) => {
      test('Parentheses are added correctly, to indicate precedence', () => {
        const l = new Lexer(tt.input);
        const p = new Parser(l);
        const program = p.ParseProgram();
        checkParserErrors(p);

        const actual = program.String();
      
        expect(actual).toEqual(tt.expected);
      });
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