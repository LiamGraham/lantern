import type { RawTransaction } from '../api/types';
import type { FilterNode, QueryNode } from './parser';

/**
 * Extracts date bounds from a query AST to use as API filters
 */
export function extractDateBounds(ast: QueryNode): {
  since?: string;
  until?: string;
} {
  const sinceDates: Date[] = [];
  const untilDates: Date[] = [];

  function collectDates(node: QueryNode): void {
    if (node.type === 'filter') {
      const date = convertToDate(node.value, node.valueType);
      if (date) {
        if (node.field === 'since') {
          sinceDates.push(date);
        } else if (node.field === 'until') {
          untilDates.push(date);
        }
      }
    } else if (node.type === 'binaryOp') {
      collectDates(node.left);
      collectDates(node.right);
    }
  }

  collectDates(ast);

  const result: { since?: string; until?: string } = {};

  // Use the earliest "since" date to get the broadest range
  if (sinceDates.length > 0) {
    const earliestSince = new Date(
      Math.min(...sinceDates.map((d) => d.getTime())),
    );
    result.since = earliestSince.toISOString();
  }

  // Use the latest "until" date to get the broadest range
  if (untilDates.length > 0) {
    const latestUntil = new Date(
      Math.max(...untilDates.map((d) => d.getTime())),
    );
    result.until = latestUntil.toISOString();
  }

  return result;
}

/**
 * Evaluates a full query AST against transaction data
 */
export function evaluateQuery(
  ast: QueryNode,
  transactions: RawTransaction[],
): RawTransaction[] {
  return transactions.filter((transaction) => evaluateNode(ast, transaction));
}

/**
 * Evaluates a single AST node against a transaction
 */
function evaluateNode(node: QueryNode, transaction: RawTransaction): boolean {
  if (node.type === 'filter') {
    return evaluateFilter(node, transaction);
  } else if (node.type === 'binaryOp') {
    const leftResult = evaluateNode(node.left, transaction);
    const rightResult = evaluateNode(node.right, transaction);

    let result: boolean;
    if (node.operator === 'AND') {
      result = leftResult && rightResult;
    } else {
      result = leftResult || rightResult;
    }

    // Apply negation if the binary operation is negated
    return node.negated ? !result : result;
  }

  return false;
}

/**
 * Evaluates a single filter against a transaction
 */
function evaluateFilter(filter: FilterNode, transaction: RawTransaction): boolean {
  let result: boolean;

  switch (filter.field) {
    case 'since':
    case 'until':
      result = evaluateDateFilter(filter, transaction);
      break;

    case 'status':
      result =
        transaction.attributes.status.toUpperCase() ===
        filter.value.toUpperCase();
      break;

    case 'category': {
      const categoryId = transaction.relationships.category.data?.id || '';
      const parentCategoryId =
        transaction.relationships.parentCategory.data?.id || '';
      result =
        evaluatePatternFilter(filter.value, categoryId) ||
        evaluatePatternFilter(filter.value, parentCategoryId);
      break;
    }

    case 'amount':
      result = evaluateAmountFilter(filter, transaction);
      break;

    case 'description':
      result = evaluatePatternFilter(
        filter.value,
        transaction.attributes.description,
      );
      break;

    case 'account':
      result = evaluatePatternFilter(
        filter.value,
        transaction.relationships.account.data.id,
      );
      break;

    case 'type':
      result = evaluatePatternFilter(
        filter.value,
        transaction.attributes.transactionType || '',
      );
      break;

    case 'credit':
    case 'debit':
      result = evaluateAmountSignFilter(filter, transaction);
      break;

    default:
      console.warn(`Unknown filter field: ${filter.field}`);
      result = false;
  }

  // Apply negation if filter is negated
  return filter.negated ? !result : result;
}

/**
 * Evaluates date filters (since/until)
 */
function evaluateDateFilter(
  filter: FilterNode,
  transaction: RawTransaction,
): boolean {
  const dateType = filter.field;
  const filterDate = convertToDate(filter.value, filter.valueType);
  const transactionDate = new Date(transaction.attributes.createdAt);

  if (!filterDate) {
    return true;
  }

  if (dateType === 'since') {
    return transactionDate >= filterDate;
  } else {
    return transactionDate <= filterDate;
  }
}

/**
 * Evaluates amount filters with comparison operators and ranges
 */
function evaluateAmountFilter(
  filter: FilterNode,
  transaction: RawTransaction,
): boolean {
  const amount = Math.abs(transaction.attributes.amount.valueInBaseUnits / 100);
  const value = filter.value;

  // Handle range expressions like "10..100"
  if (value.includes('..')) {
    const [min, max] = value.split('..').map((v) => parseFloat(v));
    return amount >= min && amount <= max;
  }

  // No need for more specific regex as format of range already established by lexer
  const segments = value.match(/^([><=!])*(.+)$/);
  if (!segments) {
    console.warn('Value cannot be parsed as range');
    return false;
  }

  const operator = segments[1] || '';
  const floatValue = Number.parseFloat(segments[2]);

  switch (operator) {
    case '>=':
      return amount >= floatValue;
    case '<=':
      return amount <= floatValue;
    case '>':
      return amount > floatValue;
    case '<':
      return amount < floatValue;
    case '!=':
      return amount !== floatValue;
    default:
      // Exact match
      return amount === floatValue;
  }
}

/**
 * Evaluates pattern filters with wildcard support and quoted strings
 */
function evaluatePatternFilter(pattern: string, text: string): boolean {
  let normalizedPattern = pattern.toLowerCase();
  const normalizedText = text.toLowerCase();

  // Handle quoted strings - strip quotes
  if (normalizedPattern.startsWith('"') && normalizedPattern.endsWith('"')) {
    normalizedPattern = normalizedPattern.slice(1, -1);
  }

  if (normalizedPattern.includes('*')) {
    const regex = new RegExp(normalizedPattern.replace(/\*/g, '.*'));
    return regex.test(normalizedText);
  } else {
    return normalizedText.includes(normalizedPattern);
  }
}

/**
 * Evaluates credit/debit filters based on amount sign
 */
function evaluateAmountSignFilter(
  filter: FilterNode,
  transaction: RawTransaction,
): boolean {
  const requestedValue = filter.value.toLowerCase();
  const isPositive = transaction.attributes.amount.valueInBaseUnits > 0;

  // Validate input
  if (requestedValue !== 'true' && requestedValue !== 'false') {
    console.warn(
      `${filter.field} filter only accepts 'true' or 'false', got: ${filter.value}`,
    );
    return true;
  }

  const isTrue = requestedValue === 'true';
  const isCredit = filter.field === 'credit';
  return isCredit === isTrue ? isPositive : !isPositive;
}

/**
 * Converts date/relative date values to Date objects
 */
function convertToDate(value: string, valueType: string): Date | null {
  if (valueType === 'date') {
    return new Date(value);
  } else if (valueType === 'relativeDate') {
    const now = new Date();
    const match = value.match(/^(\d+)([dwmy])$/);

    if (!match) {
      console.warn(`Invalid relative date format: ${value}`);
      return null;
    }

    const amount = Number.parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 'd':
        now.setDate(now.getDate() - amount);
        break;
      case 'w':
        now.setDate(now.getDate() - amount * 7);
        break;
      case 'm':
        now.setMonth(now.getMonth() - amount);
        break;
      case 'y':
        now.setFullYear(now.getFullYear() - amount);
        break;
    }

    return now;
  }

  return null;
}
