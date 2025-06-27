import moo from 'moo';

const rules: moo.Rules = {
  WS: /[ \t]+/,
  number: /0|[1-9][0-9]*/,
  string: /"(?:\\["\\]|[^\n"\\])*"/,
  lparen: '(',
  rparen: ')',
  keyword: ['AND', 'OR', 'NOT'],
  operator: [':', '>', '<', '=', '!='],
  identifier: /[a-zA-Z_][a-zA-Z0-9_]*/,
};

const lexer = moo.compile(rules);