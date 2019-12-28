import { Parser } from './parser';
import { LetStatement, Program, Statement } from '../ast';
import { Lexer } from '../lexer';

describe('Parser', () => {
  const input = `
let x = 5;
let y = 10;
let foobar = 838383;`;

  let l: Lexer;
  let p: Parser;
  let program: Program;

  beforeEach(() => {
    l = new Lexer(input);
    p = new Parser(l);
    program = p.ParseProgram();
    
    const numStatements = program.Statements.length;
    if (numStatements != 3) {
      throw new Error(`Program does not contain 3 statements. Got ${numStatements}`);
    }
  });

  test('Let statements', () => {
    const tests =[
      { expectedIdentifier: 'x' },
      { expectedIdentifier: 'y' },
      { expectedIdentifier: 'foobar' },
    ];

    const testLetStatement = (s: Statement, name: string): void => {
      expect(s.TokenLiteral()).toEqual('let');
      expect(s instanceof LetStatement).toEqual(true);
      if (s instanceof LetStatement && !!s.Name) {
        expect(s.Name.Value).toEqual(name);
        expect(s.Name.TokenLiteral()).toEqual(name);
      }
    };

    tests.forEach((testCase, i) => {
      const stmt = program.Statements[i];
      testLetStatement(stmt, testCase.expectedIdentifier);
    });    
  });
});