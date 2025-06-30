import { createToken, Lexer } from 'chevrotain';

// Boolean operators
export const And = createToken({name: 'AND', pattern: /AND/});
export const Or = createToken({name: 'OR', pattern: /OR/});

// Structural tokens
export const LParen = createToken({name: 'LPAREN', pattern: /\(/});
export const RParen = createToken({name: 'RPAREN', pattern: /\)/});
export const Colon = createToken({name: 'COLON', pattern: /:/});
export const Not = createToken({name: 'NOT', pattern: /!/});

// Filter field names
export const Field = createToken({
  name: 'FIELD', 
  pattern: /(?:since|until|category|status|amount|description|account|type)/
});

// Filter value types

// Range values: 10, >10, <=50, 10..100
export const RangeValue = createToken({
  name: 'RANGE_VALUE',
  pattern: /(?:[><=!]*\d+(?:\.\d+)?(?:\.\.\d+(?:\.\d+)?)?)/
});

// Pattern values: plain strings, wildcards, or quoted strings
export const PatternValue = createToken({
  name: 'PATTERN_VALUE',
  pattern: /(?:"[^"]*"|[*]?[a-zA-Z0-9_-]+[*]?)/
});

// Absolute datetime values: ISO dates
export const DateValue = createToken({
  name: 'DATE_VALUE',
  pattern: /\d{4}-\d{2}-\d{2}/
});

// Relative date values: 7d, 1m, 3y, etc.
export const RelativeDateValue = createToken({
  name: 'RELATIVE_DATE_VALUE',
  pattern: /\d+[dwmy]/
});

// Whitespace (ignored)
const Whitespace = createToken({
  name: 'WHITESPACE',
  pattern: /\s+/,
  group: Lexer.SKIPPED
});

// Ordered token array
export const allTokens = [
  Whitespace,
  And, Or,           // Keywords first
  LParen, RParen, Colon, Not,
  Field,
  DateValue,
  RelativeDateValue,
  RangeValue,
  PatternValue,     // Now handles all text patterns including quoted strings
];

export const lexer = new Lexer(allTokens);
