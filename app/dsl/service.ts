import { parseQuery } from "./parser";
import type { Transaction } from "./types";

export interface QueryResult {
  transactions: Transaction[];
  executionInfo: {
    dateBounds: { since?: string; until?: string };
    totalFetched: number;
    totalFiltered: number;
  };
}

// Query execution is now handled by server actions
// This file only contains client-side utilities

/**
 * Validates a query string without executing it
 */
export function validateQuery(queryString: string): { isValid: boolean; error?: string } {
  try {
    const ast = parseQuery(queryString);
    return {
      isValid: ast !== null,
      error: ast === null ? "Failed to parse query" : undefined,
    };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : "Unknown parsing error",
    };
  }
}

// planQuery functionality moved to server action