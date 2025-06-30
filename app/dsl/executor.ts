import type { FilterNode, QueryNode } from "./parser";
import type { Transaction } from "./types";

/**
 * Extracts date bounds from a query AST to use as API filters
 */
export function extractDateBounds(ast: QueryNode): { since?: string; until?: string } {
  const sinceDates: Date[] = [];
  const untilDates: Date[] = [];
  
  function collectDates(node: QueryNode): void {
    if (node.type === "filter") {
      const date = convertToDate(node.value, node.valueType);
      if (date) {
        if (node.field === "since") {
          sinceDates.push(date);
        } else if (node.field === "until") {
          untilDates.push(date);
        }
      }
    } else if (node.type === "binaryOp") {
      collectDates(node.left);
      collectDates(node.right);
    }
  }
  
  collectDates(ast);
  
  const result: { since?: string; until?: string } = {};
  
  // Use the earliest "since" date to get the broadest range
  if (sinceDates.length > 0) {
    const earliestSince = new Date(Math.min(...sinceDates.map(d => d.getTime())));
    result.since = earliestSince.toISOString();
  }
  
  // Use the latest "until" date to get the broadest range
  if (untilDates.length > 0) {
    const latestUntil = new Date(Math.max(...untilDates.map(d => d.getTime())));
    result.until = latestUntil.toISOString();
  }
  
  return result;
}

/**
 * Evaluates a full query AST against transaction data
 */
export function evaluateQuery(ast: QueryNode, transactions: Transaction[]): Transaction[] {
  return transactions.filter(transaction => evaluateNode(ast, transaction));
}

/**
 * Evaluates a single AST node against a transaction
 */
function evaluateNode(node: QueryNode, transaction: Transaction): boolean {
  if (node.type === "filter") {
    return evaluateFilter(node, transaction);
  } else if (node.type === "binaryOp") {
    const leftResult = evaluateNode(node.left, transaction);
    const rightResult = evaluateNode(node.right, transaction);
    
    if (node.operator === "AND") {
      return leftResult && rightResult;
    } else {
      return leftResult || rightResult;
    }
  }
  
  return false;
}

/**
 * Evaluates a single filter against a transaction
 */
function evaluateFilter(filter: FilterNode, transaction: Transaction): boolean {
  let result: boolean;
  
  switch (filter.field) {
    case "since":
      result = evaluateDateFilter(filter, transaction, "since");
      break;
    
    case "until":
      result = evaluateDateFilter(filter, transaction, "until");
      break;
    
    case "status":
      result = transaction.attributes.status.toUpperCase() === filter.value.toUpperCase();
      break;
    
    case "category": {
      const categoryId = transaction.relationships.category.data?.id || "";
      const parentCategoryId = transaction.relationships.parentCategory.data?.id || "";
      result = evaluatePatternFilter(filter.value, categoryId) || 
               evaluatePatternFilter(filter.value, parentCategoryId);
      break;
    }
    
    case "amount":
      result = evaluateAmountFilter(filter, transaction);
      break;
    
    case "description":
      result = evaluatePatternFilter(filter.value, transaction.attributes.description);
      break;
    
    case "account":
      result = evaluatePatternFilter(filter.value, transaction.relationships.account.data.id);
      break;
    
    case "type":
      result = evaluatePatternFilter(filter.value, transaction.attributes.transactionType || "")
      break;
    
    default:
      console.warn(`Unknown filter field: ${filter.field}`);
      result = true;
  }
  
  // Apply negation if filter is negated
  return filter.negated ? !result : result;
}

/**
 * Evaluates date filters (since/until)
 */
function evaluateDateFilter(filter: FilterNode, transaction: Transaction, type: "since" | "until"): boolean {
  const filterDate = convertToDate(filter.value, filter.valueType);
  const transactionDate = new Date(transaction.attributes.createdAt);
  
  if (!filterDate) {
    return true;
  }
  
  if (type === "since") {
    return transactionDate >= filterDate;
  } else {
    return transactionDate <= filterDate;
  }
}

/**
 * Evaluates amount filters with comparison operators and ranges
 */
function evaluateAmountFilter(filter: FilterNode, transaction: Transaction): boolean {
  const amount = Math.abs(transaction.attributes.amount.valueInBaseUnits / 100);
  const value = filter.value;
  
  // Handle range expressions like "10..100"
  if (value.includes("..")) {
    const [min, max] = value.split("..").map(v => parseFloat(v));
    return amount >= min && amount <= max;
  }
  
  // Handle comparison operators
  if (value.startsWith(">=")) {
    return amount >= parseFloat(value.slice(2));
  } else if (value.startsWith("<=")) {
    return amount <= parseFloat(value.slice(2));
  } else if (value.startsWith(">")) {
    return amount > parseFloat(value.slice(1));
  } else if (value.startsWith("<")) {
    return amount < parseFloat(value.slice(1));
  } else if (value.startsWith("!=")) {
    return amount !== parseFloat(value.slice(2));
  } else {
    // Exact match
    return amount === parseFloat(value);
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
  
  if (normalizedPattern.includes("*")) {
    const regex = new RegExp(normalizedPattern.replace(/\*/g, ".*"));
    return regex.test(normalizedText);
  } else {
    return normalizedText.includes(normalizedPattern);
  }
}

/**
 * Evaluates transaction type filters
 */
function evaluateTypeFilter(filter: FilterNode, transaction: Transaction): boolean {
  const requestedType = filter.value.toLowerCase();
  const actualType = transaction.attributes.transactionType?.toLowerCase();
  
  return actualType === requestedType;
}

/**
 * Converts date/relative date values to Date objects
 */
function convertToDate(value: string, valueType: string): Date | null {
  if (valueType === "date") {
    return new Date(value);
  } else if (valueType === "relativeDate") {
    const now = new Date();
    const match = value.match(/^(\d+)([dwmy])$/);
    
    if (!match) {
      console.warn(`Invalid relative date format: ${value}`);
      return null;
    }
    
    const amount = parseInt(match[1], 10);
    const unit = match[2];
    
    switch (unit) {
      case "d":
        now.setDate(now.getDate() - amount);
        break;
      case "w":
        now.setDate(now.getDate() - (amount * 7));
        break;
      case "m":
        now.setMonth(now.getMonth() - amount);
        break;
      case "y":
        now.setFullYear(now.getFullYear() - amount);
        break;
    }
    
    return now;
  }
  
  return null;
}