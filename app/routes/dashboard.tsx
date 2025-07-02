import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Input } from '~/components/ui/input';
import { type QueryValidation, validateQuery } from '~/dsl/parser';
import { useDebounceQuery } from '~/hooks';
import type { Route } from '../+types/root';
import { TransactionTable } from '../components/transactions';
import { processQuery } from '../dsl/service';

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
    return Response.json({ error: 'Query is required' }, { status: 400 });
  }

  const queryResult = await processQuery(queryString);

  if (!queryResult.success) {
    return Response.json(
      {
        error: queryResult.error.message,
      },
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
    const {isValid, error} = validateQuery(query)
    setValidation({
      isValid: query.length === 0 || isValid,
      error,
    })
  }, [query]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  return (
    <div className="flex flex-1 flex-col p-4 gap-4">
      <div className="relative flex flex-row gap-2">
        <Input
          placeholder="Filter transactions"
          className={
            validation.isValid ? '' : 'decoration-wavy underline decoration-red-400'
          }
          onChange={(e) => setQuery(e.target.value)}
        />
        {validation.error && (
          <div className="absolute top-full left-0 mt-1 bg-red-900 border px-3 py-1 text-sm rounded-md shadow-lg z-10 max-w-md">
            {validation.error}
          </div>
        )}
      </div>
      <TransactionTable data={data} isExecuting={isExecuting} />
    </div>
  );
}
