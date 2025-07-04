import { type CstNode, CstParser, type IToken } from 'chevrotain';
import { errorMsg } from '../lib/utils';
import {
  And,
  allTokens,
  BooleanValue,
  Colon,
  DateValue,
  Field,
  LParen,
  lexer,
  Not,
  Or,
  PatternValue,
  RangeValue,
  RelativeDateValue,
  RParen,
} from './lexer';

// AST Node Types
export interface FilterNode {
  type: 'filter';
  field: string;
  value: string;
  valueType: 'range' | 'pattern' | 'date' | 'relativeDate' | 'boolean';
  negated: boolean;
}

export interface BinaryOpNode {
  type: 'binaryOp';
  operator: 'AND' | 'OR';
  left: QueryNode;
  right: QueryNode;
  negated: boolean;
}

export type QueryValidation = {
  isValid: boolean;
  error?: string;
};

export type QueryNode = FilterNode | BinaryOpNode;

class DSLParser extends CstParser {
  constructor() {
    super(allTokens);
    this.performSelfAnalysis();
  }

  // Main entry point - a query is an OR expression
  public query = this.RULE('query', () => {
    this.SUBRULE(this.orExpression);
  });

  // OR has lower precedence than AND
  private orExpression = this.RULE('orExpression', () => {
    this.SUBRULE(this.andExpression, { LABEL: 'lhs' });
    this.MANY(() => {
      this.CONSUME(Or);
      this.SUBRULE2(this.andExpression, { LABEL: 'rhs' });
    });
  });

  // AND has higher precedence than OR
  private andExpression = this.RULE('andExpression', () => {
    this.SUBRULE(this.atomicExpression, { LABEL: 'lhs' });
    this.MANY(() => {
      // Implicit AND (no token) or explicit AND
      this.OPTION(() => {
        this.CONSUME(And);
      });
      this.SUBRULE2(this.atomicExpression, { LABEL: 'rhs' });
    });
  });

  // Atomic expressions: filters or parenthesized expressions
  private atomicExpression = this.RULE('atomicExpression', () => {
    this.OR([
      // Negated or regular parenthesized expression
      {
        ALT: () => {
          this.OPTION(() => {
            this.CONSUME(Not);
          });
          this.CONSUME(LParen);
          this.SUBRULE(this.orExpression);
          this.CONSUME(RParen);
        },
      },
      // Filter expression
      {
        ALT: () => {
          this.SUBRULE(this.filter);
        },
      },
    ]);
  });

  // Filter: [!]field:value
  private filter = this.RULE('filter', () => {
    this.OPTION(() => {
      this.CONSUME(Not);
    });
    this.CONSUME(Field);
    this.CONSUME(Colon);
    this.OR([
      { ALT: () => this.CONSUME(RangeValue) },
      { ALT: () => this.CONSUME(DateValue) },
      { ALT: () => this.CONSUME(RelativeDateValue) },
      { ALT: () => this.CONSUME(BooleanValue) },
      { ALT: () => this.CONSUME(PatternValue) },
    ]);
  });
}

// Create parser instance
export const parser = new DSLParser();

// CST to AST Visitor
class DSLInterpreter {
  visit(cstNode: CstNode): QueryNode {
    switch (cstNode.name) {
      case 'query':
        if (!cstNode.children.orExpression?.[0]) {
          throw new Error('Query node missing orExpression child');
        }
        return this.visit(cstNode.children.orExpression[0] as CstNode);

      case 'orExpression':
        return this.visitOrExpression(cstNode);

      case 'andExpression':
        return this.visitAndExpression(cstNode);

      case 'atomicExpression':
        if (cstNode.children.filter) {
          return this.visit(cstNode.children.filter[0] as CstNode);
        } else if (cstNode.children.orExpression) {
          // Parenthesized expression (possibly negated)
          const negated = !!cstNode.children.NOT;
          const subExpression = this.visit(
            cstNode.children.orExpression[0] as CstNode,
          );

          // If negated, wrap the sub-expression with negation
          if (negated) {
            if (subExpression.type === 'binaryOp') {
              return { ...subExpression, negated: true };
            } else {
              return { ...subExpression, negated: true };
            }
          }

          return subExpression;
        } else {
          throw new Error('AtomicExpression node missing expected children');
        }

      case 'filter':
        return this.visitFilter(cstNode);

      default:
        throw new Error(`Unknown node type: ${cstNode.name}`);
    }
  }

  private visitOrExpression(cstNode: CstNode): QueryNode {
    const lhs = this.visit(cstNode.children.lhs[0] as CstNode);

    if (!cstNode.children.rhs) {
      return lhs;
    }

    // Build right-associative OR chain
    let result = lhs;
    for (const rhsNode of cstNode.children.rhs) {
      result = {
        type: 'binaryOp',
        operator: 'OR',
        left: result,
        right: this.visit(rhsNode as CstNode),
        negated: false,
      };
    }

    return result;
  }

  private visitAndExpression(cstNode: CstNode): QueryNode {
    const lhs = this.visit(cstNode.children.lhs[0] as CstNode);

    if (!cstNode.children.rhs) {
      return lhs;
    }

    // Build right-associative AND chain
    let result = lhs;
    for (const rhsNode of cstNode.children.rhs) {
      result = {
        type: 'binaryOp',
        operator: 'AND',
        left: result,
        right: this.visit(rhsNode as CstNode),
        negated: false,
      };
    }

    return result;
  }

  private visitFilter(cstNode: CstNode): FilterNode {
    const negated = !!cstNode.children.NOT;
    const field = (cstNode.children.FIELD[0] as IToken).image;

    let value: string;
    let valueType: 'range' | 'pattern' | 'date' | 'relativeDate' | 'boolean';

    if (cstNode.children.RANGE_VALUE) {
      value = (cstNode.children.RANGE_VALUE[0] as IToken).image;
      valueType = 'range';
    } else if (cstNode.children.DATE_VALUE) {
      value = (cstNode.children.DATE_VALUE[0] as IToken).image;
      valueType = 'date';
    } else if (cstNode.children.RELATIVE_DATE_VALUE) {
      value = (cstNode.children.RELATIVE_DATE_VALUE[0] as IToken).image;
      valueType = 'relativeDate';
    } else if (cstNode.children.BOOLEAN_VALUE) {
      value = (cstNode.children.BOOLEAN_VALUE[0] as IToken).image;
      valueType = 'boolean';
    } else {
      value = (cstNode.children.PATTERN_VALUE[0] as IToken).image;
      valueType = 'pattern';
    }

    return {
      type: 'filter',
      field,
      value,
      valueType,
      negated,
    };
  }
}

export const interpreter = new DSLInterpreter();

// Field-value type validation rules
const FIELD_VALUE_RULES = {
  since: ['date', 'relativeDate'],
  until: ['date', 'relativeDate'],
  amount: ['range'],
  status: ['pattern'],
  category: ['pattern'],
  description: ['pattern'],
  account: ['pattern'],
  type: ['pattern'],
  credit: ['boolean'],
  debit: ['boolean'],
} as const;

/**
 * Validates the semantic correctness of an AST node
 */
function validateAST(node: QueryNode): string | null {
  if (node.type === 'filter') {
    const allowedTypes =
      FIELD_VALUE_RULES[node.field as keyof typeof FIELD_VALUE_RULES];
    const isAllowed = allowedTypes?.includes(node.valueType) ?? false;
    if (!isAllowed) {
      const formattedTypes =
        allowedTypes.length === 1
          ? allowedTypes[0]
          : `${allowedTypes.slice(0, -1).join(',')} or ${allowedTypes.at(-1)}`;
      return `Filter '${node.field}' must use ${formattedTypes} value, not ${node.valueType}`;
    }
  } else if (node.type === 'binaryOp') {
    return validateAST(node.left) || validateAST(node.right);
  }

  return null;
}

export function parseQuery(queryString: string): QueryNode | null {
  const lexingResult = lexer.tokenize(queryString);

  if (lexingResult.errors.length > 0) {
    return null;
  }

  parser.input = lexingResult.tokens;
  const cst = parser.query();

  if (parser.errors.length > 0) {
    return null;
  }

  return interpreter.visit(cst);
}

/**
 * Validates a query string without executing it
 */
export function validateQuery(queryString: string): QueryValidation {
  try {
    const ast = parseQuery(queryString);
    if (!ast) {
      return { isValid: false };
    }

    const semanticError = validateAST(ast);
    if (semanticError) {
      return { isValid: false, error: semanticError };
    }

    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error: errorMsg(error),
    };
  }
}
