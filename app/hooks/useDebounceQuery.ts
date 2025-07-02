import { useCallback, useEffect } from 'react';
import { useFetcher } from 'react-router';
import { validateQuery } from '~/dsl/parser';
import { debounce } from '~/lib/utils';
import type { QueryResult } from '../dsl/service';

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
  
  return {
    isExecuting: fetcher.state === 'submitting',
    data: fetcher.data as QueryResult,
    error: fetcher.data?.error,
    cancel: debouncedExecuteQuery.cancel,
    flush: debouncedExecuteQuery.flush,
  };
}
