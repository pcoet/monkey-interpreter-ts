/* eslint-disable object-curly-newline */
import { Parser } from './parser';
import {
  BooleanLiteral,
  CallExpression,
  Expression,
  ExpressionStatement,
  FunctionLiteral,
  Identifier,
  IfExpression,
  InfixExpression,
  IntegerLiteral,
  LetStatement,
  PrefixExpression,
  ReturnStatement,
  Statement,
} from '../ast';
import { Lexer } from '../lexer';

function checkParserErrors(p: Parser): void {
  const errors = p.Errors();
  if (errors.length === 0) {
    return;
  }

  let errMsg = `Parser has ${errors.length} errors:\n`;
  errors.forEach((err, i) => {
    errMsg += `Parser error ${i}: ${err.message}\n`;
  });
  throw new Error(errMsg);
}

function testIntegerLiteral(intLit: Expression, value: number): void {
  if (!(intLit instanceof IntegerLiteral)) {
    throw new Error('Expected object to be instance of IntegerLiteral');
  }
  expect(intLit.Value).toEqual(value);
  expect(intLit.TokenLiteral()).toEqual(value.toString());
}

function testBooleanLiteral(boolLit: Expression, value: boolean): void {
  if (!(boolLit instanceof BooleanLiteral)) {
    throw new Error('Expected object to be instance of BooleanLiteral');
  }
  expect(boolLit.Value).toEqual(value);
  expect(boolLit.TokenLiteral()).toEqual(value.toString());
}

function testIdentifier(ident: Expression, value: string): void {
  if (!(ident instanceof Identifier)) {
    throw new Error('Expected object to be instance of Identifier');
  }
  expect(ident.Value).toEqual(value);
  expect(ident.TokenLiteral()).toEqual(value);
}

type LeftRight = string | number | boolean;

function testLiteralExpression(exp: Expression, expected: LeftRight): void {
  if (!exp) {
    throw new Error('exp must not be falsy');
  }
  const expectedType = typeof expected;
  switch (expectedType) {
    case 'number':
      testIntegerLiteral(exp, expected as number);
      break;
    case 'boolean':
      testBooleanLiteral(exp, expected as boolean);
      break;
    default:
      testIdentifier(exp, expected as string);
  }
}

function testInfixExpression(
  exp: Expression,
  left: LeftRight,
  operator: string,
  right: LeftRight,
): void {
  if (!(exp instanceof InfixExpression)) {
    throw new Error('Expected object to be instance of InfixExpression');
  }
  const { Left, Operator, Right } = exp;
  expect(!!Left && !!Right).toBe(true);
  // On InfixExpression, Left can be undefined and Right can be null or undefined, so we test...
  if (!!Left && !!Right) {
    testLiteralExpression(Left, left);
    expect(Operator).toEqual(operator);
    testLiteralExpression(Right, right);
  }
}

function testLetStatement(s: Statement, name: string): void {
  expect(s.TokenLiteral()).toEqual('let');
  if (!(s instanceof LetStatement)) {
    throw new Error(`${s} must be an instance of LetStatement`);
  }

  if (!s.Name) {
    throw new Error('Name must be defined.');
  }

  expect(s.Name.Value).toEqual(name);
  expect(s.Name.TokenLiteral()).toEqual(name);
}

describe('Parser', () => {
  describe('Test let statements', () => {
    const tests = [
      { input: 'let x = 5;', expectedIdentifier: 'x', expectedValue: 5 },
      { input: 'let y = true;', expectedIdentifier: 'y', expectedValue: true },
      { input: 'let foobar = y;', expectedIdentifier: 'foobar', expectedValue: 'y' },
    ];

    tests.forEach((tt) => {
      test(`${tt.input}`, () => {
        const l = new Lexer(tt.input);
        const p = new Parser(l);
        const program = p.ParseProgram();
        checkParserErrors(p);

        if (program.Statements.length !== 1) {
          throw new Error(`program.Statements does not contain 1 statement. Got ${program.Statements.length}`);
        }

        const stmt = program.Statements[0];
        testLetStatement(stmt, tt.expectedIdentifier);

        if (!(stmt instanceof LetStatement)) {
          throw new Error('Expected instance of LetStatement');
        }

        const val = stmt.Value;

        if (!val) {
          throw new Error('Value must be defined');
        }

        testLiteralExpression(val, tt.expectedValue);
      });
    });
  });

  describe('Test return statements', () => {
    const tests = [
      { input: 'return 5;', expectedValue: 5 },
      { input: 'return true;', expectedValue: true },
      { input: 'return foobar;', expectedValue: 'foobar' },
    ];

    tests.forEach((tt) => {
      test(`${tt.input}`, () => {
        const l = new Lexer(tt.input);
        const p = new Parser(l);
        const program = p.ParseProgram();
        checkParserErrors(p);

        if (program.Statements.length !== 1) {
          throw new Error(`program.Statements does not contain 1 statement. Got ${program.Statements.length}`);
        }

        const stmt = program.Statements[0];

        if (!(stmt instanceof ReturnStatement)) {
          throw new Error(`Expected ${stmt} to be a ReturnStatement`);
        }

        expect(stmt.TokenLiteral()).toEqual('return');

        if (!(stmt.ReturnValue)) {
          throw new Error(`Expected ${stmt} to have a ReturnValue`);
        }

        testLiteralExpression(stmt.ReturnValue, tt.expectedValue);
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

      if (!(stmt instanceof ExpressionStatement)) {
        throw new Error('Expected instance of ExpressionStatement');
      }

      const exp = stmt.Expression;

      if (!(exp instanceof Identifier)) {
        throw new Error('Expected instance of Identifier');
      }

      const ident = exp;
      expect(ident.Value).toEqual('foobar');
      expect(ident.TokenLiteral()).toEqual('foobar');
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

      if (!(stmt instanceof ExpressionStatement)) {
        throw new Error('Expected instance of ExpressionStatement');
      }

      const exp = stmt.Expression;

      if (!(exp instanceof IntegerLiteral)) {
        throw new Error('Expected instance of IntegerLiteral');
      }

      expect(exp.Value).toEqual(5);
      expect(exp.TokenLiteral()).toEqual('5');
    });
  });

  describe('Test parsing prefix expressions', () => {
    const prefixTests = [
      { input: '!5;', operator: '!', value: 5 },
      { input: '-15;', operator: '-', value: 15 },
      { input: '!true;', operator: '!', value: true },
      { input: '!false;', operator: '!', value: false },

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

        if (!(stmt instanceof ExpressionStatement)) {
          throw new Error('Expected instance of ExpressionStatement');
        }

        const exp = stmt.Expression;

        if (!(exp instanceof PrefixExpression)) {
          throw new Error('Expected instance of PrefixExpression');
        }

        expect(exp.Operator).toEqual(tt.operator);
        expect(!!exp.Right).toBe(true);
        // On InfixExpression, Right can be null or undefined, so we test...
        if (exp.Right) {
          testLiteralExpression(exp.Right, tt.value);
        }
      });
    });
  });

  describe('Test parsing infix expressions', () => {
    const infixTests = [
      { input: '5 + 5;', leftValue: 5, operator: '+', rightValue: 5 },
      { input: '5 - 5;', leftValue: 5, operator: '-', rightValue: 5 },
      { input: '5 * 5;', leftValue: 5, operator: '*', rightValue: 5 },
      { input: '5 / 5;', leftValue: 5, operator: '/', rightValue: 5 },
      { input: '5 > 5;', leftValue: 5, operator: '>', rightValue: 5 },
      { input: '5 < 5;', leftValue: 5, operator: '<', rightValue: 5 },
      { input: '5 == 5;', leftValue: 5, operator: '==', rightValue: 5 },
      { input: '5 != 5;', leftValue: 5, operator: '!=', rightValue: 5 },
      { input: 'true == true', leftValue: true, operator: '==', rightValue: true },
      { input: 'true != false', leftValue: true, operator: '!=', rightValue: false },
      { input: 'false == false', leftValue: false, operator: '==', rightValue: false },
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

        if (!(stmt instanceof ExpressionStatement)) {
          throw new Error('Expected instance of ExpressionStatement');
        }
        const exp = stmt.Expression;

        if (!(exp instanceof InfixExpression)) {
          throw new Error('Expected instance of InfixExpression');
        }

        const { leftValue, operator, rightValue } = tt;
        testInfixExpression(exp, leftValue, operator, rightValue);
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
      {
        input: 'true',
        expected: 'true',
      },
      {
        input: 'false',
        expected: 'false',
      },
      {
        input: '3 > 5 == false',
        expected: '((3 > 5) == false)',
      },
      {
        input: '3 < 5 == true',
        expected: '((3 < 5) == true)',
      },
      {
        input: '1 + (2 + 3) + 4',
        expected: '((1 + (2 + 3)) + 4)',
      },
      {
        input: '(5 + 5) * 2',
        expected: '((5 + 5) * 2)',
      },
      {
        input: '2 / (5 + 5)',
        expected: '(2 / (5 + 5))',
      },
      {
        input: '-(5 + 5)',
        expected: '(-(5 + 5))',
      },
      {
        input: '!(true == true)',
        expected: '(!(true == true))',
      },
      {
        input: 'a + add(b * c) + d',
        expected: '((a + add((b * c))) + d)',
      },
      {
        input: 'add(a, b, 1, 2 * 3, 4 + 5, add(6, 7 * 8))',
        expected: 'add(a, b, 1, (2 * 3), (4 + 5), add(6, (7 * 8)))',
      },
      {
        input: 'add(a + b + c * d / f + g)',
        expected: 'add((((a + b) + ((c * d) / f)) + g))',
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

  describe('Test boolean expression', () => {
    const tests = [
      { input: 'true', expectedBoolean: true },
      { input: 'false', expectedBoolean: false },
    ];

    tests.forEach((tt) => {
      const { input, expectedBoolean } = tt;
      test(`${input}`, () => {
        const l = new Lexer(input);
        const p = new Parser(l);
        const program = p.ParseProgram();
        checkParserErrors(p);

        if (program.Statements.length !== 1) {
          throw new Error(`program.Statements does not contain 1 statement. Got ${program.Statements.length}`);
        }

        const stmt = program.Statements[0];

        if (!(stmt instanceof ExpressionStatement)) {
          throw new Error('Expected instance of ExpressionStatement');
        }

        const exp = stmt.Expression;

        if (!(exp instanceof BooleanLiteral)) {
          throw new Error('Expected instance of BooleanLiteral');
        }

        const { Value: boolean } = exp;
        expect(boolean).toEqual(expectedBoolean);
      });
    });
  });

  describe('Test if expression', () => {
    const input = 'if (x < y) { x }';
    test(`${input}`, () => {
      const l = new Lexer(input);
      const p = new Parser(l);
      const program = p.ParseProgram();
      checkParserErrors(p);

      if (program.Statements.length !== 1) {
        throw new Error(`program.Statements does not contain 1 statement. Got ${program.Statements.length}`);
      }

      const stmt = program.Statements[0];

      if (!(stmt instanceof ExpressionStatement)) {
        throw new Error('Expected instance of ExpressionStatement');
      }

      const exp = stmt.Expression;

      if (!(exp instanceof IfExpression)) {
        throw new Error('Expected instance of IfExpression');
      }

      const { Condition, Consequence } = exp;

      if (Condition === undefined) {
        throw new Error('Condition must be initialized');
      }

      testInfixExpression(Condition, 'x', '<', 'y');


      if (Consequence === undefined) {
        throw new Error('Consequence must be initialized');
      }

      expect(Consequence.Statements.length).toEqual(1);
      const consequence = Consequence.Statements[0];

      if (!(consequence instanceof ExpressionStatement)) {
        throw new Error('Expected instance of ExpressionStatement');
      }

      const consequenceExp = consequence.Expression;
      expect(consequenceExp).not.toBeFalsy();
      if (consequenceExp) {
        testIdentifier(consequenceExp, 'x');
      }
      expect(exp.Alternative).toBeFalsy();
    });
  });

  describe('Test if else expression', () => {
    const input = 'if (x < y) { x } else { y }';

    test(`${input}`, () => {
      const l = new Lexer(input);
      const p = new Parser(l);
      const program = p.ParseProgram();
      checkParserErrors(p);

      if (program.Statements.length !== 1) {
        throw new Error(`program.Statements does not contain 1 statement. Got ${program.Statements.length}`);
      }
      const stmt = program.Statements[0];

      if (!(stmt instanceof ExpressionStatement)) {
        throw new Error('Expected instance of ExpressionStatement');
      }

      const exp = stmt.Expression;

      if (!(exp instanceof IfExpression)) {
        throw new Error('Expected instance of IfExpression');
      }

      const { Condition, Consequence } = exp;

      if (Condition === undefined) {
        throw new Error('Condition must be initialized');
      }

      testInfixExpression(Condition, 'x', '<', 'y');

      if (Consequence === undefined) {
        throw new Error('Consequence must be initialized');
      }

      expect(Consequence.Statements.length).toEqual(1);
      const consequence = Consequence.Statements[0];

      if (!(consequence instanceof ExpressionStatement)) {
        throw new Error('Expected instance of ExpressionStatement');
      }

      const consequenceExp = consequence.Expression;
      expect(consequenceExp).not.toBeFalsy();
      if (consequenceExp) {
        testIdentifier(consequenceExp, 'x');
      }

      const { Alternative } = exp;

      if (!(Alternative && Alternative.Statements.length === 1)) {
        throw new Error('Expected Alternative.Statements.length to equal 1');
      }

      const alternative = Alternative.Statements[0];

      if (!(alternative instanceof ExpressionStatement)) {
        throw new Error('Expected instance of ExpressionStatment');
      }

      const alternativeExp = alternative.Expression;
      expect(alternativeExp).not.toBeFalsy();
      if (alternativeExp) {
        testIdentifier(alternativeExp, 'y');
      }
    });
  });

  describe('Test function literal parsing', () => {
    const input = 'fn(x, y) { x + y; }';
    test(`${input}`, () => {
      const l = new Lexer(input);
      const p = new Parser(l);
      const program = p.ParseProgram();
      checkParserErrors(p);

      if (program.Statements.length !== 1) {
        throw new Error(`program.Statements does not contain 1 statement. Got ${program.Statements.length}`);
      }
      const stmt = program.Statements[0];
      if (!(stmt instanceof ExpressionStatement)) {
        throw new Error(`${stmt} is not an ExpressionStatement`);
      }
      const func = stmt.Expression;

      expect(func instanceof FunctionLiteral).toBe(true);
      if (func instanceof FunctionLiteral) {
        if (!func.Parameters) { throw new Error('Parameters must not be null or undefined'); }
        expect(func.Parameters.length).toBe(2);
        if (func.Parameters.length === 2) {
          testLiteralExpression(func.Parameters[0], 'x');
          testLiteralExpression(func.Parameters[1], 'y');
        }
        if (func.Body === undefined) { throw new Error('Body must be initialized'); }
        expect(func.Body.Statements.length).toBe(1);
        const bodyStmt = func.Body.Statements[0];
        expect(bodyStmt instanceof ExpressionStatement).toBe(true);
        if (!(bodyStmt instanceof ExpressionStatement)) { throw new Error(); }
        if (bodyStmt.Expression === undefined) { throw new Error('Expression must be initialized'); }
        testInfixExpression(bodyStmt.Expression, 'x', '+', 'y');
      }
    });
  });

  describe('Test function parameter parsing', () => {
    const tests = [
      { input: 'fn() {};', expectedParams: [] },
      { input: 'fn(x) {};', expectedParams: ['x'] },
      { input: 'fn(x, y, z) {};', expectedParams: ['x', 'y', 'z'] },
    ];

    tests.forEach((tt) => {
      test(`${tt.input}`, () => {
        const l = new Lexer(tt.input);
        const p = new Parser(l);
        const program = p.ParseProgram();
        checkParserErrors(p);

        const stmt = program.Statements[0];
        if (!(stmt instanceof ExpressionStatement)) {
          throw new Error(`${stmt} is not an ExpressionStatement`);
        }
        const func = stmt.Expression;
        if (!(func instanceof FunctionLiteral)) {
          throw new Error(`${func} is not a FunctionLiteral`);
        }

        if (!func.Parameters) {
          throw new Error('Paramaters must not be null or undefined');
        }

        expect(func.Parameters.length).toEqual(tt.expectedParams.length);
        tt.expectedParams.forEach((ident, i) => {
          if (!func.Parameters) {
            throw new Error('Paramaters must not be null or undefined');
          }
          const param = func.Parameters[i];
          if (!param) {
            throw new Error('Param must exist to be tested');
          }
          testLiteralExpression(param, ident);
        });
      });
    });
  });

  describe('Test call expression parsing', () => {
    const input = 'add(1, 2 * 3, 4 + 5);';
    test(`${input}`, () => {
      const l = new Lexer(input);
      const p = new Parser(l);
      const program = p.ParseProgram();
      checkParserErrors(p);

      if (program.Statements.length !== 1) {
        throw new Error(`program.Statements does not contain 1 statement. Got ${program.Statements.length}`);
      }
      const stmt = program.Statements[0];
      if (!(stmt instanceof ExpressionStatement)) {
        throw new Error(`${stmt} is not an ExpressionStatement`);
      }
      const exp = stmt.Expression;
      if (!(exp instanceof CallExpression)) {
        throw new Error(`${exp} is not a CallExpression`);
      }
      testIdentifier(exp.Function, 'add');

      if (!exp.Arguments) {
        throw new Error('Arguments must not be null or undefined');
      }
      expect(exp.Arguments.length).toBe(3);
      testLiteralExpression(exp.Arguments[0], 1);
      testInfixExpression(exp.Arguments[1], 2, '*', 3);
      testInfixExpression(exp.Arguments[2], 4, '+', 5);
    });
  });
});
