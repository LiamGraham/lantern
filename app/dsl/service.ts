import { getApiClient } from '../api/client';
import { errorMsg } from '../lib/utils';
import { evaluateQuery, extractDateBounds } from './executor';
import { parseQuery } from './parser';
import type { Transaction } from './types';

export interface QuerySuccessResult {
  success: true;
  transactions: Transaction[];
  metadata: {
    dateBounds: { since?: string; until?: string };
    totalFetched: number;
    totalFiltered: number;
  };
}

export interface QueryFailureResult {
  success: false;
  error: {
    message: string;
    statusCode: number;
  };
}

export type QueryResult = QuerySuccessResult | QueryFailureResult;

export async function processQuery(queryString: string): Promise<QueryResult> {
  try {
    const ast = parseQuery(queryString);

    if (!ast) {
      return {
        success: false,
        error: {
          message: 'Failed to parse query',
          statusCode: 400,
        },
      };
    }

    // Extract date bounds to optimize the API call
    const dateBounds = extractDateBounds(ast);

    // Create API client and fetch data using date filters to bound the dataset
    const apiClient = getApiClient();
    const response = await apiClient.getAllTransactions(dateBounds);

    // Apply the full query logic client-side
    const filteredTransactions = evaluateQuery(ast, response.data);

    return {
      success: true,
      transactions: filteredTransactions,
      metadata: {
        dateBounds,
        totalFetched: response.data.length,
        totalFiltered: filteredTransactions.length,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: errorMsg(error),
        statusCode: 500,
      }
    }
  }
}
