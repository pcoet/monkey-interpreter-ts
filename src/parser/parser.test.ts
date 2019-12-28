import { Parser } from './parser';
import { LetStatement, Program, Statement, Expression } from '../ast';
import { Lexer } from '../lexer';

describe('Parser', () => {
  describe('Test let statements', () => {
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
    expect(s.TokenLiteral()).toEqual('let'); // 1) token literal is set to 'let'
    expect(s instanceof LetStatement && !!s.Name).toEqual(true); // 2) s is a LetStatement
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