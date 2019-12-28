import { Parser } from './parser';
import { LetStatement, ReturnStatement, Statement, Expression } from '../ast';
import { Lexer } from '../lexer';

describe('Parser', () => {
  describe('Test LetStatement', () => {
    const t = test;
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
      testLetStatement(t, stmt, tt.expectedIdentifier);

      if (!(stmt instanceof LetStatement)) {
        throw new Error('Expected instance of LetStatement');
      }
    });
  });

  describe('Test ReturnStatement', () => {
    const t = test;
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