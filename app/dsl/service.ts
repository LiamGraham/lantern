import { getApiClient } from '../api/client';
import type { CategoryId, RawTransaction } from '../api/types';
import { errorMsg } from '../lib/utils';
import { evaluateQuery, extractDateBounds } from './executor';
import { parseQuery } from './parser';

export interface Transaction {
  id: string;
  status: RawTransaction['attributes']['status'];
  description: string;
  amount: number;
  createdAt: Date;
  type: string | null;
  accountId: string;
  categoryId: CategoryId;
  parentCategoryId: CategoryId;
}

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

function transformTransaction(target: RawTransaction): Transaction {
  return {
    id: target.id,
    status: target.attributes.status,
    description: target.attributes.description,
    amount: target.attributes.amount.valueInBaseUnits / 100,
    createdAt: new Date(target.attributes.createdAt),
    type: target.attributes.transactionType,
    accountId: target.relationships.account.data.id,
    categoryId: target.relationships.category.data?.id as CategoryId,
    parentCategoryId: target.relationships.parentCategory.data?.id as CategoryId,
  };
}

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
    const transactions = evaluateQuery(ast, response.data)
      .reverse()
      .map(transformTransaction);

    return {
      success: true,
      transactions,
      metadata: {
        dateBounds,
        totalFetched: response.data.length,
        totalFiltered: transactions.length,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: errorMsg(error),
        statusCode: 500,
      },
    };
  }
}
