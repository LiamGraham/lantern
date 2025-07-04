import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Input } from '~/components/ui/input';
import { type QueryValidation, validateQuery } from '~/dsl/parser';
import { useDebounceQuery } from '~/hooks';
import type { Route } from '../+types/root';
import { BarGraph } from '../components/charts/bar-graph';
import { TransactionTable } from '../components/transactions';
import { processQuery, type QueryFailureResult } from '../dsl/service';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Lantern' },
    { name: 'description', content: 'Lantern dashboard' },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== 'POST') {
    throw new Response('Method not allowed', { status: 405 });
  }

  const formData = await request.formData();
  const queryString = formData.get('query') as string;

  if (!queryString) {
    const response: QueryFailureResult  = {
      success: false,
      error: {
        message: 'Query is required',
        statusCode: 400,
      }
    }
    return Response.json(
      response,
      { status: response.error.statusCode },
    );
  }

  const queryResult = await processQuery(queryString);

  if (!queryResult.success) {
    return Response.json(
      queryResult,
      { status: queryResult.error.statusCode },
    );
  }

  return Response.json(queryResult);
}

export default function Dashboard() {
  const [query, setQuery] = useState('');
  const [validation, setValidation] = useState<QueryValidation>({
    isValid: true,
  });
  const { isExecuting, data, error } = useDebounceQuery(query);

  useEffect(() => {
    const { isValid, error } = validateQuery(query);
    setValidation({
      isValid: query.length === 0 || isValid,
      error,
    });
  }, [query]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  return (
    <div className="flex flex-1 flex-col p-4 gap-4 h-screen overflow-hidden">
      <div className="relative flex flex-row gap-2 flex-shrink-0">
        <Input
          placeholder="Filter transactions"
          className={clsx(
            'text-xl! min-h-12',
            !validation.isValid &&
              'decoration-wavy underline decoration-red-400',
          )}
          onChange={(e) => setQuery(e.target.value)}
        />
        {validation.error && (
          <div className="absolute top-full left-0 mt-1 bg-red-900 border px-3 py-1 text-sm rounded-md shadow-lg z-10 max-w-md">
            {validation.error}
          </div>
        )}
      </div>

      <div className="flex flex-row gap-4 flex-1 min-h-0">
        <TransactionTable
          data={data}
          isExecuting={isExecuting}
          className="w-3/5 flex-shrink-0"
        />

        <div className="flex-1 min-w-0 border rounded-md p-3">
          <BarGraph data={data} />
        </div>
      </div>
    </div>
  );
}
