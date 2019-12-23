import { newLexer, nextToken } from './lexer';
import { TokenTypes } from '../token/token'

describe('Lexer', () => {
  test('nextToken', () => {
    const input = '=+(){},;';
    const tests = [
      { expectedType: TokenTypes.ASSIGN, expectedLiteral: '=' },
      { expectedType: TokenTypes.PLUS, expectedLiteral: '+' },
      { expectedType: TokenTypes.LPAREN, expectedLiteral: '(' },
      { expectedType: TokenTypes.RPAREN, expectedLiteral: ')' },
      { expectedType: TokenTypes.LBRACE, expectedLiteral: '{' },
      { expectedType: TokenTypes.RBRACE, expectedLiteral: '}' },
      { expectedType: TokenTypes.COMMA, expectedLiteral: ',' },
      { expectedType: TokenTypes.SEMICOLON, expectedLiteral: ';' },
      { expectedType: TokenTypes.EOF, expectedLiteral: '' },
    ];

    const l = newLexer(input);

    tests.forEach((testCase) => {
      const tok = nextToken(l);
      expect(tok.Type).toEqual(testCase.expectedType);
      expect(tok.Literal).toEqual(testCase.expectedLiteral);
    });
  });
});
