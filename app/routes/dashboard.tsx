import { useState } from 'react';
import { useFetcher } from 'react-router';
import { Input } from '~/components/ui/input';
import { validateQuery } from '~/dsl/parser';
import { useDebounceQuery } from '~/hooks';
import type { Route } from '../+types/root';
import { processQuery, type QueryResult } from '../dsl/service';
import type { Transaction } from '../dsl/types';
import { TransactionTable } from '../components/transactions';

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

  const { isExecuting, data, error, cancel, flush } = useDebounceQuery(query);

  return (
    <div className="flex flex-1 flex-col p-4 gap-4">
      <Input onChange={(e) => setQuery(e.target.value)} />
      <TransactionTable data={data}/>
    </div>
  );
}
