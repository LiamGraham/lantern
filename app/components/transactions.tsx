import type { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import type { QueryResult } from '../dsl/service';
import type { Transaction } from '../dsl/types';
import { Button } from './ui/button';
import { DataTable } from './ui/data-table';

const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: 'attributes.createdAt',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ cell }) => {
      const date = new Date(cell.getValue() as string);
      const formatted = `${date.toLocaleDateString('en-AU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}, ${date.toLocaleTimeString()}`;
      return <div className="whitespace-nowrap">{formatted}</div>;
    },
    enableSorting: true,
    size: 50,
    minSize: 10,
    maxSize: 280,
  },
  {
    accessorKey: 'attributes.description',
    header: 'Description',
    cell: ({ cell }) => (
      <div className="truncate max-w-[300px]" title={cell.getValue() as string}>
        {cell.getValue() as string}
      </div>
    ),
    size: 300,
    minSize: 200,
  },
  {
    accessorKey: 'attributes.amount.valueInBaseUnits',
    header: 'Amount',
    cell: ({ cell }) => {
      const value = cell.getValue() as number;
      const isDebit = value < 0;
      const amount = Math.abs(value) / 100;
      const formatted = `${isDebit ? '-' : ''}$${amount}`;
      return (
        <div className={`itespace-nowrap ${isDebit ? 'text-red-500' : 'text-green-500'}`}>
          {formatted}
        </div>
      );
    },
    size: 120,
    minSize: 100,
    maxSize: 150,
  },
  {
    accessorKey: 'attributes.transactionType',
    header: 'Type',
    cell: ({ cell }) => (
      <div className="whitespace-nowrap">{cell.getValue() as string}</div>
    ),
    size: 140,
    minSize: 100,
    maxSize: 180,
  },
];

interface TransactionTableProps {
  data: QueryResult | null;
}

export function TransactionTable({ data }: TransactionTableProps) {
  const transactions = data?.success ? data.transactions : [];

  return (
    <div>
      <DataTable columns={columns} data={transactions} />
    </div>
  );
}
