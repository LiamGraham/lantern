import { useCallback, useEffect } from 'react';
import { type FetcherWithComponents, useFetcher } from 'react-router';
import { validateQuery } from '~/dsl/parser';
import { debounce } from '~/lib/utils';
import type { Serialized } from '../api/types';
import type { QueryResult, Transaction } from '../dsl/service';

function deserializeQueryResult(result: FetcherWithComponents<Serialized<QueryResult>>['data']): QueryResult {
  if (!result) {
    return {
      success: false,
      error: {
        message: 'Unknown error',
        statusCode: 500,
      }
    };
  }
  if (!result.success) {
    return result
  }

  return {
    ...result,
    transactions: result.transactions.map((serialised: Serialized<Transaction>): Transaction => ({
      ...serialised,
      createdAt: new Date(serialised.createdAt),
    })),
  };
}

export function useDebounceQuery(query: string, delay = 500) {
  const fetcher = useFetcher();

  const debouncedExecuteQuery = useCallback(
    debounce((queryString: string) => {
      const validation = validateQuery(queryString);
      if (!queryString.trim() || !validation.isValid) return;

      const formData = new FormData();
      formData.set('query', queryString);
      fetcher.submit(formData, { method: 'POST' });
    }, delay),
    [],
  );

  useEffect(() => {
    debouncedExecuteQuery(query);
    return () => debouncedExecuteQuery.cancel();
  }, [query, debouncedExecuteQuery]);
  
  const data = deserializeQueryResult(fetcher.data)
  
  return {
    isExecuting: fetcher.state === 'submitting',
    data: data.success ? data : undefined,
    error: !data.success ? data.error.message : undefined,
    cancel: debouncedExecuteQuery.cancel,
    flush: debouncedExecuteQuery.flush,
  };
}
